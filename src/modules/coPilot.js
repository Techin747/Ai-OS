// ===========================================
// 🧑‍✈️ CLAW OS - AI Co-Pilot Module
// ===========================================
// โหมดช่วยคิด วิเคราะห์ วางแผน
// ฟีเจอร์ #27 AI Co-Pilot

const { chat } = require('../ai/geminiClient');
const { getCoPilotPrompt } = require('../ai/promptBuilder');
const logger = require('../utils/logger');

/**
 * ประมวลผลในโหมด Co-Pilot
 * ให้ AI วิเคราะห์เชิงลึกมากขึ้น
 */
async function process(userId, userMessage, userProfile = null) {
  try {
    logger.ai('CO-PILOT', `Activated for: "${userMessage.substring(0, 50)}..."`);

    // เพิ่ม Co-Pilot instruction เข้าไปในข้อความ
    const enhancedMessage = `[โหมด Co-Pilot: ช่วยคิด/วิเคราะห์เชิงลึก]
${getCoPilotPrompt()}

คำขอของเจ้าของ: ${userMessage}`;

    const response = await chat(userId, enhancedMessage, userProfile);

    return response;
  } catch (error) {
    logger.error('CO-PILOT', 'Processing failed', error);
    return '❌ โหมด Co-Pilot มีปัญหาครับ ลองถามใหม่อีกครั้ง';
  }
}

module.exports = {
  process
};
