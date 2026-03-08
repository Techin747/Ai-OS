// ===========================================
// 🛡️ CLAW OS - Error Handler
// ===========================================
// จัดการ Error ไม่ให้ระบบล่ม

const logger = require('./logger');

// Error กลาง - จับทุก Error ที่หลุด
function setupGlobalErrorHandlers() {
  process.on('uncaughtException', (error) => {
    logger.error('SYSTEM', 'Uncaught Exception!', error);
    // ไม่ exit - ให��ระบบทำงานต่อ
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('SYSTEM', 'Unhandled Promise Rejection!', reason);
  });

  logger.success('ERROR-HANDLER', 'Global error handlers registered');
}

// Wrapper สำหรับ async route handlers
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Express error middleware
function expressErrorHandler(err, req, res, next) {
  logger.error('EXPRESS', 'Request error', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
}

// Safe execution - รันฟังก์ชันแบบปลอดภัย
async function safeExecute(fn, fallback = null, context = 'UNKNOWN') {
  try {
    return await fn();
  } catch (error) {
    logger.error(context, 'Safe execution caught error', error);
    return fallback;
  }
}

module.exports = {
  setupGlobalErrorHandlers,
  asyncHandler,
  expressErrorHandler,
  safeExecute
};
