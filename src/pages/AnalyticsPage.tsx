import React, { useMemo } from 'react';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import {
  Award,
  Calendar,
  ArrowLeftRight,
  Download,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { EXPENSE_CATEGORIES, useFinance } from '../context/FinanceContext';
import {
  CATEGORY_COLORS,
  exportTransactionsToCSV,
  formatCurrency,
  formatPercent,
} from '../utils/formatters';
import {
  getBarChartOptions,
  getDoughnutOptions,
  getLineChartOptions,
} from '../utils/chartConfig';
import { CategoryIcon } from '../components/CategoryIcon';

export const AnalyticsPage: React.FC = () => {
  const {
    transactions,
    categoryTotals,
    totalMonthlySpending,
    averageDailySpending,
    monthlySeries,
    currency,
    isDark,
  } = useFinance();

  // Identify Highest Spending Category
  const sortedCategories = useMemo(() => {
    return EXPENSE_CATEGORIES.map((cat) => {
      const amount = categoryTotals[cat] || 0;
      const pct = totalMonthlySpending > 0 ? (amount / totalMonthlySpending) * 100 : 0;
      const txCount = transactions.filter((t) => t.category === cat).length;
      return { category: cat, amount, pct, txCount };
    }).sort((a, b) => b.amount - a.amount);
  }, [categoryTotals, totalMonthlySpending, transactions]);

  const highestCategory = sortedCategories[0];

  // Month-over-Month comparison against October 2026 ($3,140.00)
  const previousMonthTotal = 3140;
  const comparisonDiff = totalMonthlySpending - previousMonthTotal;
  const comparisonPct =
    previousMonthTotal > 0 ? (comparisonDiff / previousMonthTotal) * 100 : 0;

  // Weekly Spending Patterns (Aggregated by Day of Week from active transactions)
  const weeklyBarData = useMemo(() => {
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const sums = [0, 0, 0, 0, 0, 0, 0];

    transactions.forEach((tx) => {
      const parts = tx.date.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const jsDay = d.getDay(); // 0 = Sun ... 6 = Sat
        const idx = jsDay === 0 ? 6 : jsDay - 1;
        sums[idx] += tx.amount;
      }
    });

    return {
      labels: dayLabels,
      datasets: [
        {
          label: 'Current Month Day-of-Week Spend',
          data: sums.map((v) => Number(v.toFixed(2))),
          backgroundColor: '#2563EB',
          borderRadius: 6,
          maxBarThickness: 38,
        },
        {
          label: '3-Month Historical Benchmark',
          data: [380, 420, 395, 340, 510, 590, 345],
          backgroundColor: isDark ? '#334155' : '#CBD5E1',
          borderRadius: 6,
          maxBarThickness: 38,
        },
      ],
    };
  }, [transactions, isDark]);

  // Doughnut Chart Data
  const doughnutData = useMemo(() => {
    return {
      labels: EXPENSE_CATEGORIES,
      datasets: [
        {
          label: 'Category Expense',
          data: EXPENSE_CATEGORIES.map((c) => Number((categoryTotals[c] || 0).toFixed(2))),
          backgroundColor: EXPENSE_CATEGORIES.map((c) => CATEGORY_COLORS[c].hex),
          borderColor: EXPENSE_CATEGORIES.map(() => (isDark ? '#0F172A' : '#FFFFFF')),
          borderWidth: 2,
        },
      ],
    };
  }, [categoryTotals, isDark]);

  // Monthly Trend Line Chart Data
  const monthlyLineData = useMemo(() => {
    const historicalOnly = monthlySeries.filter((m) => m.actual !== null);
    return {
      labels: historicalOnly.map((m) => m.month),
      datasets: [
        {
          label: 'Monthly Actual Spend',
          data: historicalOnly.map((m) => m.actual),
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.12)',
          borderWidth: 2.5,
          pointBackgroundColor: '#4F46E5',
          pointRadius: 4,
          tension: 0.35,
          fill: true,
        },
      ],
    };
  }, [monthlySeries]);

  const doughnutOptions = useMemo(() => getDoughnutOptions(isDark, currency), [isDark, currency]);
  const barOptions = useMemo(() => getBarChartOptions(isDark, currency), [isDark, currency]);
  const lineOptions = useMemo(() => getLineChartOptions(isDark, currency), [isDark, currency]);

  return (
    <div className="space-y-6">
      {/* Analytics Header + Export */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Comprehensive Spending Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-dimensional category distribution, weekly velocity, and historical comparisons
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            exportTransactionsToCSV(transactions, currency, 'spendwise-analytics-ledger.csv')
          }
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Download size={14} />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* 3 Analytical Highlight KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Highest Spending Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Highest Spending Category
              </p>
              <p className="font-display font-bold text-xl text-slate-900 dark:text-white mt-1">
                {highestCategory?.category || 'N/A'}
              </p>
              <p className="font-mono-tabular font-semibold text-sm text-blue-600 dark:text-blue-400 mt-1">
                {formatCurrency(highestCategory?.amount || 0, currency)} (
                {(highestCategory?.pct || 0).toFixed(1)}% of total)
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            Across {highestCategory?.txCount || 0} recorded transactions this month
          </p>
        </div>

        {/* Average Daily Expenditure */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Average Daily Expenditure
              </p>
              <p className="font-mono-tabular font-bold text-2xl text-slate-900 dark:text-white mt-1">
                {formatCurrency(averageDailySpending, currency)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Projected 30-day run rate:{' '}
                <span className="font-mono-tabular font-semibold text-slate-700 dark:text-slate-300">
                  {formatCurrency(averageDailySpending * 30, currency)}
                </span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            Average transaction ticket size:{' '}
            <span className="font-mono-tabular font-medium text-slate-800 dark:text-slate-200">
              {formatCurrency(
                transactions.length > 0 ? totalMonthlySpending / transactions.length : 0,
                currency
              )}
            </span>
          </p>
        </div>

        {/* Spending Comparison (Month-over-Month) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Spending Comparison (vs Last Month)
              </p>
              <p
                className={`font-mono-tabular font-bold text-2xl mt-1 ${
                  comparisonDiff <= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {comparisonDiff <= 0 ? '' : '+'}
                {formatCurrency(comparisonDiff, currency)}
              </p>
              <p className="font-mono-tabular text-xs text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
                {comparisonDiff <= 0 ? (
                  <TrendingDown size={14} className="text-emerald-600" />
                ) : (
                  <TrendingUp size={14} className="text-red-600" />
                )}
                <span>{formatPercent(comparisonPct)} change from October</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowLeftRight size={20} />
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            October Benchmark:{' '}
            <span className="font-mono-tabular font-medium text-slate-800 dark:text-slate-200">
              {formatCurrency(previousMonthTotal, currency)}
            </span>
          </p>
        </div>
      </div>

      {/* Charts Grid: Category Doughnut & Weekly Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Doughnut: Category-wise Expense Analysis */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Category-Wise Expense Share
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Proportional breakdown of current cycle spending
            </p>
          </div>
          <div className="h-72 relative my-auto">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </section>

        {/* Bar: Weekly Spending Patterns */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Weekly Spending Patterns (Day-of-Week Velocity)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Compares current day-of-week expenditure against your 3-month baseline
            </p>
          </div>
          <div className="h-72 relative my-auto">
            <Bar data={weeklyBarData} options={barOptions} />
          </div>
        </section>
      </div>

      {/* Monthly Spending Trends Line Chart */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="mb-4">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            7-Month Historical Spending Trend
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Longitudinal trajectory of verified monthly expenditure
          </p>
        </div>
        <div className="h-72 relative">
          <Line data={monthlyLineData} options={lineOptions} />
        </div>
      </section>

      {/* Detailed Category-Wise Analytics Table */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Category Performance Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Granular metrics by category including transaction volume and share of wallet
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-4 text-right">Transactions</th>
                <th className="py-3 px-4 text-right">Average per Txn</th>
                <th className="py-3 px-4 text-right">Share of Total</th>
                <th className="py-3 px-6 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
              {sortedCategories.map((row) => {
                const avgTx = row.txCount > 0 ? row.amount / row.txCount : 0;
                return (
                  <tr
                    key={row.category}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={row.category} />
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {row.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-xs text-slate-600 dark:text-slate-300">
                      {row.txCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-xs text-slate-600 dark:text-slate-300">
                      {formatCurrency(avgTx, currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular text-xs text-slate-600 dark:text-slate-300">
                      {row.pct.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono-tabular font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(row.amount, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
