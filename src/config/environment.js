// ===========================================
// 🔧 CLAW OS - Environment Configuration
// ===========================================
// จัดการ Environment Variables ทั้งหมดจากจุดเดียว
// ถ้าตัวไหนหายไป ระบบจะเตือนทันที

const dotenv = require('dotenv');
dotenv.config();

const requiredEnvVars = [
  'LINE_ACCESS_TOKEN',
  'LINE_SECRET',
  'GEMINI_API_KEY',
  'MONGODB_URI'
];

// ตรวจสอบว่า ENV ครบไหม
function validateEnvironment() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }
  console.log('✅ All environment variables loaded successfully');
}

const config = {
  // LINE Config
  line: {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_SECRET
  },

  // Gemini Config
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-2.5-flash',        // โมเดลฟรีที่เร็วและฉลาด
    maxOutputTokens: 1024,              // จำกัดความยาวคำตอบ
    temperature: 0.8                    // ความคิดสร้างสรรค์ (0-1)
  },

  // MongoDB Config
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: 'claw-os'
  },

  // App Config
  app: {
    port: parseInt(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'production',
    botName: process.env.BOT_NAME || 'Claw',
    ownerName: process.env.OWNER_NAME || 'Boss'
  },

  // Memory Config
  memory: {
    maxChatHistory: 20,                 // เก็บแชทล่าสุดกี่ข้อความเป็น Context
    maxContextTokens: 4000              // จำกัด Token สำหรับ Context
  }
};

module.exports = { config, validateEnvironment };
