const botToken = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  throw new Error('Missing required environment variable: BOT_TOKEN (or TELEGRAM_BOT_TOKEN)');
}

for (const key of ['ALLOWED_CHAT_ID', 'DATABASE_URL']) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const chatId = Number(process.env.ALLOWED_CHAT_ID);
if (!Number.isSafeInteger(chatId)) {
  throw new Error('ALLOWED_CHAT_ID must be a valid Telegram numeric chat ID.');
}

export const config = Object.freeze({
  botToken,
  allowedChatId: chatId,
  databaseUrl: process.env.DATABASE_URL,
  timezone: process.env.TZ || 'Asia/Singapore',
});
