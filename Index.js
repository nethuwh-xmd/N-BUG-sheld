const { WAConnection, MessageType, Mimetype } = require('@adiwajshing/baileys');
const fs = require('fs');
const { handleBugReflect } = require('./bugReflect');
const { handleShield } = require('./shield');
const { sendMediaMessage } = require('./mediaHandler');

const conn = new WAConnection();

conn.on('open', () => {
  const authInfo = conn.base64EncodedAuthInfo();
  fs.writeFileSync('./session.json', JSON.stringify(authInfo, null, 2));
  console.log("✅ Session Saved");
});

if (fs.existsSync('./session.json')) {
  conn.loadAuthInfo('./session.json');
}

conn.connect().catch(err => console.error("❌ Connection Failed", err));

conn.on('chat-update', async (chat) => {
  if (!chat.hasNewMessage) return;
  const m = chat.messages.all()[0];
  if (!m.message || m.key.fromMe) return;

  const msgType = Object.keys(m.message)[0];
  const sender = m.key.remoteJid;
  const text = m.message.conversation || m.message.extendedTextMessage?.text || "";

  // 1. Reflect bugs
  if (await handleBugReflect(conn, m, text)) return;

  // 2. Shield protection
  if (await handleShield(conn, m, text)) return;

  // 3. Media Command: /photo
  if (text.startsWith('/photo')) {
    await sendMediaMessage(conn, sender, './media/photo.jpg', 'image');
  }

  // 4. Echo message
  if (text.startsWith('/echo ')) {
    const replyText = text.slice(6);
    await conn.sendMessage(sender, replyText, MessageType.text);
  }
});
