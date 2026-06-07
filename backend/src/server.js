// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Server Entry Point
// ═══════════════════════════════════════════════════════════════

require('dotenv').config();

const app = require('./app');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// Attach prisma to app for use in routes
app.set('prisma', prisma);

const PORT = parseInt(process.env.PORT, 10) || 4000;

let server;

async function startServer() {
  try {
    await prisma.$connect();
    process.stderr.write(`[HexaShield] Database connected\n`);

    server = app.listen(PORT, () => {
      process.stderr.write(`[HexaShield] Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})\n`);
    });

    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
  } catch (err) {
    process.stderr.write(`[HexaShield] Failed to start: ${err.message}\n`);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// ── Graceful Shutdown ────────────────────────────────────────

async function gracefulShutdown(signal) {
  process.stderr.write(`[HexaShield] ${signal} received, shutting down gracefully...\n`);

  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.stderr.write(`[HexaShield] Server closed\n`);
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      process.stderr.write(`[HexaShield] Forced shutdown after timeout\n`);
      process.exit(1);
    }, 10000).unref();
  } else {
    await prisma.$disconnect();
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  process.stderr.write(`[HexaShield] Unhandled Rejection: ${reason}\n`);
  gracefulShutdown('UNHANDLED_REJECTION');
});

process.on('uncaughtException', (err) => {
  process.stderr.write(`[HexaShield] Uncaught Exception: ${err.message}\n`);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

startServer();
