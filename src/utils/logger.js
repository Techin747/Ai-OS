// ===========================================
// 📋 CLAW OS - Logger Utility
// ===========================================
// ระบบ Log ที่อ่านง่าย มี emoji บอกระดับ

const logger = {
  info: (module, message, data = null) => {
    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    console.log(`[${timestamp}] ℹ️  [${module}] ${message}`);
    if (data) console.log('   📦 Data:', JSON.stringify(data, null, 2));
  },

  success: (module, message, data = null) => {
    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    console.log(`[${timestamp}] ✅ [${module}] ${message}`);
    if (data) console.log('   📦 Data:', JSON.stringify(data, null, 2));
  },

  warn: (module, message, data = null) => {
    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    console.warn(`[${timestamp}] ⚠️  [${module}] ${message}`);
    if (data) console.warn('   📦 Data:', JSON.stringify(data, null, 2));
  },

  error: (module, message, error = null) => {
    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    console.error(`[${timestamp}] ❌ [${module}] ${message}`);
    if (error) {
      console.error('   🐛 Error:', error.message || error);
      if (error.stack) console.error('   📍 Stack:', error.stack.split('\n')[1]?.trim());
    }
  },

  ai: (module, message, data = null) => {
    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    console.log(`[${timestamp}] 🧠 [${module}] ${message}`);
    if (data) console.log('   📦 Data:', JSON.stringify(data, null, 2));
  }
};

module.exports = logger;
