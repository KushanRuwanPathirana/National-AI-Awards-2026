const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'application_created',
        'application_updated',
        'application_submitted',
        'status_changed',
        'judge_assigned',
        'judge_removed',
        'evaluation_submitted',
        'user_created',
        'user_updated',
        'user_deactivated',
        'user_deleted',
        'category_created',
        'category_updated',
        'category_deleted',
        'admin_action',
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetModel: {
      type: String, // 'Application', 'User', 'Category', etc.
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ targetModel: 1, targetId: 1 });
auditLogSchema.index({ action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
