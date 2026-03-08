// ===========================================
// 💬 CLAW OS - Chat History Manager
// ===========================================
// เก็บปร���วัติแชทเพื่อให้ AI มี Context Memory
// จำได้ว่าคุยอะไรกันมาก่อน (ฟีเจอร์ #24)

const { getDB } = require('./mongoClient');
const { config } = require('../config/environment');
const logger = require('../utils/logger');

const COLLECTION = 'chatHistory';

/**
 * บันทึกข้อความลง Database
 * @param {string} userId - LINE User ID
 * @param {string} role - 'user' หรือ 'assistant'
 * @param {string} content - เนื้อหาข้อความ
 * @param {object} metadata - ข้อมูลเพิ่มเติม (optional)
 */
async function saveMessage(userId, role, content, metadata = {}) {
  try {
    const db = getDB();
    const doc = {
      userId,
      role,          // 'user' | 'assistant'
      content,
      metadata: {
        ...metadata,
        messageLength: content.length
      },
      timestamp: new Date(),
      date: new Date().toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })
    };

    await db.collection(COLLECTION).insertOne(doc);
    logger.info('CHAT-HISTORY', `Saved ${role} message for ${userId.substring(0, 8)}...`);
  } catch (error) {
    logger.error('CHAT-HISTORY', 'Failed to save message', error);
    // ไม่ throw - ให้ระบบทำงานต���อแม้เซฟไม่ได้
  }
}

/**
 * ดึงประวัติแชทล่าสุด สำหรับส่งเป็น Context ให้ AI
 * @param {string} userId - LINE User ID
 * @param {number} limit - จำนวนข้อความท��่จะดึง
 * @returns {Array} - ประวัติแชทเรียงจากเก่าไปใหม่
 */
async function getRecentHistory(userId, limit = null) {
  try {
    const db = getDB();
    const maxMessages = limit || config.memory.maxChatHistory;

    const messages = await db.collection(COLLECTION)
      .find({ userId })
      .sort({ timestamp: -1 })          // เอาล่าสุดก่อน
      .limit(maxMessages)
      .project({ role: 1, content: 1, timestamp: 1, _id: 0 })
      .toArray();

    // กลับลำดับให้เรียงจากเก่าไปใหม่ (สำหรับส่งให้ AI)
    const sorted = messages.reverse();

    logger.info('CHAT-HISTORY', `Retrieved ${sorted.length} messages for context`);
    return sorted;
  } catch (error) {
    logger.error('CHAT-HISTORY', 'Failed to get history', error);
    return []; // คืน array ว่างถ้าดึงไม่ได้
  }
}

/**
 * แปลงประวัติแชทเป็น format สำหรับ Gemini API
 * @param {Array} history - ประวัติแชทจาก getRecentHistory
 * @returns {Array} - Format ที่ Gemini ต้องการ
 */
function formatHistoryForGemini(history) {
  return history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
}

/**
 * นับจำนวนข้อความทั้งหมดของ User
 */
async function getMessageCount(userId) {
  try {
    const db = getDB();
    return await db.collection(COLLECTION).countDocuments({ userId });
  } catch (error) {
    return 0;
  }
}

/**
 * ดึงแชทของวันนี้ (สำหรับ Daily Summary)
 */
async function getTodayMessages(userId) {
  try {
    const db = getDB();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await db.collection(COLLECTION)
      .find({
        userId,
        timestamp: { $gte: today }
      })
      .sort({ timestamp: 1 })
      .toArray();
  } catch (error) {
    logger.error('CHAT-HISTORY', 'Failed to get today messages', error);
    return [];
  }
}

module.exports = {
  saveMessage,
  getRecentHistory,
  formatHistoryForGemini,
  getMessageCount,
  getTodayMessages
};
