// ===========================================
// 📱 CLAW OS - LINE Client
// ===========================================
// จัดการ LINE Bot SDK

const line = require('@line/bot-sdk');
const { config } = require('../config/environment');
const logger = require('../utils/logger');

let client = null;

/**
 * สร้าง LINE Client
 */
function createLineClient() {
  try {
    client = new line.messagingApi.MessagingApiClient({
      channelAccessToken: config.line.channelAccessToken
    });
    logger.success('LINE', 'MessagingApiClient initialized');
    return client;
  } catch (error) {
    logger.error('LINE', 'Failed to create client', error);
    throw error;
  }
}

/**
 * ดึง LINE Client
 */
function getLineClient() {
  if (!client) {
    return createLineClient();
  }
  return client;
}

/**
 * ตอบกลับข้อความ (Reply)
 */
async function replyMessage(replyToken, text) {
  try {
    const lineClient = getLineClient();
    await lineClient.replyMessage({
      replyToken,
      messages: [{
        type: 'text',
        text: text
      }]
    });
    logger.success('LINE', `Reply sent (${text.length} chars)`);
  } catch (error) {
    logger.error('LINE', 'Reply failed', error);
    throw error;
  }
}

/**
 * ส่งข้อคว���มหาผู้ใช�� (Push - สำหรับ Phase 4)
 */
async function pushMessage(userId, text) {
  try {
    const lineClient = getLineClient();
    await lineClient.pushMessage({
      to: userId,
      messages: [{
        type: 'text',
        text: text
      }]
    });
    logger.success('LINE', `Push message sent to ${userId.substring(0, 8)}...`);
  } catch (error) {
    logger.error('LINE', 'Push message failed', error);
    throw error;
  }
}

/**
 * ดึง User Profile จาก LINE
 */
async function getUserProfile(userId) {
  try {
    const lineClient = getLineClient();
    const profile = await lineClient.getProfile(userId);
    return profile;
  } catch (error) {
    logger.error('LINE', 'Failed to get user profile', error);
    return null;
  }
}

module.exports = {
  createLineClient,
  getLineClient,
  replyMessage,
  pushMessage,
  getUserProfile
};
