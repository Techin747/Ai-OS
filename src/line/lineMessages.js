// ===========================================
// 💬 CLAW OS - LINE Message Helpers
// ===========================================
// Helper functions สำหรับจัดรูปแบบข้อความ LINE

/**
 * แบ่งข้อความยาวออกเป็นหลายข้อความ
 * LINE limit: 5000 chars per message, max 5 messages per reply
 */
function splitLongMessage(text, maxLength = 4900) {
  if (text.length <= maxLength) {
    return [text];
  }

  const messages = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      messages.push(remaining);
      break;
    }

    // หาจุดตัดที่เหมาะสม (ท้ายย่อหน้าหรือท้ายประโยค)
    let cutPoint = remaining.lastIndexOf('\n\n', maxLength);
    if (cutPoint === -1 || cutPoint < maxLength / 2) {
      cutPoint = remaining.lastIndexOf('\n', maxLength);
    }
    if (cutPoint === -1 || cutPoint < maxLength / 2) {
      cutPoint = remaining.lastIndexOf(' ', maxLength);
    }
    if (cutPoint === -1 || cutPoint < maxLength / 2) {
      cutPoint = maxLength;
    }

    messages.push(remaining.substring(0, cutPoint));
    remaining = remaining.substring(cutPoint).trim();
  }

  return messages.slice(0, 5); // LINE max 5 messages
}

/**
 * สร้าง Loading Animation message
 */
function createLoadingMessage() {
  return {
    type: 'text',
    text: '🧠 ��ำลังคิด...'
  };
}

module.exports = {
  splitLongMessage,
  createLoadingMessage
};
