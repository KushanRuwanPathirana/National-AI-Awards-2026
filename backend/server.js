require('./config/env');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const logger = require('./utils/logger');
const { seedDefaultAdmin } = require('./scripts/seedAdmin');
const { seedCriteriaOnStartup } = require('./scripts/seedCriteria');

// ─── App Initialization ────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5001;

// ─── Connect to MongoDB ────────────────────────────────────────────────────────
connectDB().then(async () => {
  seedDefaultAdmin({ skipConnect: true }).catch((error) => {
    logger.error(`Default admin seeding skipped due to error: ${error.message}`);
  });
  seedCriteriaOnStartup().catch((error) => {
    logger.error(`Criteria seeding skipped due to error: ${error.message}`);
  });
  // Start the daily reminder service
  const { startReminderScheduler } = require('./services/reminder.service');
  startReminderScheduler();
}).catch(() => {
  // Database connection errors are already logged by connectDB
});

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body Parsers ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP Logger ───────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// ─── Static Files (Uploads) ────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  logger.info(`📡 API available at http://localhost:${PORT}/api`);
});

// ─── Graceful Shutdown ─────────────────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

module.exports = app;
