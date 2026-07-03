// Application-wide constants

const ROLES = {
  ADMIN: 'admin',
  JUDGE: 'judge',
  CANDIDATE: 'candidate',
};

const APPLICATION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  UNDER_REVIEW: 'under_review',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  WINNER: 'winner',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
};

const JWT = {
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

const AWARD_CATEGORIES = [
  'AI in Healthcare',
  'AI in Finance & FinTech',
  'AI in Agriculture',
  'AI in Education',
  'AI in Manufacturing & Industry',
  'AI in Smart Cities & Infrastructure',
  'AI in Cybersecurity',
  'AI Innovation by SMEs',
  'AI Research Excellence',
  'AI Startup of the Year',
];

module.exports = {
  ROLES,
  APPLICATION_STATUS,
  PAGINATION,
  FILE_UPLOAD,
  JWT,
  AWARD_CATEGORIES,
};
