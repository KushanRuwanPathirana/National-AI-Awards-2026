const crypto = require("crypto");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const Application = require("../models/Application.model");

const getPayHereParams = async (req, res, next) => {
  try {
    const { applicationId } = req.body;

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
      return_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard?payment=cancel`,
      notify_url: `${process.env.BACKEND_BASE_URL}/api/payment/notify`,
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
  getPayHereParams,
  handlePayHereNotification,
};
