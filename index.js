import http from 'node:http';
import cron from 'node-cron';
import { config } from './config.js';
import { claimDailyRecap, initDb, pool, releaseDailyRecap } from './db.js';
import { sendDailyRecap, startPolling } from './bot.js';

function singaporeDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

async function runDailyRecap() {
  const localDate = singaporeDateParts();
  const claimed = await claimDailyRecap(config.allowedChatId, localDate);
  if (!claimed) return;

  try {
    await sendDailyRecap(config.allowedChatId, localDate, new Date());
    console.log(`Daily recap sent for ${localDate}.`);
  } catch (error) {
    await releaseDailyRecap(config.allowedChatId, localDate).catch(() => {});
    throw error;
  }
}

await initDb();
console.log('Database ready.');

const stopPolling = await startPolling();

const recapTask = cron.schedule('59 23 * * *', () => {
  runDailyRecap().catch((error) => console.error('Daily recap failed:', error));
}, {
  timezone: config.timezone,
  noOverlap: true,
});

const port = Number(process.env.PORT || 3000);
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'money-bot-v1' }));
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Money Bot v1 is running.');
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Health server listening on port ${port}.`);
});

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down.`);
  stopPolling();
  recapTask.stop();
  server.close();
  await pool.end();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
