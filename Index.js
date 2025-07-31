const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const P = require('pino');
const { bugReflect } = require('./bugReflect');
const { applyShield } = require('./shield');

const { state, saveState } = useSingleFileAuthState('./session.json');

const startSocket = async () => {
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;
    const msgText = m.message.conversation || m.message.extendedTextMessage?.text;

    console.log('> Incoming Message:', msgText);

    // Reflect bugs/spam
    bugReflect(sock, m);

    // Apply shield
    applyShield(sock, m);
  });
};

startSocket();
