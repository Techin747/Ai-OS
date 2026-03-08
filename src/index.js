// ===========================================
// 🚀 CLAW PERSONAL OS - Main Entry Point
// ===========================================
// Version: 1.0.0 (Phase 1: Foundation)
// "สมองและปาก" - Smart Conversation + LINE Integration
//
// Features Active:
//   💬 [13] LINE Personal Assistant
//   🗣  [22] Natural Language Understanding
//   🧠 [1]  Smart Conversation AI
//   🧑‍💻 [27] AI Co-Pilot
//   🧠 [24] Context Memory (Short-term)
// ===========================================

const express = require('express');
const line = require('@line/bot-sdk');

// Config & Utils
const { config, validateEnvironment } = require('./config/environment');
const logger = require('./utils/logger');
const { setupGlobalErrorHandlers, expressErrorHandler } = require('./utils/errorHandler');

// Core Modules
const { connectMongoDB } = require('./memory/mongoClient');
const { initGemini, testConnection } = require('./ai/geminiClient');
const { createLineClient } = require('./line/lineClient');
const { handleWebhook } = require('./line/lineWebhook');

// ===========================================
// 🏗️ App Initialization
// ===========================================

const app = express();

async function startClawOS() {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║                                          ║
  ║     🤖 CLAW PERSONAL OS v1.0.0          ║
  ║     Phase 1: Foundation                  ║
  ║     "Building Brain & Voice"             ║
  ║                                          ║
  ╚══════════════════════════════════════════╝
  `);

  // 1. ตรวจสอบ Environment Variables
  validateEnvironment();

  // 2. Setup Global Error Handlers
  setupGlobalErrorHandlers();

  // 3. เชื่อมต่อ MongoDB
  logger.info('BOOT', '📦 Connecting to MongoDB...');
  await connectMongoDB();

  // 4. เริ่มต้น Gemini AI
  logger.info('BOOT', '🧠 Initializing Gemini AI...');
  initGemini();
  await testConnection();

  // 5. เริ่มต้น LINE Client
  logger.info('BOOT', '📱 Initializing LINE Client...');
  createLineClient();

  // ===========================================
  // 🛣️ Express Routes
  // ===========================================

  // Health Check & Wake Up Endpoint (สำหรับ cron-job.org)
  app.get('/', (req, res) => {
    res.json({
      status: 'alive',
      name: `${config.app.botName} Personal OS`,
      version: '1.0.0',
      phase: '1 - Foundation',
      uptime: `${Math.floor(process.uptime() / 60)} minutes`,
      timestamp: new Date().toISOString()
    });
  });

  // Health Check endpoint (สำรอง)
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      services: {
        server: 'up',
        ai: 'ready',
        database: 'connected'
      }
    });
  });

  // ===========================================
  // 📱 LINE Webhook Endpoint
  // ===========================================

  // LINE Signature Verification Middleware
  // ⚠️ สำคัญ: ต้องใช้ raw body สำหรับ verify signature
  app.post('/webhook',
    line.middleware({
      channelSecret: config.line.channelSecret
    }),
    async (req, res) => {
      try {
        logger.info('SERVER', `📨 Webhook received: ${req.body.events.length} event(s)`);

        // ส่ง 200 OK ทันที (LINE ต้องการ response ภายใน 1 วินาที)
        res.status(200).json({ status: 'ok' });

        // ประมวลผล events แบบ async (ไม่ block response)
        if (req.body.events.length > 0) {
          handleWebhook(req.body.events).catch(error => {
            logger.error('SERVER', 'Webhook processing error', error);
          });
        }
      } catch (error) {
        logger.error('SERVER', 'Webhook endpoint error', error);
        if (!res.headersSent) {
          res.status(500).json({ status: 'error' });
        }
      }
    }
  );

  // Error Handler
  app.use(expressErrorHandler);

  // ===========================================
  // 🚀 Start Server
  // ===========================================

  app.listen(config.app.port, () => {
    logger.success('BOOT', `
  ✨ ${config.app.botName} Personal OS is ONLINE!
  🌐 Server: http://localhost:${config.app.port}
  📱 LINE Webhook: /webhook
  🏥 Health Check: /health
  🧠 AI Model: ${config.gemini.model}
  💾 Database: MongoDB Atlas
  🔧 Environment: ${config.app.nodeEnv}
    `);
  });
}

// ===========================================
// 🎬 Launch!
// ===========================================

startClawOS().catch(error => {
  logger.error('BOOT', 'Failed to start Claw OS!', error);
  process.exit(1);
});
