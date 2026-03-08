// ===========================================
// 🎯 CLAW OS - Intent Classifier
// ===========================================
// ร���บบจำแนกเจตนา (Intent) ของผู้ใช้
// เตรียมพร้อมสำหรับ Phase 2-3 (Task, Expense, Goal, etc.)
// ฟีเจอร์ #22 Natural Language Understanding

const logger = require('../utils/logger');

// Intent Types
const INTENTS = {
  CHAT: 'chat',                    // คุยทั่วไป
  QUESTION: 'question',            // ถามคำถาม
  CO_PILOT: 'co_pilot',           // ขอให้ช่วยคิด/วิเคราะห์
  COMMAND: 'command',              // คำสั่งระบบ
  // === เตรียมไว้สำหรับ Phase 2+ ===
  SAVE_MEMORY: 'save_memory',     // Phase 2: จำสิ่งนี้ไว้
  ADD_TASK: 'add_task',           // Phase 3: เพิ่มงาน
  ADD_EXPENSE: 'add_expense',     // Phase 3: บันทึก���ายจ่าย
  SET_GOAL: 'set_goal',          // Phase 3: ตั้งเป้าหมาย
  ADD_NOTE: 'add_note',          // Phase 3: จดโน้ต
  SET_REMINDER: 'set_reminder',  // Phase 4: ตั้งเตือน
  CHECK_WEATHER: 'check_weather', // Phase 5: เช็คอากาศ
  SEARCH_WEB: 'search_web'       // Phase 5: ค้นเว็บ
};

/**
 * จำแนก Intent จากข้อความ (Rule-based สำหรับ Phase 1)
 * Phase 2+ จะอัปเกรดเป็น AI-based classification
 */
function classifyIntent(message) {
  const msg = message.toLowerCase().trim();

  // === System Commands ===
  if (msg === '/status' || msg === '/help' || msg.startsWith('/')) {
    return { intent: INTENTS.COMMAND, command: msg };
  }

  // === Co-Pilot Triggers ===
  const coPilotKeywords = [
    'ช่วยคิด', 'ช่วยวิเคราะห์', 'ช่วยวางแผน', 'ช่วยตัดสินใจ',
    'ควรทำยังไง', 'ควรเลือก', 'pros cons', 'ข้อดีข้อเสีย',
    'เปรียบเทียบ', 'แนะนำหน่อย'
  ];
  if (coPilotKeywords.some(kw => msg.includes(kw))) {
    return { intent: INTENTS.CO_PILOT };
  }

  // === Phase 3 Triggers (เตรียมไว้) ===
  const expenseKeywords = ['จ่าย', 'ซื้อ', 'ค่า', 'บาท', 'ใช้เงิน', 'รายจ่าย'];
  const taskKeywords = ['เพิ่มงาน', 'task', 'todo', 'ต้องทำ', 'อย่าลืม'];
  const reminderKeywords = ['เตือน', 'remind', 'alarm', 'นาฬิกา'];
  const memoryKeywords = ['จำไว้', 'จำว่า', 'อย่าลืมว่า', 'remember'];

  // เตรียม detect ไว้ แต่ยังไม่ทำงานใน Phase 1
  // จะ return เป็น chat แทน และบอกว่ากำลังพัฒนา

  // === Default: General Chat ===
  return { intent: INTENTS.CHAT };
}

/**
 * ตรวจว่าเป็นคำสั่งระบบหรือไม่
 */
function isSystemCommand(message) {
  return message.trim().startsWith('/');
}

module.exports = {
  INTENTS,
  classifyIntent,
  isSystemCommand
};
