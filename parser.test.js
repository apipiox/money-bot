import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExpense } from './parser.js';

const cases = [
  ['5.20 monster 711', 5.20, '🥤 Snacks & Drinks', '7-Eleven', 'monster'],
  ['18 lunch', 18, '🍜 Food Outside', null, 'lunch'],
  ['24.50 grab home', 24.50, '🚗 GrabRide', 'Grab', 'home'],
  ['32 grabfood', 32, '🛵 GrabFood', 'GrabFood', null],
  ['3.99 google one', 3.99, '📱 Bills & Subscriptions', 'Google One', null],
  ['15 haircut', 15, '🧾 Miscellaneous', null, 'haircut'],
  ['6.48 spotify', 6.48, '📱 Bills & Subscriptions', 'Spotify', null],
  ['8.98 yt premium', 8.98, '📱 Bills & Subscriptions', 'YouTube Premium', null],
  ['12.50 meiji banana', 12.50, '🥤 Snacks & Drinks', 'Meiji', 'banana'],
  ['14.90 subway lunch', 14.90, '🍜 Food Outside', 'Subway', 'lunch'],
  ['80 uniqlo shirt', 80, '🛍️ Shopping', 'Uniqlo', 'shirt'],
  ['20 mrt topup', 20, '🚇 Transport', null, 'mrt topup'],
];

for (const [input, amount, category, merchant, description] of cases) {
  test(input, () => {
    const result = parseExpense(input);
    assert.equal(result.ok, true);
    assert.equal(result.expense.amount, amount);
    assert.equal(result.expense.category, category);
    assert.equal(result.expense.merchant, merchant);
    assert.equal(result.expense.description, description);
  });
}
