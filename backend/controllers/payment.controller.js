const crypto = require("crypto");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const Application = require("../models/Application.model");
const Notification = require("../models/Notification.model");
const { sendEmail } = require("../services/email.service");

// ── Get All Payment Submissions for Admin ──────────────────────────────────────
const getPaymentSubmissions = async (req, res, next) => {
  try {
    const { 
      status, 
      category, 
      search, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 20 
    } = req.query;

    const filter = {
      paymentMethod: { $in: ['transfer', 'online'] },
    };

    if (status && status !== 'all') {
      filter.paymentStatus = status;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { 'candidate.firstName': { $regex: search, $options: 'i' } },
        { 'candidate.lastName': { $regex: search, $options: 'i' } },
        { 'candidate.email': { $regex: search, $options: 'i' } },
        { organisationName: { $regex: search, $options: 'i' } },
        { paymentReference: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter['paymentSlip.uploadedAt'] = {};
      if (startDate) filter['paymentSlip.uploadedAt'].$gte = new Date(startDate);
      if (endDate) filter['paymentSlip.uploadedAt'].$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('candidate', 'firstName lastName email phone')
        .populate('category', 'name')
        .populate('verifiedBy', 'firstName lastName')
        .populate('rejectedBy', 'firstName lastName')
        .sort({ 'paymentSlip.uploadedAt': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(filter),
    ]);

    return successResponse(res, {
      data: {
        applications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Payment Details by ID ───────────────────────────────────────────────────
const getPaymentDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('candidate', 'firstName lastName email phone')
      .populate('category', 'name')
      .populate('verifiedBy', 'firstName lastName')
      .populate('rejectedBy', 'firstName lastName');

    if (!application) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Application not found.',
      });
    }

    return successResponse(res, {
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

// ── Approve Payment ───────────────────────────────────────────────────────────
const approvePayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminRemarks } = req.body;

    const application = await Application.findById(id).populate('candidate');

    if (!application) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Application not found.',
      });
    }

    if (application.paymentStatus === 'approved') {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Payment has already been approved.',
      });
    }

    // Update payment status
    application.paymentStatus = 'approved';
    application.verificationStatus = 'verified';
    application.verifiedBy = req.user._id;
    application.verifiedAt = new Date();
    application.adminRemarks = adminRemarks || '';
    application.paymentVerificationHistory.push({
      action: 'approved',
      performedBy: req.user._id,
      performedAt: new Date(),
      remarks: adminRemarks || '',
    });

    // Move to initial stage if not already there
    if (application.status === 'submitted' || application.status === 'under_review') {
      application.status = 'initial_stage';
      application.statusHistory.push({
        status: 'initial_stage',
        changedBy: req.user._id,
        note: 'Payment approved - moved to initial stage',
        changedAt: new Date(),
      });
    }

    await application.save();

    // Create notification for candidate
    await Notification.create({
      recipient: application.candidate._id,
      type: 'application_status_changed',
      title: 'Payment Verified Successfully',
      message: `Your payment for ${application.projectTitle} has been successfully verified. Your nomination is now eligible for evaluation.`,
      link: `/dashboard/applications/${application._id}`,
      relatedApplication: application._id,
    });

    // Send approval email
    try {
      await sendEmail({
        to: application.candidate.email,
        subject: 'Payment Verified Successfully - National AI Awards 2026',
        template: 'payment-approved',
        data: {
          candidateName: application.candidate.firstName,
          projectTitle: application.projectTitle,
          categoryName: application.category?.name || 'N/A',
          referenceNumber: application.referenceNumber,
        },
      });
    } catch (emailError) {
      console.error('Failed to send payment approval email:', emailError);
    }

    return successResponse(res, {
      message: 'Payment approved successfully.',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

// ── Reject Payment ────────────────────────────────────────────────────────────
const rejectPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Rejection reason is required.',
      });
    }

    const application = await Application.findById(id).populate('candidate');

    if (!application) {
      return errorResponse(res, {
        statusCode: 404,
        message: 'Application not found.',
      });
    }

    if (application.paymentStatus === 'rejected') {
      return errorResponse(res, {
        statusCode: 400,
        message: 'Payment has already been rejected.',
      });
    }

    // Update payment status
    application.paymentStatus = 'rejected';
    application.verificationStatus = 'rejected';
    application.rejectedBy = req.user._id;
    application.rejectedAt = new Date();
    application.rejectionReason = rejectionReason;
    application.paymentVerificationHistory.push({
      action: 'rejected',
      performedBy: req.user._id,
      performedAt: new Date(),
      reason: rejectionReason,
    });

    await application.save();

    // Create notification for candidate
    await Notification.create({
      recipient: application.candidate._id,
      type: 'application_status_changed',
      title: 'Payment Verification Required',
      message: `Your payment for ${application.projectTitle} could not be verified. Reason: ${rejectionReason}. Please upload a new payment slip.`,
      link: `/dashboard/applications/${application._id}`,
      relatedApplication: application._id,
    });

    // Send rejection email
    try {
      await sendEmail({
        to: application.candidate.email,
        subject: 'Payment Verification Required - National AI Awards 2026',
        template: 'payment-rejected',
        data: {
          candidateName: application.candidate.firstName,
          projectTitle: application.projectTitle,
          rejectionReason,
          referenceNumber: application.referenceNumber,
        },
      });
    } catch (emailError) {
      console.error('Failed to send payment rejection email:', emailError);
    }

    return successResponse(res, {
      message: 'Payment rejected successfully.',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get Payment Statistics ─────────────────────────────────────────────────────
const getPaymentStats = async (req, res, next) => {
  try {
    const [pending, approved, rejected, total] = await Promise.all([
      Application.countDocuments({ paymentStatus: 'pending' }),
      Application.countDocuments({ paymentStatus: 'approved' }),
      Application.countDocuments({ paymentStatus: 'rejected' }),
      Application.countDocuments({
        paymentMethod: { $in: ['transfer', 'online'] },
        paymentSlip: { $exists: true, $ne: null },
      }),
    ]);

    return successResponse(res, {
      data: {
        stats: {
          pending,
          approved,
          rejected,
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPayHereParams = async (req, res, next) => {
  try {
    const { applicationId } = req.body;

    if (!applicationId) {
      return errorResponse(res, {
        statusCode: 400,
        message: "Application ID is required.",
      });
    }

    const application =
      await Application.findById(applicationId).populate("candidate");
    if (!application) {
      return errorResponse(res, {
        statusCode: 404,
        message: "Application not found.",
      });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const amount = "25000.00";
    const currency = "LKR";

    if (!merchantId || !merchantSecret) {
      if (process.env.NODE_ENV === "production") {
        return errorResponse(res, {
          statusCode: 503,
          message: "Payment gateway is not configured. Please contact support.",
        });
      }

      return successResponse(res, {
        message: "PayHere is not configured. Using local mock payment.",
        data: {
          mock: true,
          order_id: `NAIA2026-MOCK-${applicationId.toString().slice(-6)}`,
          amount,
          currency,
        },
      });
    }

    // Unique Short Order ID
    const orderId = `NAIA2026X${applicationId.toString().slice(-6)}X${Math.floor(1000 + Math.random() * 9000)}`;

    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const hashString =
      merchantId.toString().trim() +
      orderId.toString().trim() +
      amount.toString().trim() +
      currency.toString().trim() +
      hashedSecret;

    const hash = crypto
      .createHash("md5")
      .update(hashString)
      .digest("hex")
      .toUpperCase();

    const paymentParams = {
      sandbox: process.env.PAYHERE_SANDBOX === "true",
      merchant_id: merchantId,
      return_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard?payment=cancel`,
      notify_url: `${process.env.BACKEND_BASE_URL || `http://localhost:${process.env.PORT || 5001}`}/api/payment/notify`,
      order_id: orderId,
      items: `National AI Awards Registration`,
      amount: amount,
      currency: currency,
      hash: hash,
      first_name: req.user?.firstName || "Candidate",
      last_name: req.user?.lastName || "User",
      email: req.user?.email || "test@example.com",
      phone: application.primaryContactPhone || "0771234567",
      address: application.organisationName || "Sri Lanka",
      city: "Colombo",
      country: "Sri Lanka",
    };

    return successResponse(res, {
      message: "PayHere parameters generated.",
      data: paymentParams,
    });
  } catch (error) {
    next(error);
  }
};

const handlePayHereNotification = async (req, res, next) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;

    const hashedSecret = crypto
      .createHash("md5")
      .update(merchantSecret)
      .digest("hex")
      .toUpperCase();

    const localHashString =
      merchant_id +
      order_id +
      payhere_amount +
      payhere_currency +
      status_code +
      hashedSecret;

    const localHash = crypto
      .createHash("md5")
      .update(localHashString)
      .digest("hex")
      .toUpperCase();

    if (localHash === md5sig && status_code === "2") {
      const parts = order_id.split("X");
      // Extract application lookup criteria if needed

      // Update your DB status here
      return res.status(200).send("OK");
    }

    return res.status(400).send("Invalid Signature or Status");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPaymentSubmissions,
  getPaymentDetails,
  approvePayment,
  rejectPayment,
  getPaymentStats,
  getPayHereParams,
  handlePayHereNotification,
};
