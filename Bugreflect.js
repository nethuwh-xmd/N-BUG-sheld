function bugReflect(sock, m) {
  const sender = m.key.remoteJid;
  const messageContent = m.message?.conversation || m.message?.extendedTextMessage?.text;

  const knownBugs = ['.bug', '/bug', '😈', '.💣', '🦠', '🥀'];

  if (knownBugs.some((b) => messageContent?.toLowerCase().includes(b))) {
    const reflectMessage = '⚠️ BUG REFLECTED BACK!';
    sock.sendMessage(sender, { text: reflectMessage });
    sock.sendMessage(sender, { text: messageContent }); // Send it back
    console.log('🔥 Bug reflected to:', sender);
  }
}

module.exports = { bugReflect };
