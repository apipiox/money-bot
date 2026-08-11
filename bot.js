import { config } from './config.js';
import { parseExpense } from './parser.js';
import {
  addTransaction,
  getCurrentMonthTotal,
  getDaySummary,
  getDayTransactions,
  getMonthSummary,
  getRecentTransactions,
  getTodayTotal,
  undoLastTransaction,
  updateTransaction,
} from './db.js';
import {
  formatDailyRecap,
  formatDayTransactions,
  formatEdited,
  formatLogged,
  formatMonthSummary,
  formatRecent,
  formatUndo,
} from './format.js';
import { answerCallbackQuery, getUpdates, prepareLongPolling, sendMessage } from './telegram.js';

const HELP = [
  '💰 Money Bot',
  '',
  'Just send an expense:',
  '5.20 monster 711',
  '18 lunch',
  '24.50 grab home',
  '32 grabfood',
  '',
  '/today · /month · /recent · /undo',
  '/edit <id> <corrected expense>',
  '',
  'Example: /edit 42 8.50 monster 711',
].join('\n');

function isAllowed(chatId) {
  return Number(chatId) === config.allowedChatId;
}

async function sendToday(chatId) {
  const rows = await getDayTransactions(chatId);
  await sendMessage(chatId, formatDayTransactions(rows, 'TODAY'));
}

async function sendMonth(chatId) {
  const summary = await getMonthSummary(chatId);
  await sendMessage(chatId, formatMonthSummary(summary));
}

async function sendRecent(chatId) {
  const rows = await getRecentTransactions(chatId, 10);
  await sendMessage(chatId, formatRecent(rows));
}

async function undo(chatId) {
  const tx = await undoLastTransaction(chatId);
  const todayTotal = await getTodayTotal(chatId);
  await sendMessage(chatId, formatUndo(tx, todayTotal));
}

async function edit(chatId, text) {
  const match = text.match(/^\/edit(?:@\w+)?\s+(\d+)\s+(.+)$/i);
  if (!match) {
    await sendMessage(chatId, '✏️ Use: /edit <id> <corrected expense>\n\nExample: /edit 42 8.50 monster 711\n\nUse /recent to see transaction IDs.');
    return;
  }

  const id = match[1];
  const parsed = parseExpense(match[2]);
  if (!parsed.ok) {
    await sendMessage(chatId, `⚠️ ${parsed.error}`);
    return;
  }

  const tx = await updateTransaction(chatId, id, parsed.expense);
  if (!tx) {
    await sendMessage(chatId, `⚠️ I couldn't find transaction #${id}. Use /recent to check the ID.`);
    return;
  }

  const todayTotal = await getTodayTotal(chatId);
  await sendMessage(chatId, formatEdited(tx, todayTotal));
}

async function logExpense(chatId, text) {
  const parsed = parseExpense(text);
  if (!parsed.ok) {
    await sendMessage(chatId, `⚠️ ${parsed.error}`);
    return;
  }

  const tx = await addTransaction(chatId, parsed.expense);
  const todayTotal = await getTodayTotal(chatId);
  await sendMessage(chatId, formatLogged(tx, todayTotal));
}

async function handleMessage(message) {
  const chatId = message?.chat?.id;
  if (!isAllowed(chatId) || typeof message.text !== 'string') return;

  const text = message.text.trim();
  const command = text.split(/\s+/)[0].toLowerCase().replace(/@[^\s]+$/, '');

  if (command === '/start' || command === '/help') return sendMessage(chatId, HELP);
  if (command === '/today') return sendToday(chatId);
  if (command === '/month') return sendMonth(chatId);
  if (command === '/recent') return sendRecent(chatId);
  if (command === '/undo') return undo(chatId);
  if (command === '/edit') return edit(chatId, text);
  if (text.startsWith('/')) return sendMessage(chatId, '⚠️ Unknown command. Use /start for the tiny command list.');

  return logExpense(chatId, text);
}

async function handleCallbackQuery(query) {
  const chatId = query?.message?.chat?.id;
  if (!isAllowed(chatId)) return;

  const data = String(query.data || '');
  if (data.startsWith('day:')) {
    const localDate = data.slice(4);
    const rows = await getDayTransactions(chatId, localDate);
    await answerCallbackQuery(query.id);
    await sendMessage(chatId, formatDayTransactions(rows, localDate));
    return;
  }

  await answerCallbackQuery(query.id, 'Unknown action');
}

export async function sendDailyRecap(chatId, localDate, displayDate = new Date()) {
  const summary = await getDaySummary(chatId, localDate);
  const monthTotal = await getCurrentMonthTotal(chatId);

  return sendMessage(chatId, formatDailyRecap(summary, monthTotal, displayDate), {
    reply_markup: {
      inline_keyboard: [[
        { text: '📋 View transactions', callback_data: `day:${localDate}` },
      ]],
    },
  });
}

export async function startPolling() {
  await prepareLongPolling();
  console.log('Money Bot long polling started.');

  let offset = 0;
  let stopped = false;

  const stop = () => { stopped = true; };

  (async () => {
    while (!stopped) {
      try {
        const updates = await getUpdates(offset);
        for (const update of updates) {
          offset = Math.max(offset, update.update_id + 1);
          try {
            if (update.message) await handleMessage(update.message);
            if (update.callback_query) await handleCallbackQuery(update.callback_query);
          } catch (error) {
            console.error('Update handling failed:', error);
            const chatId = update.message?.chat?.id || update.callback_query?.message?.chat?.id;
            if (isAllowed(chatId)) {
              await sendMessage(chatId, '⚠️ Money Bot hit an error handling that. Nothing was intentionally changed.').catch(() => {});
            }
          }
        }
      } catch (error) {
        console.error('Polling failed:', error.message);
        await new Promise((resolve) => setTimeout(resolve, 3_000));
      }
    }
  })();

  return stop;
}
