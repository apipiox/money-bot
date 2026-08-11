const required = ['BOT_TOKEN', 'ALLOWED_CHAT_ID', 'DATABASE_URL'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const chatId = Number(process.env.ALLOWED_CHAT_ID);
if (!Number.isSafeInteger(chatId)) {
  throw new Error('ALLOWED_CHAT_ID must be a valid Telegram numeric chat ID.');
}

export const config = Object.freeze({
  botToken: process.env.BOT_TOKEN,
  allowedChatId: chatId,
  databaseUrl: process.env.DATABASE_URL,
  timezone: process.env.TZ || 'Asia/Singapore',
});
