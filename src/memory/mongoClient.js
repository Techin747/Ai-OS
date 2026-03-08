// ===========================================
// 🗄️ CLAW OS - MongoDB Connection Manager
// ===========================================
// เชื่อมต่อ MongoDB Atlas Free Tier
// ใช้ Connection Pooling เพื่อประสิทธิภาพ

const { MongoClient } = require('mongodb');
const { config } = require('../config/environment');
const logger = require('../utils/logger');

let client = null;
let db = null;

async function connectMongoDB() {
  try {
    if (db) {
      logger.info('MONGODB', 'Already connected, reusing connection');
      return db;
    }

    logger.info('MONGODB', 'Connecting to MongoDB Atlas...');

    client = new MongoClient(config.mongodb.uri, {
      maxPoolSize: 5,               // Free tier ไม่ต้องมาก
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });

    await client.connect();
    db = client.db(config.mongodb.dbName);

    // ���ด��อบ connection
    await db.command({ ping: 1 });
    logger.success('MONGODB', `Connected to database: ${config.mongodb.dbName}`);

    // สร้าง Indexes ที่จำเป็น
    await createIndexes(db);

    return db;
  } catch (error) {
    logger.error('MONGODB', 'Connection failed', error);
    throw error;
  }
}

async function createIndexes(database) {
  try {
    // Chat History - ค้นหาตาม UserId และเรียงตามเวลา
    await database.collection('chatHistory').createIndex(
      { userId: 1, timestamp: -1 }
    );

    // User Profiles - ค้นหาตาม UserId
    await database.collection('userProfiles').createIndex(
      { userId: 1 },
      { unique: true }
    );

    // Memories - ค้นหาตาม UserId และประเภท
    await database.collection('memories').createIndex(
      { userId: 1, category: 1, timestamp: -1 }
    );

    logger.success('MONGODB', 'Database indexes created/verified');
  } catch (error) {
    logger.warn('MONGODB', 'Index creation warning (may already exist)', error);
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectMongoDB() first.');
  }
  return db;
}

async function closeMongoDB() {
  if (client) {
    await client.close();
    db = null;
    client = null;
    logger.info('MONGODB', 'Connection closed');
  }
}

module.exports = {
  connectMongoDB,
  getDB,
  closeMongoDB
};
