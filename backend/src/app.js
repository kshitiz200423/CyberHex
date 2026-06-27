const express = require('express');
const cookieParser = require('cookie-parser');
const {
  configureHelmet,
  configureCors,
  globalLimiter,
  xssSanitize,
  hppProtect,
} = require('./middleware/security');
const { csrfProtection } = require('./middleware/csrf');
const { requestLogger, notFound, globalErrorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const engagementRoutes = require('./routes/engagement.routes');
const reportRoutes = require('./routes/report.routes');
const findingRoutes = require('./routes/finding.routes');
const clientRoutes = require('./routes/client.routes');
const contactRoutes = require('./routes/contact.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const settingsRoutes = require('./routes/settings.routes');

const app = express();

// Enable trust proxy for express-rate-limit behind Railway load balancers
app.set('trust proxy', 1);

// ═══════════════════════════════════════════════════════════
// MIDDLEWARE STACK — applied in this exact security order
// ═══════════════════════════════════════════════════════════

// 1. Helmet — CSP, HSTS, X-Frame-Options, etc.
app.use(configureHelmet());

// 2. CORS — whitelist allowed origins
app.use(configureCors());

// 3. Request logger
app.use(requestLogger);

// 4. Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 5. Cookie parser
app.use(cookieParser());

// 6. XSS sanitization (custom, replaces deprecated xss-clean)
app.use(xssSanitize);

// 7. HPP protection (custom, replaces unmaintained hpp package)
app.use(hppProtect);

// 8. CSRF protection (double submit cookie)
app.use(csrfProtection);

// 9. Global rate limiter
app.use('/api/', globalLimiter);

// ═══════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════

// Health check (unauthenticated)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    data: {
      service: 'Auronix Technologies API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/engagements', engagementRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/findings', findingRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// ═══════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════

// 404 handler
app.use(notFound);

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
