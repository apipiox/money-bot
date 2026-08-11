import test from 'node:test';
import assert from 'node:assert/strict';
import { parseExpense } from '../src/parser.js';

test('Monster at 711 becomes Snacks & Drinks + 7-Eleven', () => {
  const result = parseExpense('5.20 monster 711');
  assert.equal(result.ok, true);
  assert.deepEqual(result.expense, {
    amount: 5.2,
    category: '🥤 Snacks & Drinks',
    merchant: '7-Eleven',
    description: 'monster',
  });
});

test('lunch becomes Food Outside', () => {
  const result = parseExpense('18 lunch');
  assert.equal(result.expense.category, '🍜 Food Outside');
  assert.equal(result.expense.merchant, null);
  assert.equal(result.expense.description, 'lunch');
});

test('grab home becomes GrabRide', () => {
  const result = parseExpense('24.50 grab home');
  assert.equal(result.expense.category, '🚗 GrabRide');
  assert.equal(result.expense.merchant, 'Grab');
  assert.equal(result.expense.description, 'home');
});

test('grabfood becomes GrabFood', () => {
  const result = parseExpense('32 grabfood');
  assert.equal(result.expense.category, '🛵 GrabFood');
  assert.equal(result.expense.merchant, 'GrabFood');
  assert.equal(result.expense.description, null);
});

test('unknown text becomes Miscellaneous', () => {
  const result = parseExpense('9.90 random thing');
  assert.equal(result.expense.category, '🧾 Miscellaneous');
});

test('rejects missing amount', () => {
  const result = parseExpense('monster 711');
  assert.equal(result.ok, false);
});
