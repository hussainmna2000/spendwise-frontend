import { CurrencyCode, ExpenseCategory, Transaction } from '../types/finance';

export const CURRENCY_META: Record<
  CurrencyCode,
  { symbol: string; locale: string; name: string; rateFromUSD: number }
> = {
  USD: { symbol: '$', locale: 'en-US', name: 'US Dollar ($)', rateFromUSD: 1 },
  EUR: { symbol: '€', locale: 'de-DE', name: 'Euro (€)', rateFromUSD: 0.92 },
  GBP: { symbol: '£', locale: 'en-GB', name: 'British Pound (£)', rateFromUSD: 0.79 },
  INR: { symbol: '₹', locale: 'en-IN', name: 'Indian Rupee (₹)', rateFromUSD: 83.5 },
  JPY: { symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen (¥)', rateFromUSD: 154.0 },
  CAD: { symbol: 'CA$', locale: 'en-CA', name: 'Canadian Dollar (CA$)', rateFromUSD: 1.38 },
};

export function formatCurrency(
  amountInUSD: number,
  currency: CurrencyCode = 'USD',
  compact = false
): string {
  const meta = CURRENCY_META[currency] || CURRENCY_META.USD;
  const converted = amountInUSD * meta.rateFromUSD;
  const isZeroDecimals = currency === 'JPY';

  try {
    return new Intl.NumberFormat(meta.locale, {
      style: 'currency',
      currency,
      notation: compact && Math.abs(converted) >= 10000 ? 'compact' : 'standard',
      minimumFractionDigits: isZeroDecimals ? 0 : 2,
      maximumFractionDigits: isZeroDecimals ? 0 : 2,
    }).format(converted);
  } catch {
    return `${meta.symbol}${converted.toFixed(isZeroDecimals ? 0 : 2)}`;
  }
}

export function formatDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

export function formatPercent(value: number, includeSign = true): string {
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export const CATEGORY_COLORS: Record<
  ExpenseCategory,
  { hex: string; borderHex: string; textClass: string; bgSubtleClass: string }
> = {
  Food: {
    hex: '#2563EB', // Royal Blue
    borderHex: '#1D4ED8',
    textClass: 'text-blue-600 dark:text-blue-400',
    bgSubtleClass: 'bg-blue-50 dark:bg-blue-950/50',
  },
  Transportation: {
    hex: '#0D9488', // Teal
    borderHex: '#0F766E',
    textClass: 'text-teal-600 dark:text-teal-400',
    bgSubtleClass: 'bg-teal-50 dark:bg-teal-950/50',
  },
  Shopping: {
    hex: '#4F46E5', // Indigo
    borderHex: '#4338CA',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    bgSubtleClass: 'bg-indigo-50 dark:bg-indigo-950/50',
  },
  Bills: {
    hex: '#0F172A', // Deep Navy
    borderHex: '#334155',
    textClass: 'text-slate-700 dark:text-slate-300',
    bgSubtleClass: 'bg-slate-100 dark:bg-slate-800/70',
  },
  Entertainment: {
    hex: '#D97706', // Amber
    borderHex: '#B45309',
    textClass: 'text-amber-600 dark:text-amber-400',
    bgSubtleClass: 'bg-amber-50 dark:bg-amber-950/50',
  },
  Healthcare: {
    hex: '#16A34A', // Emerald
    borderHex: '#15803D',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgSubtleClass: 'bg-emerald-50 dark:bg-emerald-950/50',
  },
  Education: {
    hex: '#0284C7', // Sky Blue
    borderHex: '#0369A1',
    textClass: 'text-sky-600 dark:text-sky-400',
    bgSubtleClass: 'bg-sky-50 dark:bg-sky-950/50',
  },
  Others: {
    hex: '#64748B', // Slate
    borderHex: '#475569',
    textClass: 'text-slate-600 dark:text-slate-400',
    bgSubtleClass: 'bg-slate-100 dark:bg-slate-800/50',
  },
};

export function exportTransactionsToCSV(
  transactions: Transaction[],
  currency: CurrencyCode,
  filename = 'spendwise-transactions.csv'
): void {
  const rate = CURRENCY_META[currency]?.rateFromUSD ?? 1;
  const headers = ['ID', 'Title', 'Category', 'Date', `Amount (${currency})`, 'Description'];
  const rows = transactions.map((t) => [
    t.id,
    `"${t.title.replace(/"/g, '""')}"`,
    t.category,
    t.date,
    (t.amount * rate).toFixed(currency === 'JPY' ? 0 : 2),
    `"${(t.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBudgetReportToCSV(
  reportRows: {
    category: ExpenseCategory;
    spent: number;
    allocated: number;
    recommended: number;
    status: string;
  }[],
  currency: CurrencyCode,
  filename = 'spendwise-budget-report.csv'
): void {
  const rate = CURRENCY_META[currency]?.rateFromUSD ?? 1;
  const decimals = currency === 'JPY' ? 0 : 2;
  const headers = [
    'Category',
    `Current Spent (${currency})`,
    `Allocated Budget (${currency})`,
    `AI Recommended (${currency})`,
    'Utilization (%)',
    'Status',
  ];

  const rows = reportRows.map((r) => {
    const util = r.allocated > 0 ? ((r.spent / r.allocated) * 100).toFixed(1) : '0.0';
    return [
      r.category,
      (r.spent * rate).toFixed(decimals),
      (r.allocated * rate).toFixed(decimals),
      (r.recommended * rate).toFixed(decimals),
      util,
      `"${r.status}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
