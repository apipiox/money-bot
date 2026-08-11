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
  { merchant: 'Google One', category: '📱 Bills & Subscriptions', patterns: [/\bgoogle\s*one\b/i] },
  { merchant: 'iCloud', category: '📱 Bills & Subscriptions', patterns: [/\bicloud\b/i] },
  { merchant: 'Spotify', category: '📱 Bills & Subscriptions', patterns: [/\bspotify\b/i] },
  { merchant: 'YouTube Premium', category: '📱 Bills & Subscriptions', patterns: [/\b(?:youtube|yt)\s*premium\b/i] },
  { merchant: 'Netflix', category: '📱 Bills & Subscriptions', patterns: [/\bnetflix\b/i] },
  { merchant: 'Anytime Fitness', category: '📱 Bills & Subscriptions', patterns: [/\banytime\s*fitness\b/i, /\baf\s+(?:gym|membership)\b/i] },

  { merchant: 'GrabFood', category: '🛵 GrabFood', patterns: [/\bgrab\s*food\b/i] },
  { merchant: 'Grab', category: '🚗 GrabRide', patterns: [/\bgrab\s*ride\b/i, /\bgrabride\b/i, /\bgrab\b/i] },

  { merchant: '7-Eleven', category: '🥤 Snacks & Drinks', patterns: [/\b7[- ]?eleven\b/i, /\b711\b/i] },
  { merchant: 'Starbucks', category: '🥤 Snacks & Drinks', patterns: [/\bstarbucks\b/i] },
  { merchant: 'Meiji', category: '🥤 Snacks & Drinks', patterns: [/\bmeiji\b/i] },

  { merchant: 'Stuff’d', category: '🍜 Food Outside', patterns: [/\bstuff['’]?d\b/i, /\bstuffd\b/i] },
  { merchant: 'Subway', category: '🍜 Food Outside', patterns: [/\bsubway\b/i] },
  { merchant: 'McDonald’s', category: '🍜 Food Outside', patterns: [/\bmcdonald'?s\b/i, /\bmcd\b/i] },
  { merchant: 'KFC', category: '🍜 Food Outside', patterns: [/\bkfc\b/i] },

  { merchant: 'Uniqlo', category: '🛍️ Shopping', patterns: [/\buniqlo\b/i] },
  { merchant: 'Nike', category: '🛍️ Shopping', patterns: [/\bnike\b/i] },
  { merchant: 'Adidas', category: '🛍️ Shopping', patterns: [/\badidas\b/i] },
  { merchant: 'Shopee', category: '🛍️ Shopping', patterns: [/\bshopee\b/i] },
  { merchant: 'Lazada', category: '🛍️ Shopping', patterns: [/\blazada\b/i] },
];

const CATEGORY_RULES = [
  {
    category: '🛵 GrabFood',
    patterns: [/\bgrab\s*food\b/i],
  },
  {
    category: '🚗 GrabRide',
    patterns: [/\bgrabride\b/i, /\bgrab ride\b/i, /\bgrab\b/i],
  },
  {
    category: '🚇 Transport',
    patterns: [
      /\bez[- ]?link\b/i,
      /\bsimplygo\b/i,
      /\bmrt\b/i,
      /\bbus\b/i,
      /\btrain\b/i,
      /\btransport\b/i,
      /\bpublic transport\b/i,
    ],
  },
  {
    category: '🥤 Snacks & Drinks',
    patterns: [
      /\bmonster\b/i,
      /\bred\s?bull\b/i,
      /\bmeiji\b/i,
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
    patterns: [
      /\bbreakfast\b/i,
      /\blunch\b/i,
      /\bdinner\b/i,
      /\bsupper\b/i,
      /\bmeal\b/i,
      /\bhawker\b/i,
      /\brestaurant\b/i,
      /\bsubway\b/i,
      /\bstuff['’]?d\b/i,
      /\bstuffd\b/i,
      /\bmcdonald'?s\b/i,
      /\bmcd\b/i,
      /\bkfc\b/i,
    ],
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
      /\bshopee\b/i,
      /\blazada\b/i,
    ],
  },
  {
    category: '📱 Bills & Subscriptions',
    patterns: [
      /\bbills?\b/i,
      /\bsubscriptions?\b/i,
      /\bspotify\b/i,
      /\bnetflix\b/i,
      /\b(?:youtube|yt)\s*premium\b/i,
      /\bicloud\b/i,
      /\bgoogle\s*one\b/i,
      /\bphone bill\b/i,
      /\bgym membership\b/i,
      /\bmembership\b/i,
      /\banytime\s*fitness\b/i,
    ],
  },
  {
    category: '🎮 Entertainment',
    patterns: [
      /\bcinema\b/i,
      /\bmovie\b/i,
      /\bgames?\b/i,
      /\bsteam\b/i,
      /\bplaystation\b/i,
      /\bnintendo\b/i,
      /\bbowling\b/i,
      /\bconcert\b/i,
    ],
  },
  {
    category: '🧾 Miscellaneous',
    patterns: [
      /\bhaircut\b/i,
      /\bbarber\b/i,
    ],
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

  const category = merchantMatch?.category
    ?? CATEGORY_RULES.find(({ patterns }) => patterns.some((pattern) => pattern.test(remainder)))?.category
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
