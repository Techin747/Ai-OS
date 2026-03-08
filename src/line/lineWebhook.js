// ===========================================
// 🔗 CLAW OS - LINE Webhook Handler
// ===========================================
// รับและประมวลผล Events จาก LINE
// หัวใจสำคัญที่เชื่อม LINE กับ AI

const { processMessage } = require('../modules/conversation');
const { replyMessage, getUserProfile } = require('./lineClient');
const { splitLongMessage } = require('./lineMessages');
const logger = require('../utils/logger');

/**
 * จัดการ Webhook Events ทั้งหมด
 */
async function handleWebhook(events) {
  const results = await Promise.allSettled(
    events.map(event => handleEvent(event))
  );

  // Log ผลลัพธ์
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      logger.error('WEBHOOK', `Event ${index} failed`, result.reason);
    }
  });

  return results;
}

/**
 * จัดการ Event แต่ละตัว
 */
async function handleEvent(event) {
  // รับเฉพาะ Message Event ที่เป็น Text
  if (event.type !== 'message' || event.message.type !== 'text') {
    logger.info('WEBHOOK', `Skipped event: ${event.type}/${event.message?.type || 'N/A'}`);

    // ถ้าเป็นประเภทอื่นๆ ให้ตอบแจ้ง
    if (event.type === 'message' && event.message.type !== 'text') {
      await replyMessage(
        event.replyToken,
        `📎 ขออภัยครับ ตอนนี้ผมรับได้เฉพาะข้อความ Text เท่านั้นครับบอส\n(รูป, เสียง, วิดีโอ จะรองรับในอนาคต)`
      );
    }
    return;
  }

  const userId = event.source.userId;
  const userMessage = event.message.text.trim();
  const replyToken = event.replyToken;

  logger.info('WEBHOOK', `📨 Received: "${userMessage.substring(0, 50)}..." from ${userId.substring(0, 8)}...`);

  // ดึง Display Name จาก LINE
  let displayName = null;
  try {
    const lineProfile = await getUserProfile(userId);
    displayName = lineProfile?.displayName || null;
  } catch (e) {
    // ไม่เป็นไร ถ้าดึงไม่ได้
  }

  // ประมวลผลข้อความ
  const response = await processMessage(userId, userMessage, displayName);

  // แบ่งข้อความถ้ายาวเกิน
  const messageParts = splitLongMessage(response);

  // ตอบกลับ
  if (messageParts.length === 1) {
    await replyMessage(replyToken, messageParts[0]);
  } else {
    // ตอบหลายข้อความ
    const { getLineClient } = require('./lineClient');
    const client = getLineClient();
    await client.replyMessage({
      replyToken,
      messages: messageParts.map(text => ({ type: 'text', text }))
    });
  }

  logger.success('WEBHOOK', `✅ Message handled successfully for ${displayName || userId.substring(0, 8)}`);
}

module.exports = {
  handleWebhook
};
