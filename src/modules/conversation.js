// ===========================================
// 💬 CLAW OS - Conversation Module
// ===========================================
// จัดการการสนทนาหลัก
// ฟีเจอร์ #1 Smart Conversation AI

const { chat } = require('../ai/geminiClient');
const { saveMessage } = require('../memory/chatHistory');
const { getOrCreateProfile } = require('../memory/userProfile');
const { classifyIntent, INTENTS } = require('../ai/intentClassifier');
const coPilot = require('./coPilot');
const logger = require('../utils/logger');
const { config } = require('../config/environment');

/**
 * ประมวลผลข้อความจากผู้ใช้ - Flow หลักของระบบ
 */
async function processMessage(userId, userMessage, displayName = null) {
  try {
    logger.info('CONVERSATION', `Processing: "${userMessage.substring(0, 50)}..." from ${displayName || userId.substring(0, 8)}`);

    // 1. ดึง/สร้าง User Profile
    const profile = await getOrCreateProfile(userId, displayName);

    // 2. จำแนก Intent
    const { intent, command } = classifyIntent(userMessage);
    logger.info('CONVERSATION', `Intent classified: ${intent}`);

    // 3. บันทึกข้อความผู้ใช้ลง Database
    await saveMessage(userId, 'user', userMessage, { intent, displayName });

    // 4. ประมวลผลตาม Intent
    let response;

    switch (intent) {
      case INTENTS.COMMAND:
        response = await handleSystemCommand(command, userId, profile);
        break;

      case INTENTS.CO_PILOT:
        response = await coPilot.process(userId, userMessage, profile);
        break;

      case INTENTS.CHAT:
      case INTENTS.QUESTION:
      default:
        response = await chat(userId, userMessage, profile);
        break;
    }

    // 5. บันทึกคำ���อบของ AI ลง Database
    await saveMessage(userId, 'assistant', response, { intent });

    // 6. ตัดข้อความถ้ายาวเกินลิมิต LINE (5000 chars)
    if (response.length > 4900) {
      response = response.substring(0, 4900) + '\n\n... (ข้อความถูกตัดเนื่องจากยาวเกินไป)';
    }

    logger.success('CONVERSATION', `Response ready (${response.length} chars)`);
    return response;

  } catch (error) {
    logger.error('CONVERSATION', 'Processing failed', error);
    return `❌ เกิดข้อผิดพลาดครับบอส กรุณาลองใหม่อีกครั้งนะครับ`;
  }
}

/**
 * จัดการคำสั่งระบบ (เริ่มด้วย /)
 */
async function handleSystemCommand(command, userId, profile) {
  const cmd = command.toLowerCase().trim();

  switch (cmd) {
    case '/status':
      return getStatusMessage(profile);

    case '/help':
      return getHelpMessage();

    case '/reset':
      return `🔄 ระบบ Reset Context แล้วครับ (ฟีเจอร์นี้จะพร้��มใช้ใน Phase 2)`;

    case '/about':
      return getAboutMessage();

    default:
      return `❓ ไม่รู้จักคำสั่ง "${cmd}" ครับ พิมพ์ /help เพื่อดูคำสั่งทั้งหมด`;
  }
}

function getStatusMessage(profile) {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);

  return `📊 **${config.app.botName} System Status**

🟢 สถานะ: Online
⏱ Uptime: ${hours}h ${minutes}m
🧠 AI Engine: Gemini ${config.gemini.model}
💬 ข้อความที่คุยกัน: ${profile?.messageCount || 0} ข้อความ
👤 ผู้ใช้: ${profile?.displayName || 'Unknown'}
📅 เจอกันครั้งแรก: ${profile?.firstSeen ? new Date(profile.firstSeen).toLocaleDateString('th-TH') : 'วันนี้'}

🔧 Phase: 1/5 (Foundation)
📦 RAM: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)} MB`;
}

function getHelpMessage() {
  return `📖 **${config.app.botName} Commands & Guide**

🔧 **คำสั่งระบบ:**
/status - ดูสถานะระบบ
/help - ดูคำสั่งทั้งหมด
/about - เกี่ยวกับ Claw

💬 **การใช้งาน:**
• พิมพ์อะไรก็ได้ คุยเป็นธรรมชาติ
• "ช่วยคิด..." เปิดโหมด Co-Pilot
• "ช่วยวิเคราะห์..." วิเคราะห์เชิงลึก
• "ช่วยวางแผน..." ช่วยวางแผน

🚧 **กำลังพัฒนา (เร็วๆ นี้):**
• ระบบความจำระยะยาว
• จัดการงาน/เงิน/เป้าหมาย
• ระบบเตือนอัตโนมัติ`;
}

function getAboutMessage() {
  return `🤖 **${config.app.botName} Personal OS**

Version: 1.0.0-phase1
Engine: Google Gemini
Platform: LINE Messaging
Infrastructure: Render + MongoDB Atlas

${config.app.botName} เป็น AI ผู้ช่วยส่วนตัวระดับ Jarvis
ออกแบบมาเพื่อดูแลเจ้าของคนเดียว
สร้างด้วย ❤️ บนโครงสร้างพื้นฐานฟรี 100%

🔮 มี 28 ฟีเจอร์ แบ่งเป็น 5 Phases
ตอนนี้อยู่ Phase 1: Foundation (สมองและปาก)`;
}

module.exports = {
  processMessage
};
