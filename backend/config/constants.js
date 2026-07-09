// Application-wide constants

const ROLES = {
  ADMIN: 'admin',
  JUDGE: 'judge',
  CANDIDATE: 'candidate',
};

// Allowed status transitions for the workflow engine
const ALLOWED_TRANSITIONS = {
  draft:        ['submitted'],
  submitted:    ['under_review', 'draft'],
  under_review: ['eligible', 'ineligible'],
  eligible:     ['initial_stage', 'under_review'],
  ineligible:   ['under_review'],
  initial_stage: ['f2f_stage', 'eligible'],
  f2f_stage:    ['finalist', 'initial_stage'],
  finalist:     ['winner', 'runner_up', 'f2f_stage'],
  winner:       [],
  runner_up:    [],
};

const APPLICATION_STATUS = {
  DRAFT:        'draft',
  SUBMITTED:    'submitted',
  UNDER_REVIEW: 'under_review',
  ELIGIBLE:     'eligible',
  INELIGIBLE:   'ineligible',
  INITIAL_STAGE: 'initial_stage',
  F2F_STAGE:    'f2f_stage',
  FINALIST:     'finalist',
  WINNER:       'winner',
  RUNNER_UP:    'runner_up',
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
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
};

const APPLICATION_DEADLINE = {
  // Applications close at the end of 15 August 2026 in Sri Lanka time.
  CLOSES_AT: process.env.APPLICATION_DEADLINE || '2026-08-16T00:00:00+05:30',
  DISPLAY_DATE: '15 August 2026',
};

const AWARD_CATEGORIES = [
  'National AI Excellence Award',
  'National AI Leadership Excellence Award',
  'National AI Impact Excellence Award',
  'National AI Export Excellence Award',
  'Best AI Solution in Agriculture',
  'Best AI Solution in Banking, Finance & Insurance',
  'Best AI Solution in Healthcare & Life Sciences',
  'Best AI Solution in Export Development',
  'Best AI Solution in Education',
  'Best AI Solution in Manufacturing & Industry 5.0',
  'Best AI Startup / MSME Innovation',
  'Best Agentic AI Solution',
  'Best Sinhala/Tamil AI & Localisation Innovation',
  'University AI Innovation',
  'Women in AI Leadership',
];

const INDIVIDUAL_CATEGORIES = [
  'National AI Leadership Excellence Award',
  'Women in AI Leadership',
];

const MAIN_CATEGORIES_MAP = {
  'National AI Trailblazer Awards': [
    'National AI Excellence Award',
    'National AI Leadership Excellence Award',
    'National AI Impact Excellence Award',
    'National AI Export Excellence Award',
    'Women in AI Leadership',
  ],
  'Industry & Sector Excellence Awards': [
    'Best AI Solution in Agriculture',
    'Best AI Solution in Banking, Finance & Insurance',
    'Best AI Solution in Healthcare & Life Sciences',
    'Best AI Solution in Export Development',
    'Best AI Solution in Education',
    'Best AI Solution in Manufacturing & Industry 5.0',
  ],
  'Innovation & Future-Focused Awards': [
    'Best AI Startup / MSME Innovation',
    'Best Agentic AI Solution',
    'Best Sinhala/Tamil AI & Localisation Innovation',
    'University AI Innovation',
  ],
};

module.exports = {
  ROLES,
  APPLICATION_STATUS,
  ALLOWED_TRANSITIONS,
  PAGINATION,
  FILE_UPLOAD,
  JWT,
  APPLICATION_DEADLINE,
  AWARD_CATEGORIES,
  INDIVIDUAL_CATEGORIES,
  MAIN_CATEGORIES_MAP,
};
