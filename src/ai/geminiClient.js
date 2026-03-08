// ===========================================
// 🧠 CLAW OS - Gemini AI Client
// ===========================================
// เชื่อมต่อ Google Gemini API
// สมองหลักของ Claw OS

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/environment');
const { getSystemPrompt, getCoPilotPrompt } = require('./promptBuilder');
const { getRecentHistory, formatHistoryForGemini } = require('../memory/chatHistory');
const logger = require('../utils/logger');

let genAI = null;
let model = null;

/**
 * เริ่มต้น Gemini Client
 */
function initGemini() {
  try {
    genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    model = genAI.getGenerativeModel({
      model: config.gemini.model,
      generationConfig: {
        maxOutputTokens: config.gemini.maxOutputTokens,
        temperature: config.gemini.temperature,
        topP: 0.95,
        topK: 40
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_NONE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_NONE'
        }
      ]
    });

    logger.success('GEMINI', `Model initialized: ${config.gemini.model}`);
    return true;
  } catch (error) {
    logger.error('GEMINI', 'Failed to initialize', error);
    return false;
  }
}

/**
 * ส่งข้อความถาม AI และรับคำตอบ
 * @param {string} userId - LINE User ID
 * @param {string} userMessage - ข้อความจากผู้ใช้
 * @param {object} userProfile - ข้อมูลผู้ใช้
 * @returns {string} - คำตอบจาก AI
 */
async function chat(userId, userMessage, userProfile = null) {
  try {
    if (!model) {
      initGemini();
    }

    logger.ai('GEMINI', `Processing message: "${userMessage.substring(0, 50)}..."`);

    // 1. สร้าง System Prompt
    const systemPrompt = getSystemPrompt(userProfile);

    // 2. ดึงประวัติแชทล่าสุดเป็น Context
    const history = await getRecentHistory(userId);
    const formattedHistory = formatHistoryForGemini(history);

    // 3. สร้าง Chat Session พร้อม Context
    const chatSession = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: `[SYSTEM INSTRUCTIONS - ปฏิบัติตามนี้ตลอด]\n${systemPrompt}` }]
        },
        {
          role: 'model',
          parts: [{ text: `เข้าใจคะ เค้า ${config.app.botName} พร้อมทำงานแล้วคะบอส! 👻` }]
        },
        ...formattedHistory
      ]
    });

    // 4. ส่งข้อความและรับคำตอบ
    const result = await chatSession.sendMessage(userMessage);
    const response = result.response.text();

    logger.ai('GEMINI', `Response generated (${response.length} chars)`);

    return response;
  } catch (error) {
    logger.error('GEMINI', 'Chat failed', error);

    // ตรวจสอบ��ระเภท Error
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return '⚠️ ขออภัยคะบอส ตอนนี้ระบบ AI ถูกใช้งานเยอะ กรุณารอสักครู่แล้วลองใหม่ครับ';
    }

    if (error.message?.includes('SAFETY')) {
      return '🤔 เค้าไม่แน่ใจ���่าจะตอบเรื่องนี้ยังไงดีคะ ��องถามแบบอื่นได้ไหมค่ะบอส?';
    }

    return '❌ เกิดข้อผิดพลาดคะบอส ระบบ AI มีปัญหาชั่วคราว กำลังแก้ไขคะ';
  }
}

/**
 * ทดสอบการเชื่อมต่อ Gemini
 */
async function testConnection() {
  try {
    if (!model) initGemini();
    const result = await model.generateContent('ตอบว่า "OK" เท่านั้น');
    const text = result.response.text();
    logger.success('GEMINI', `Connection test passed: "${text.trim()}"`);
    return true;
  } catch (error) {
    logger.error('GEMINI', 'Connection test failed', error);
    return false;
  }
}

module.exports = {
  initGemini,
  chat,
  testConnection
};
