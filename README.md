# Money Bot v1 💰🤖

A private Telegram spending logger with natural-language input, PostgreSQL storage, and a 23:59 Singapore daily recap.

## v1 scope

Fixed categories:

- 🍜 Food Outside
- 🛵 GrabFood
- 🚗 GrabRide
- 🚇 Transport
- 🥤 Snacks & Drinks
- 🛍️ Shopping
- 📱 Bills & Subscriptions
- 🎮 Entertainment
- 🧾 Miscellaneous

Example messages:

```text
5.20 monster 711
18 lunch
24.50 grab home
32 grabfood
```

Each transaction stores:

- amount
- category
- merchant
- description
- date/time (`occurred_at`)
- Telegram chat ID (for ownership/isolation)

## Commands

```text
/today
/month
/recent
/undo
/edit <id> <corrected expense>
```

Example:

```text
/edit 42 8.50 monster 711
```

Use `/recent` to see transaction IDs.

## Daily recap

At **23:59 Asia/Singapore**, the bot sends:

- total spent today
- category totals
- transaction count
- biggest spend
- current month total
- `📋 View transactions` button

Daily recaps are guarded by a PostgreSQL key so the same day's recap is not intentionally sent twice.

## Deploy on Railway

### 1. Create the Telegram bot

Create a bot with BotFather and copy its token.

### 2. Create a GitHub repository

Upload this folder to a new repository.

### 3. Create a Railway project

Deploy the GitHub repository as a Railway service.

### 4. Add PostgreSQL

In the Railway project canvas, add a PostgreSQL database.

### 5. Add service variables

Set these on the Money Bot service:

```text
BOT_TOKEN=<BotFather token>
ALLOWED_CHAT_ID=<your private Telegram numeric chat ID>
DATABASE_URL=${{Postgres.DATABASE_URL}}
TZ=Asia/Singapore
```

The exact Postgres service reference name can differ if you renamed the database service.

### 6. Deploy

Railway should use:

```text
npm start
```

No public webhook is required. Money Bot uses Telegram long polling. The tiny HTTP server exists only for health/status checks.

### 7. Test

Open your bot privately and send:

```text
5.20 monster 711
```

Expected category/merchant:

```text
🥤 Snacks & Drinks
🏪 7-Eleven
```

Then try:

```text
/today
/recent
/undo
```

## Database behavior

The app creates its own `transactions` and `daily_recaps` tables on first startup. Queries are parameterized. Daily/monthly boundaries are calculated in Singapore time.

## Parser philosophy

v1 intentionally uses deterministic keyword rules rather than an LLM. That keeps logging fast, free, and predictable. Merchant aliases and category keywords live in `src/parser.js`, so the bot can learn your shorthand later without changing the database.

## Important production note

Run a single Money Bot application replica while using Telegram long polling. Do not run a webhook for the same Telegram bot at the same time.
