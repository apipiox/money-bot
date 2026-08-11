import pg from 'pg';
import { config } from './config.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id BIGSERIAL PRIMARY KEY,
      chat_id BIGINT NOT NULL,
      amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
      category TEXT NOT NULL CHECK (category IN (
        '🍜 Food Outside',
        '🛵 GrabFood',
        '🚗 GrabRide',
        '🚇 Transport',
        '🥤 Snacks & Drinks',
        '🛍️ Shopping',
        '📱 Bills & Subscriptions',
        '🎮 Entertainment',
        '🧾 Miscellaneous'
      )),
      merchant TEXT,
      description TEXT,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_transactions_chat_occurred
    ON transactions (chat_id, occurred_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_recaps (
      chat_id BIGINT NOT NULL,
      local_date DATE NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (chat_id, local_date)
    );
  `);
}

export async function addTransaction(chatId, expense) {
  const { rows } = await pool.query(
    `INSERT INTO transactions (chat_id, amount, category, merchant, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, amount::float8 AS amount, category, merchant, description, occurred_at`,
    [chatId, expense.amount, expense.category, expense.merchant, expense.description],
  );
  return rows[0];
}

export async function updateTransaction(chatId, id, expense) {
  const { rows } = await pool.query(
    `UPDATE transactions
     SET amount = $3, category = $4, merchant = $5, description = $6
     WHERE chat_id = $1 AND id = $2
     RETURNING id, amount::float8 AS amount, category, merchant, description, occurred_at`,
    [chatId, id, expense.amount, expense.category, expense.merchant, expense.description],
  );
  return rows[0] ?? null;
}

export async function undoLastTransaction(chatId) {
  const { rows } = await pool.query(
    `DELETE FROM transactions
     WHERE id = (
       SELECT id FROM transactions
       WHERE chat_id = $1
       ORDER BY occurred_at DESC, id DESC
       LIMIT 1
     )
     RETURNING id, amount::float8 AS amount, category, merchant, description, occurred_at`,
    [chatId],
  );
  return rows[0] ?? null;
}

export async function getTodayTotal(chatId) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(amount), 0)::float8 AS total
     FROM transactions
     WHERE chat_id = $1
       AND (occurred_at AT TIME ZONE 'Asia/Singapore')::date =
           (NOW() AT TIME ZONE 'Asia/Singapore')::date`,
    [chatId],
  );
  return rows[0].total;
}

export async function getDayTransactions(chatId, localDate = null) {
  const { rows } = await pool.query(
    `SELECT id, amount::float8 AS amount, category, merchant, description, occurred_at
     FROM transactions
     WHERE chat_id = $1
       AND (occurred_at AT TIME ZONE 'Asia/Singapore')::date =
           COALESCE($2::date, (NOW() AT TIME ZONE 'Asia/Singapore')::date)
     ORDER BY occurred_at ASC, id ASC`,
    [chatId, localDate],
  );
  return rows;
}

export async function getRecentTransactions(chatId, limit = 10) {
  const safeLimit = Math.max(1, Math.min(25, Number(limit) || 10));
  const { rows } = await pool.query(
    `SELECT id, amount::float8 AS amount, category, merchant, description, occurred_at
     FROM transactions
     WHERE chat_id = $1
     ORDER BY occurred_at DESC, id DESC
     LIMIT $2`,
    [chatId, safeLimit],
  );
  return rows;
}

export async function getMonthSummary(chatId) {
  const { rows: totals } = await pool.query(
    `SELECT COALESCE(SUM(amount), 0)::float8 AS total, COUNT(*)::int AS count
     FROM transactions
     WHERE chat_id = $1
       AND DATE_TRUNC('month', occurred_at AT TIME ZONE 'Asia/Singapore') =
           DATE_TRUNC('month', NOW() AT TIME ZONE 'Asia/Singapore')`,
    [chatId],
  );

  const { rows: categories } = await pool.query(
    `SELECT category, SUM(amount)::float8 AS total, COUNT(*)::int AS count
     FROM transactions
     WHERE chat_id = $1
       AND DATE_TRUNC('month', occurred_at AT TIME ZONE 'Asia/Singapore') =
           DATE_TRUNC('month', NOW() AT TIME ZONE 'Asia/Singapore')
     GROUP BY category
     ORDER BY SUM(amount) DESC`,
    [chatId],
  );

  return { ...totals[0], categories };
}

export async function getDaySummary(chatId, localDate = null) {
  const dateExpr = `COALESCE($2::date, (NOW() AT TIME ZONE 'Asia/Singapore')::date)`;
  const params = [chatId, localDate];

  const { rows: totals } = await pool.query(
    `SELECT COALESCE(SUM(amount), 0)::float8 AS total, COUNT(*)::int AS count
     FROM transactions
     WHERE chat_id = $1
       AND (occurred_at AT TIME ZONE 'Asia/Singapore')::date = ${dateExpr}`,
    params,
  );

  const { rows: categories } = await pool.query(
    `SELECT category, SUM(amount)::float8 AS total, COUNT(*)::int AS count
     FROM transactions
     WHERE chat_id = $1
       AND (occurred_at AT TIME ZONE 'Asia/Singapore')::date = ${dateExpr}
     GROUP BY category
     ORDER BY SUM(amount) DESC`,
    params,
  );

  const { rows: biggest } = await pool.query(
    `SELECT id, amount::float8 AS amount, category, merchant, description, occurred_at
     FROM transactions
     WHERE chat_id = $1
       AND (occurred_at AT TIME ZONE 'Asia/Singapore')::date = ${dateExpr}
     ORDER BY amount DESC, occurred_at DESC
     LIMIT 1`,
    params,
  );

  return {
    ...totals[0],
    categories,
    biggest: biggest[0] ?? null,
  };
}

export async function getCurrentMonthTotal(chatId) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(amount), 0)::float8 AS total
     FROM transactions
     WHERE chat_id = $1
       AND DATE_TRUNC('month', occurred_at AT TIME ZONE 'Asia/Singapore') =
           DATE_TRUNC('month', NOW() AT TIME ZONE 'Asia/Singapore')`,
    [chatId],
  );
  return rows[0].total;
}

export async function claimDailyRecap(chatId, localDate) {
  const { rowCount } = await pool.query(
    `INSERT INTO daily_recaps (chat_id, local_date)
     VALUES ($1, $2::date)
     ON CONFLICT DO NOTHING`,
    [chatId, localDate],
  );
  return rowCount === 1;
}

export async function releaseDailyRecap(chatId, localDate) {
  await pool.query(
    `DELETE FROM daily_recaps WHERE chat_id = $1 AND local_date = $2::date`,
    [chatId, localDate],
  );
}
