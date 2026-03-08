// ===========================================
// 👤 CLAW OS - User Profile Manager
// ===========================================
// จัดการข้อมูลผู้ใช้ (เตรียมพร���อมสำหรับ Phase 2: Memory System)
// ฟีเจอร์ #17 Knowledge Base, #20 Personal Database

const { getDB } = require('./mongoClient');
const logger = require('../utils/logger');

const COLLECTION = 'userProfiles';

/**
 * ดึงหรือสร้าง User Profile
 */
async function getOrCreateProfile(userId, displayName = null) {
  try {
    const db = getDB();
    let profile = await db.collection(COLLECTION).findOne({ userId });

    if (!profile) {
      profile = {
        userId,
        displayName: displayName || 'Unknown',
        firstSeen: new Date(),
        lastSeen: new Date(),
        messageCount: 0,
        preferences: {},
        memories: [],          // เตรียมไว้สำหรับ Phase 2
        importantInfo: [],     // เตรียมไว้สำหรับ Phase 2 (เช่น แพ้อาหาร)
        goals: [],             // เตรียมไว้สำหรับ Phase 3
        habits: [],            // เตรียมไว้สำหรับ Phase 3
        emotionHistory: [],    // เตรียมไว้สำหรับ Phase 5
        createdAt: new Date()
      };

      await db.collection(COLLECTION).insertOne(profile);
      logger.success('USER-PROFILE', `New profile created for ${displayName || userId.substring(0, 8)}`);
    } else {
      // อัปเดต last seen
      await db.collection(COLLECTION).updateOne(
        { userId },
        {
          $set: { lastSeen: new Date() },
          $inc: { messageCount: 1 }
        }
      );
    }

    return profile;
  } catch (error) {
    logger.error('USER-PROFILE', 'Failed to get/create profile', error);
    return null;
  }
}

/**
 * อัปเดตข้อมูล Profile
 */
async function updateProfile(userId, updates) {
  try {
    const db = getDB();
    await db.collection(COLLECTION).updateOne(
      { userId },
      { $set: updates }
    );
    logger.info('USER-PROFILE', `Profile updated for ${userId.substring(0, 8)}...`);
  } catch (error) {
    logger.error('USER-PROFILE', 'Failed to update profile', error);
  }
}

module.exports = {
  getOrCreateProfile,
  updateProfile
};
