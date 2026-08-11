export const CATEGORIES = Object.freeze([
  '🍜 Food Outside',
  '🛵 GrabFood',
  '🚗 GrabRide',
  '🚇 Transport',
  '🥤 Snacks & Drinks',
  '🛍️ Shopping',
  '📱 Bills & Subscriptions',
  '🎮 Entertainment',
  '🧾 Miscellaneous',
]);

const MERCHANT_ALIASES = [
  { merchant: '7-Eleven', patterns: [/(?:^|\s)7[- ]?eleven(?:\s|$)/i, /(?:^|\s)711(?:\s|$)/i] },
  { merchant: 'GrabFood', patterns: [/(?:^|\s)grab\s?food(?:\s|$)/i] },
  { merchant: 'Grab', patterns: [/(?:^|\s)grab(?:ride)?(?:\s|$)/i, /(?:^|\s)grab ride(?:\s|$)/i] },
  { merchant: 'Starbucks', patterns: [/(?:^|\s)starbucks(?:\s|$)/i] },
  { merchant: 'Uniqlo', patterns: [/(?:^|\s)uniqlo(?:\s|$)/i] },
  { merchant: 'Nike', patterns: [/(?:^|\s)nike(?:\s|$)/i] },
  { merchant: 'Adidas', patterns: [/(?:^|\s)adidas(?:\s|$)/i] },
  { merchant: 'Spotify', patterns: [/(?:^|\s)spotify(?:\s|$)/i] },
  { merchant: 'Netflix', patterns: [/(?:^|\s)netflix(?:\s|$)/i] },
  { merchant: 'YouTube Premium', patterns: [/(?:^|\s)(?:youtube|yt) premium(?:\s|$)/i] },
  { merchant: 'Apple', patterns: [/(?:^|\s)(?:apple|icloud)(?:\s|$)/i] },
];

const CATEGORY_RULES = [
  {
    category: '🛵 GrabFood',
    patterns: [/\bgrab\s?food\b/i],
  },
  {
    category: '🚗 GrabRide',
    patterns: [/\bgrabride\b/i, /\bgrab ride\b/i, /\bgrab\b/i],
  },
  {
    category: '🚇 Transport',
    patterns: [/\bez[- ]?link\b/i, /\bsimplygo\b/i, /\bmrt\b/i, /\bbus\b/i, /\btrain\b/i, /\btransport\b/i, /\bpublic transport\b/i],
  },
  {
    category: '🥤 Snacks & Drinks',
    patterns: [
      /\bmonster\b/i,
      /\bred\s?bull\b/i,
      /\bprotein (?:drink|bar|shake)\b/i,
      /\bcoffee\b/i,
      /\bkopi\b/i,
      /\bsnack/i,
      /\bdrink/i,
      /\b7[- ]?eleven\b/i,
      /\b711\b/i,
      /\bstarbucks\b/i,
    ],
  },
  {
    category: '🍜 Food Outside',
    patterns: [/\bbreakfast\b/i, /\blunch\b/i, /\bdinner\b/i, /\bsupper\b/i, /\bmeal\b/i, /\bhawker\b/i, /\bfood\b/i, /\brestaurant\b/i],
  },
  {
    category: '🛍️ Shopping',
    patterns: [
      /\bshopping\b/i,
      /\bclothes?\b/i,
      /\bshirt\b/i,
      /\bjersey\b/i,
      /\bwhey\b/i,
      /\bsupplements?\b/i,
      /\bcreatine\b/i,
      /\bgym gear\b/i,
      /\belectronics?\b/i,
      /\bshoes?\b/i,
      /\bnike\b/i,
      /\badidas\b/i,
      /\buniqlo\b/i,
    ],
  },
  {
    category: '📱 Bills & Subscriptions',
    patterns: [
      /\bbills?\b/i,
      /\bsubscriptions?\b/i,
      /\bspotify\b/i,
      /\bnetflix\b/i,
      /\b(?:youtube|yt) premium\b/i,
      /\bicloud\b/i,
      /\bgoogle one\b/i,
      /\bphone bill\b/i,
      /\bgym membership\b/i,
      /\bmembership\b/i,
    ],
  },
  {
    category: '🎮 Entertainment',
    patterns: [/\bcinema\b/i, /\bmovie\b/i, /\bgames?\b/i, /\bsteam\b/i, /\bplaystation\b/i, /\bnintendo\b/i, /\bbowling\b/i, /\bconcert\b/i],
  },
];

function cleanDescription(raw, merchantMatch) {
  let value = raw.trim();
  if (merchantMatch) {
    for (const pattern of merchantMatch.patterns) {
      value = value.replace(pattern, ' ');
    }
  }
  return value.replace(/\s+/g, ' ').trim() || null;
}

export function parseExpense(input) {
  const text = String(input || '').trim();
  const amountMatch = text.match(/^\s*(?:s\$|\$)?\s*(\d+(?:\.\d{1,2})?)\b/i);

  if (!amountMatch) {
    return { ok: false, error: 'Start with the amount, e.g. “5.20 monster 711”.' };
  }

  const amount = Number(amountMatch[1]);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999.99) {
    return { ok: false, error: 'That amount does not look valid.' };
  }

  const remainder = text.slice(amountMatch[0].length).trim();
  if (!remainder) {
    return {
      ok: true,
      expense: {
        amount,
        category: '🧾 Miscellaneous',
        merchant: null,
        description: null,
      },
    };
  }

  const merchantMatch = MERCHANT_ALIASES.find(({ patterns }) => patterns.some((pattern) => pattern.test(remainder)));
  const merchant = merchantMatch?.merchant ?? null;

  const category = CATEGORY_RULES.find(({ patterns }) => patterns.some((pattern) => pattern.test(remainder)))?.category
    ?? '🧾 Miscellaneous';

  return {
    ok: true,
    expense: {
      amount,
      category,
      merchant,
      description: cleanDescription(remainder, merchantMatch),
    },
  };
}
