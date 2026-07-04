const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// @desc    Handle contact form submission
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, { statusCode: 422, message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, subject, message, phone } = req.body;

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS?.replace(/\s/g, ''),
      },
    });

    const mailOptions = {
      from: `"AI Awards Sri Lanka" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `[Contact Form] ${subject || 'New Enquiry'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366F1;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${email}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${phone || 'Not provided'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Subject:</td><td style="padding: 8px;">${subject || 'General Enquiry'}</td></tr>
          </table>
          <h3>Message:</h3>
          <p style="background: #f5f5f5; padding: 16px; border-radius: 8px;">${message}</p>
          <hr>
          <p style="color: #888; font-size: 12px;">Sent via AI Awards Sri Lanka contact form.</p>
        </div>
      `,
    };

    // Auto-reply to sender
    const autoReplyOptions = {
      from: `"AI Awards Sri Lanka" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Thank you for contacting AI Awards Sri Lanka',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366F1;">Thank You, ${name}!</h2>
          <p>We have received your enquiry and will get back to you within 1–2 business days.</p>
          <p>Best regards,<br><strong>AI Awards Sri Lanka Team</strong></p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    await transporter.sendMail(autoReplyOptions);

    logger.info(`Contact form submitted by ${email}`);

    return successResponse(res, {
      message: 'Your message has been sent successfully. We will get back to you shortly.',
    });
  } catch (error) {
    logger.error(`Contact form error: ${error.message}`);
    next(error);
  }
};

module.exports = { submitContact };
