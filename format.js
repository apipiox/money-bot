const sgd = new Intl.NumberFormat('en-SG', {
  style: 'currency',
  currency: 'SGD',
  minimumFractionDigits: 2,
});

const localDateTime = new Intl.DateTimeFormat('en-SG', {
  timeZone: 'Asia/Singapore',
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const localTime = new Intl.DateTimeFormat('en-SG', {
  timeZone: 'Asia/Singapore',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const localDayTitle = new Intl.DateTimeFormat('en-SG', {
  timeZone: 'Asia/Singapore',
  day: '2-digit',
  month: 'short',
});

const localMonthTitle = new Intl.DateTimeFormat('en-SG', {
  timeZone: 'Asia/Singapore',
  month: 'long',
  year: 'numeric',
});

export const money = (value) => sgd.format(Number(value || 0));

function detailLine(tx) {
  const detail = [tx.merchant, tx.description].filter(Boolean).join(' · ');
  return detail ? `\n${detail}` : '';
}

export function formatLogged(tx, todayTotal) {
  return [
    `✅ ${money(tx.amount)} logged`,
    '',
    tx.category,
    tx.merchant ? `🏪 ${tx.merchant}` : null,
    tx.description ? `📝 ${tx.description}` : null,
    '',
    `Today: ${money(todayTotal)}`,
  ].filter((line) => line !== null).join('\n');
}

export function formatRecent(rows) {
  if (!rows.length) return '📋 No transactions logged yet.';

  const body = rows.map((tx) => {
    const detail = [tx.merchant, tx.description].filter(Boolean).join(' · ');
    return `#${tx.id} · ${money(tx.amount)} · ${tx.category}\n${detail ? `${detail} · ` : ''}${localDateTime.format(new Date(tx.occurred_at))}`;
  }).join('\n\n');

  return `📋 RECENT TRANSACTIONS\n\n${body}`;
}

export function formatDayTransactions(rows, title = 'TODAY') {
  if (!rows.length) return `📋 ${title}\n\nNo transactions logged.`;

  const total = rows.reduce((sum, tx) => sum + Number(tx.amount), 0);
  const lines = rows.map((tx) => {
    const detail = [tx.merchant, tx.description].filter(Boolean).join(' · ');
    return `${localTime.format(new Date(tx.occurred_at))} · ${money(tx.amount)} · ${tx.category}${detail ? `\n${detail}` : ''}`;
  });

  return `📋 ${title}\n\n${lines.join('\n\n')}\n\nTotal: ${money(total)}`;
}

export function formatMonthSummary(summary, now = new Date()) {
  const categoryLines = summary.categories.length
    ? summary.categories.map((row) => `${row.category} · ${money(row.total)}`).join('\n')
    : 'No spending logged yet.';

  return [
    `💰 ${localMonthTitle.format(now).toUpperCase()}`,
    '',
    `Spent: ${money(summary.total)}`,
    `${summary.count} transaction${summary.count === 1 ? '' : 's'}`,
    '',
    categoryLines,
  ].join('\n');
}

export function formatDailyRecap(summary, monthTotal, date = new Date()) {
  const titleDate = localDayTitle.format(date).toUpperCase();

  if (!summary.count) {
    return [
      `💰 DAILY SPENDING · ${titleDate}`,
      '',
      'No spending logged today 🎉',
      '',
      '─────────────',
      `Month total: ${money(monthTotal)}`,
    ].join('\n');
  }

  const categories = summary.categories.map((row) => `${row.category} · ${money(row.total)}`).join('\n');
  const biggest = summary.biggest
    ? `${summary.biggest.category} · ${money(summary.biggest.amount)}`
    : '—';

  return [
    `💰 DAILY SPENDING · ${titleDate}`,
    '',
    `You spent ${money(summary.total)} today`,
    '',
    categories,
    '',
    `${summary.count} transaction${summary.count === 1 ? '' : 's'}`,
    '',
    `Biggest spend: ${biggest}`,
    '',
    '─────────────',
    `Month total: ${money(monthTotal)}`,
  ].join('\n');
}

export function formatUndo(tx, todayTotal) {
  if (!tx) return '↩️ Nothing to undo.';
  return `↩️ Removed ${money(tx.amount)} · ${tx.category}\n\nToday: ${money(todayTotal)}`;
}

export function formatEdited(tx, todayTotal) {
  return `✏️ Transaction #${tx.id} updated\n\n${money(tx.amount)} · ${tx.category}${detailLine(tx)}\n\nToday: ${money(todayTotal)}`;
}
