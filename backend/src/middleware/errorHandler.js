// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Error Handling & Logging Middleware
// ═══════════════════════════════════════════════════════════════

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ── AppError Class ───────────────────────────────────────────

class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {boolean} [isOperational=true] - Whether this is an expected/operational error
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// ── Global Error Handler ─────────────────────────────────────

function globalErrorHandler(err, _req, res, _next) {
  err.statusCode = err.statusCode || 500;

  // Prisma known errors
  if (err.code === 'P2002') {
    err.statusCode = 409;
    err.message = 'A record with this value already exists.';
    err.isOperational = true;
  }

  if (err.code === 'P2025') {
    err.statusCode = 404;
    err.message = 'Record not found.';
    err.isOperational = true;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    err.statusCode = 401;
    err.message = 'Invalid token.';
    err.isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    err.statusCode = 401;
    err.message = 'Token expired.';
    err.isOperational = true;
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    err.statusCode = 413;
    err.message = 'File size exceeds the maximum allowed limit.';
    err.isOperational = true;
  }

  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    err.statusCode = 403;
    err.isOperational = true;
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    err.statusCode = 400;
    err.message = 'Validation failed.';
    err.isOperational = true;
  }

  const response = {
    status: 'error',
    message: err.isOperational ? err.message : 'An unexpected error occurred.',
  };

  // Include stack trace in development only
  if (!IS_PRODUCTION && err.stack) {
    response.stack = err.stack;
  }

  // Include validation errors if present
  if (err.errors) {
    response.errors = err.errors;
  }

  // Log programmer errors (non-operational) to stderr
  if (!err.isOperational) {
    process.stderr.write(`[Auronix ERROR] ${err.stack || err.message}\n`);
  }

  res.status(err.statusCode).json(response);
}

// ── Not Found Handler ────────────────────────────────────────

function notFound(req, res, _next) {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

// ── Request Logger ───────────────────────────────────────────

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLine = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
    process.stderr.write(`[Auronix] ${logLine}\n`);
  });

  next();
}

// ── Audit Log Middleware ─────────────────────────────────────

/**
 * Create an audit log entry after route handler completes
 * @param {string} action - Action name (e.g., 'LOGIN', 'CREATE_ENGAGEMENT')
 */
function auditLog(action) {
  return (req, res, next) => {
    res.on('finish', () => {
      // Only log if user is authenticated
      if (req.user?.userId) {
        prisma.auditLog
          .create({
            data: {
              action,
              userId: req.user.userId,
              resourceId: req.params.id || null,
              ip: req.ip || 'unknown',
              userAgent: req.headers['user-agent'] || 'unknown',
              statusCode: res.statusCode,
            },
          })
          .catch(() => {
            // Audit log failures should not crash the application
          });
      }
    });

    next();
  };
}

module.exports = {
  AppError,
  globalErrorHandler,
  notFound,
  requestLogger,
  auditLog,
};
