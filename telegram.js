import { config } from './config.js';

const API = `https://api.telegram.org/bot${config.botToken}`;

async function call(method, payload = {}) {
  const response = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    throw new Error(`Telegram ${method} failed: ${data.description || response.statusText}`);
  }
  return data.result;
}

export function sendMessage(chatId, text, extra = {}) {
  return call('sendMessage', { chat_id: chatId, text, ...extra });
}

export function answerCallbackQuery(callbackQueryId, text = undefined) {
  return call('answerCallbackQuery', {
    callback_query_id: callbackQueryId,
    ...(text ? { text } : {}),
  });
}

export async function prepareLongPolling() {
  await call('deleteWebhook', { drop_pending_updates: false });
  await call('setMyCommands', {
    commands: [
      { command: 'today', description: "Today's spending" },
      { command: 'month', description: 'This month' },
      { command: 'recent', description: 'Last 10 transactions' },
      { command: 'undo', description: 'Remove latest transaction' },
      { command: 'edit', description: 'Correct a transaction' },
    ],
  });
}

export async function getUpdates(offset) {
  return call('getUpdates', {
    offset,
    timeout: 45,
    allowed_updates: ['message', 'callback_query'],
  });
}
