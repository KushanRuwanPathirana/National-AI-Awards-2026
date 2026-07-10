const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

const getEmailAuth = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS?.replace(/\s/g, '');

  return { user, pass };
};

/**
 * Creates a reusable Nodemailer transporter.
 */
const createTransporter = () => {
  const { user, pass } = getEmailAuth();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Generic send email helper
 */
const sendEmail = async ({ to, subject, html }) => {
  const { user, pass } = getEmailAuth();

  if (!user || user === 'your_email@gmail.com' || !pass || pass === 'your_email_app_password') {
    throw new Error('Email credentials are not configured.');
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"National AI Awards Sri Lanka" <${user}>`,
    to,
    subject,
    html,
  });
};

/**
 * Send OTP verification email
 */
const sendOTPEmail = async (user, otp) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#818cf8;margin:0;">🏆 AI Awards Sri Lanka</h1>
        <p style="color:#94a3b8;font-size:13px;">Email Verification</p>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Your verification code is:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="background:#818cf8;color:#fff;font-size:28px;font-weight:800;letter-spacing:8px;padding:14px 32px;border-radius:12px;display:inline-block;">${otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:13px;">This code expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: '🔐 Verify Your Email — AI Awards Sri Lanka', html });
};

/**
 * Send welcome email after verification
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#818cf8;margin:0;">🏆 Welcome!</h1>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Your email has been verified successfully. You can now access the National AI Awards Sri Lanka 2026 portal.</p>
      <p style="color:#94a3b8;font-size:13px;">Login to your dashboard to start your application or manage your evaluations.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: '🎉 Welcome to AI Awards Sri Lanka 2026', html });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#818cf8;margin:0;">🔑 Password Reset</h1>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Click below to reset your password:</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${resetUrl}" style="background:#818cf8;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block;">Reset Password</a>
      </div>
      <p style="color:#94a3b8;font-size:13px;">This link expires in <strong>15 minutes</strong>. If you did not request this, please ignore.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: '🔑 Reset Your Password — AI Awards Sri Lanka', html });
};

/**
 * Send password reset OTP email
 */
const sendPasswordResetOTPEmail = async (user, otp) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#818cf8;margin:0;">Password Reset OTP</h1>
        <p style="color:#94a3b8;font-size:13px;">National AI Awards Sri Lanka 2026</p>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Use this one-time code to reset your password:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="background:#818cf8;color:#fff;font-size:28px;font-weight:800;letter-spacing:8px;padding:14px 32px;border-radius:12px;display:inline-block;">${otp}</span>
      </div>
      <p style="color:#94a3b8;font-size:13px;">This code expires in <strong>15 minutes</strong>. If you did not request this, you can ignore this email.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: 'Password Reset OTP — AI Awards Sri Lanka', html });
};

/**
 * Send confirmation after a password reset succeeds
 */
const sendPasswordResetSuccessEmail = async (user) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#818cf8;margin:0;">Password Reset Complete</h1>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Your National AI Awards Sri Lanka account password was reset successfully.</p>
      <p style="color:#94a3b8;font-size:13px;">If this was not you, please contact the awards support team immediately.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: 'Password Reset Complete — AI Awards Sri Lanka', html });
};

/**
 * Send confirmation after an authenticated password change succeeds
 */
const sendPasswordChangedEmail = async (user) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#818cf8;margin:0;">Password Changed</h1>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Your account password was changed successfully.</p>
      <p style="color:#94a3b8;font-size:13px;">If you did not make this change, reset your password immediately and contact the awards support team.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: 'Password Changed — AI Awards Sri Lanka', html });
};

/**
 * Send application status update email
 */
const sendApplicationStatusUpdate = async (user, application, newStatus) => {
  const statusLabels = {
    draft: 'Draft', submitted: 'Submitted', under_review: 'Under Review',
    eligible: 'Eligible', ineligible: 'Ineligible',
    initial_stage: 'Initial State', f2f_stage: 'Selected to Face-to-Face',
    finalist: 'Finalist', winner: '🏆 Winner', runner_up: '🥈 1st Runner-up', runner_up_2nd: '🥉 2nd Runner-up',
  };
  const label = statusLabels[newStatus] || newStatus;
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#818cf8;margin:0;">📋 Application Update</h1>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>Your application <strong>"${application.projectTitle}"</strong> status has been updated to:</p>
      <div style="text-align:center;margin:20px 0;">
        <span style="background:#818cf8;color:#fff;padding:10px 24px;border-radius:8px;font-weight:700;display:inline-block;">${label}</span>
      </div>
      ${application.referenceNumber ? `<p style="color:#94a3b8;font-size:13px;">Reference: ${application.referenceNumber}</p>` : ''}
      <p style="color:#94a3b8;font-size:13px;">Login to your dashboard for more details.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: `📋 Application Status: ${label} — AI Awards`, html });
};

/**
 * Send judge assignment notification email
 */
const sendJudgeInvitation = async (judge, application) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#818cf8;margin:0;">⚖️ New Assignment</h1>
      </div>
      <p>Hi <strong>${judge.firstName}</strong>,</p>
      <p>You have been assigned to evaluate the following application:</p>
      <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Project:</strong> ${application.projectTitle}</p>
        <p style="margin:4px 0;color:#94a3b8;font-size:13px;"><strong>Reference:</strong> ${application.referenceNumber || 'N/A'}</p>
      </div>
      <p style="color:#94a3b8;font-size:13px;">Login to your Judge Portal to begin your evaluation.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: judge.email, subject: '⚖️ New Evaluation Assignment — AI Awards', html });
};

/**
 * Send reminder email to judges with assigned nomination evaluations still pending
 */
const sendJudgeReminder = async (judge, pendingCount, deadlineStr, projectTitle = null) => {
  const deadlineDate = deadlineStr ? new Date(deadlineStr) : null;
  const formattedDeadline = deadlineDate ? deadlineDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const dashboardUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/judge-dashboard`;
  
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:520px;margin:auto;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#f59e0b;margin:0;">⚠️ Pending Nomination Evaluation</h1>
      </div>
      <p>Hi <strong>${judge.firstName}</strong>,</p>
      <p>This is a reminder that <strong>${pendingCount}</strong> nomination evaluation(s) assigned to you have not been submitted yet.</p>
      ${projectTitle ? `
      <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:16px;margin:16px 0;">
        <p style="margin:4px 0;"><strong>Pending Nomination:</strong> ${projectTitle}</p>
        <p style="margin:4px 0;font-size:14px;color:#f59e0b;"><strong>Closest Due Date:</strong> ${formattedDeadline}</p>
      </div>
      ` : `
      <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:16px;margin:16px 0;text-align:center;">
        <p style="margin:4px 0;font-size:14px;color:#f59e0b;"><strong>Due Date:</strong> ${formattedDeadline}</p>
      </div>
      `}
      <p style="color:#94a3b8;font-size:13px;">Please log in to the Judge Portal to review the criteria and submit your scorecards.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${dashboardUrl}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Open Judge Portal</a>
      </div>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: judge.email, subject: '⚠️ Action Required: Pending Nomination Evaluation — AI Awards', html });
};

/**
 * Send admin broadcast email
 */
const sendBroadcastEmail = async (user, { title, message, link }) => {
  const dashboardUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}${link || '/dashboard'}`;
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:auto;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <h1 style="color:#818cf8;margin:0;">National AI Awards Sri Lanka</h1>
        <p style="color:#94a3b8;font-size:13px;">Broadcast Alert</p>
      </div>
      <p>Hi <strong>${user.firstName || 'there'}</strong>,</p>
      <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:18px;margin:18px 0;">
        <h2 style="color:#f8fafc;font-size:18px;margin:0 0 12px;">${title}</h2>
        <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0;">${message}</p>
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${dashboardUrl}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">Open Dashboard</a>
      </div>
      <p style="color:#94a3b8;font-size:13px;">You can also view this alert in your portal notifications.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;

  await sendEmail({ to: user.email, subject: title, html });
};

/**
 * Send winner congratulation email
 */
const sendWinnerEmail = async (user, application, categoryName) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:auto;padding:30px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:64px;margin-bottom:12px;">🏆</div>
        <h1 style="color:#ffd700;margin:0;font-size:28px;">Congratulations!</h1>
        <p style="color:#94a3b8;font-size:14px;margin-top:8px;">You are a Winner</p>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>We are thrilled to announce that your project has been selected as a <strong style="color:#ffd700;">Winner</strong> in the National AI Awards Sri Lanka 2026!</p>
      <div style="background:linear-gradient(135deg,#ffd70020,#ffed4e10);border:2px solid #ffd700;border-radius:12px;padding:20px;margin:20px 0;">
        <p style="margin:8px 0;"><strong>Project:</strong> ${application.projectTitle}</p>
        <p style="margin:8px 0;color:#94a3b8;font-size:13px;"><strong>Reference:</strong> ${application.referenceNumber || 'N/A'}</p>
        <p style="margin:8px 0;color:#94a3b8;font-size:13px;"><strong>Category:</strong> ${categoryName || 'N/A'}</p>
      </div>
      <p>Your outstanding innovation and dedication to AI excellence have set you apart. This achievement recognizes your significant contribution to advancing AI in Sri Lanka.</p>
      <p style="color:#94a3b8;font-size:13px;">Please log in to your dashboard for further details about the award ceremony and next steps.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: '🏆 Congratulations! You\'re a Winner — National AI Awards 2026', html });
};

/**
 * Send finalist congratulation email
 */
const sendFinalistEmail = async (user, application, categoryName) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:auto;padding:30px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:64px;margin-bottom:12px;">🌟</div>
        <h1 style="color:#818cf8;margin:0;font-size:28px;">Congratulations!</h1>
        <p style="color:#94a3b8;font-size:14px;margin-top:8px;">You are a Finalist</p>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>We are delighted to inform you that your project has been selected as a <strong style="color:#818cf8;">Finalist</strong> in the National AI Awards Sri Lanka 2026!</p>
      <div style="background:linear-gradient(135deg,#818cf820,#a5b4fc10);border:2px solid #818cf8;border-radius:12px;padding:20px;margin:20px 0;">
        <p style="margin:8px 0;"><strong>Project:</strong> ${application.projectTitle}</p>
        <p style="margin:8px 0;color:#94a3b8;font-size:13px;"><strong>Reference:</strong> ${application.referenceNumber || 'N/A'}</p>
        <p style="margin:8px 0;color:#94a3b8;font-size:13px;"><strong>Category:</strong> ${categoryName || 'N/A'}</p>
      </div>
      <p>Your exceptional work and innovative approach have earned you this recognition among the top AI projects in Sri Lanka. Being a finalist is a significant achievement.</p>
      <p style="color:#94a3b8;font-size:13px;">Please log in to your dashboard for further details about the awards ceremony and next steps.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: '🌟 Congratulations! You\'re a Finalist — National AI Awards 2026', html });
};

/**
 * Send runner-up congratulation email
 */
const sendRunnerUpEmail = async (user, application, categoryName) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:auto;padding:30px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:64px;margin-bottom:12px;">🥈</div>
        <h1 style="color:#c0c0c0;margin:0;font-size:28px;">Congratulations!</h1>
        <p style="color:#94a3b8;font-size:14px;margin-top:8px;">1st Runner-Up</p>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>We are pleased to announce that your project has been selected as the <strong style="color:#c0c0c0;">1st Runner-Up</strong> in the National AI Awards Sri Lanka 2026!</p>
      <div style="background:linear-gradient(135deg,#c0c0c020,#e5e7eb10);border:2px solid #c0c0c0;border-radius:12px;padding:20px;margin:20px 0;">
        <p style="margin:8px 0;"><strong>Project:</strong> ${application.projectTitle}</p>
        <p style="margin:8px 0;color:#94a3b8;font-size:13px;"><strong>Reference:</strong> ${application.referenceNumber || 'N/A'}</p>
        <p style="margin:8px 0;color:#94a3b8;font-size:13px;"><strong>Category:</strong> ${categoryName || 'N/A'}</p>
      </div>
      <p>Your remarkable achievement and dedication to AI innovation have earned you this prestigious recognition. Your contribution to Sri Lanka's AI ecosystem is truly commendable.</p>
      <p style="color:#94a3b8;font-size:13px;">Please log in to your dashboard for further details about the award ceremony and next steps.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: '🥈 Congratulations! 1st Runner-Up — National AI Awards 2026', html });
};

const sendRunnerUp2ndEmail = async (user, application, categoryName) => {
  const html = `
    <div style="font-family:'Segoe UI',sans-serif;max-width:560px;margin:auto;padding:30px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;color:#e2e8f0;">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:64px;margin-bottom:12px;">🥉</div>
        <h1 style="color:#cd7f32;margin:0;font-size:28px;">Congratulations!</h1>
        <p style="color:#94a3b8;font-size:14px;margin-top:8px;">2nd Runner-Up</p>
      </div>
      <p>Hi <strong>${user.firstName}</strong>,</p>
      <p>We are pleased to announce that your project has been selected as the <strong style="color:#cd7f32;">2nd Runner-Up</strong> in the National AI Awards Sri Lanka 2026!</p>
      <div style="background:linear-gradient(135deg,#cd7f3220,#e5e7eb10);border:2px solid #cd7f32;border-radius:12px;padding:20px;margin:20px 0;">
        <p style="margin:8px 0;"><strong>Project:</strong> ${application.projectTitle}</p>
        <p style="margin:8px 0;color:#94a3b8;font-size:13px;"><strong>Reference:</strong> ${application.referenceNumber || 'N/A'}</p>
        <p style="margin:8px 0;color:#94a3b8;font-size:13px;"><strong>Category:</strong> ${categoryName || 'N/A'}</p>
      </div>
      <p>Your remarkable achievement and dedication to AI innovation have earned you this prestigious recognition. Your contribution to Sri Lanka's AI ecosystem is truly commendable.</p>
      <p style="color:#94a3b8;font-size:13px;">Please log in to your dashboard for further details about the award ceremony and next steps.</p>
      <hr style="border:1px solid #334155;margin:24px 0;">
      <p style="color:#64748b;font-size:11px;text-align:center;">National AI Awards Sri Lanka 2026</p>
    </div>`;
  await sendEmail({ to: user.email, subject: '🥉 Congratulations! 2nd Runner-Up — National AI Awards 2026', html });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetOTPEmail,
  sendPasswordResetSuccessEmail,
  sendPasswordChangedEmail,
  sendApplicationStatusUpdate,
  sendJudgeInvitation,
  sendJudgeReminder,
  sendBroadcastEmail,
  sendWinnerEmail,
  sendFinalistEmail,
  sendRunnerUpEmail,
  sendRunnerUp2ndEmail,
};
