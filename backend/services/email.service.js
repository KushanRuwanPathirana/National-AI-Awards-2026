const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Creates a reusable Nodemailer transporter.
 * Defaults to Gmail; swap for SendGrid/SES in production.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a generic email.
 * @param {Object} options - { to, subject, html, text }
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: `"National AI Awards Sri Lanka" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  };
  const info = await transporter.sendMail(mailOptions);
  logger.info(`Email sent to ${to}: ${info.messageId}`);
  return info;
};

/**
 * Send an OTP verification code.
 */
const sendOTPEmail = async (user, otp) => {
  await sendEmail({
    to: user.email,
    subject: 'Verify Your Email — National AI Awards Sri Lanka',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1628; color: #e2e8f0; padding: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #00ff87; text-align: center;">National AI Awards Sri Lanka 🏆</h2>
        <p style="font-size: 16px; line-height: 1.5;">Hi ${user.firstName},</p>
        <p style="font-size: 16px; line-height: 1.5;">Thank you for registering. Please verify your email address by using the 6-digit One-Time Password (OTP) below:</p>
        <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 6px; color: #0072ff; font-family: monospace;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #94a3b8; text-align: center;">This code is valid for <strong>15 minutes</strong>. Do not share this OTP with anyone.</p>
        <hr style="border-color: rgba(255,255,255,0.1); margin: 30px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">National AI Awards Sri Lanka · Colombo, Sri Lanka</p>
      </div>
    `,
  });
};

/**
 * Send a welcome email to newly registered users.
 */
const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to National AI Awards Sri Lanka',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1628; color: #e2e8f0; padding: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #00ff87; text-align: center;">Welcome, ${user.firstName}! 🏆</h2>
        <p style="font-size: 16px; line-height: 1.5;">Your account has been created successfully for the <strong>National AI Awards Sri Lanka 2026</strong>.</p>
        <p style="font-size: 16px; line-height: 1.5;">Your email has been verified. You can now access your portal and start completing your nomination.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/login" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #0072ff 0%, #00ff87 100%); color: #0A1628; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 16px rgba(0,255,135,0.3);">
            Access Your Portal
          </a>
        </div>
        <hr style="border-color: rgba(255,255,255,0.1); margin: 30px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">National AI Awards Sri Lanka · Colombo, Sri Lanka</p>
      </div>
    `,
  });
};

/**
 * Send a password reset email.
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Password Reset — National AI Awards Sri Lanka',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0A1628; color: #e2e8f0; padding: 40px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #00ff87; text-align: center;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.5;">You requested a password reset for your AI Awards account.</p>
        <p style="font-size: 16px; line-height: 1.5;">Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #0072ff 0%, #00ff87 100%); color: #0A1628; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 16px rgba(0,255,135,0.3);">
            Reset Password
          </a>
        </div>
        <p style="margin-top: 20px; color: #64748b; font-size: 13px; text-align: center;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail, sendOTPEmail };
