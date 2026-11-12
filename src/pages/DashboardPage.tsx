import React, { useMemo } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Wallet,
  PiggyBank,
  CalendarClock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  MessageSquareText,
  Plus,
} from 'lucide-react';
import { useFinance, EXPENSE_CATEGORIES } from '../context/FinanceContext';
import {
  CATEGORY_COLORS,
  formatCurrency,
  formatDateShort,
  formatPercent,
} from '../utils/formatters';
import { getDoughnutOptions, getLineChartOptions } from '../utils/chartConfig';
import { CategoryIcon } from '../components/CategoryIcon';

export const DashboardPage: React.FC = () => {
  const {
    transactions,
    totalMonthlySpending,
    remainingBudget,
    totalAllocatedBudget,
    averageDailySpending,
    predictedNextMonthSpending,
    categoryTotals,
    monthlySeries,
    currency,
    isDark,
    setActivePage,
    backendConnected,
  } = useFinance();

  // Comparison deltas against October 2026 ($3,140.00 actual)
  const previousMonthSpend = 3140;
  const spendDeltaPct =
    previousMonthSpend > 0
      ? ((totalMonthlySpending - previousMonthSpend) / previousMonthSpend) * 100
      : 0;

  const previousRemaining = totalAllocatedBudget - previousMonthSpend;
  const remainingDeltaPct =
    Math.abs(previousRemaining) > 0
      ? ((remainingBudget - previousRemaining) / Math.abs(previousRemaining)) * 100
      : 0;

  const prevAvgDaily = previousMonthSpend / 31;
  const avgDailyDeltaPct =
    prevAvgDaily > 0 ? ((averageDailySpending - prevAvgDaily) / prevAvgDaily) * 100 : 0;

  const predictedDeltaPct =
    totalMonthlySpending > 0
      ? ((predictedNextMonthSpending - totalMonthlySpending) / totalMonthlySpending) * 100
      : 0;

  // Doughnut Chart Data
  const doughnutData = useMemo(() => {
    const labels = EXPENSE_CATEGORIES;
    const values = labels.map((cat) => Number((categoryTotals[cat] || 0).toFixed(2)));
    const bgColors = labels.map((cat) => CATEGORY_COLORS[cat].hex);
    const borderColors = labels.map(() => (isDark ? '#0F172A' : '#FFFFFF'));

    return {
      labels,
      datasets: [
        {
          label: 'Category Spending',
          data: values,
          backgroundColor: bgColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [categoryTotals, isDark]);

  const doughnutOptions = useMemo(
    () => getDoughnutOptions(isDark, currency),
    [isDark, currency]
  );

  // Line Chart Data (Actual vs Predicted Monthly Trend)
  const lineData = useMemo(() => {
    return {
      labels: monthlySeries.map((m) => m.month),
      datasets: [
        {
          label: 'Actual Spending',
          data: monthlySeries.map((m) => m.actual),
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37, 99, 235, 0.10)',
          borderWidth: 2.5,
          pointBackgroundColor: '#2563EB',
          pointBorderColor: isDark ? '#0F172A' : '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: true,
          spanGaps: false,
        },
        {
          label: 'Predicted Spending (ML Model)',
          data: monthlySeries.map((m) => m.predicted),
          borderColor: '#D97706',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [6, 4],
          pointBackgroundColor: '#D97706',
          pointBorderColor: isDark ? '#0F172A' : '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.35,
          fill: false,
        },
      ],
    };
  }, [monthlySeries, isDark]);

  const lineOptions = useMemo(() => getLineChartOptions(isDark, currency), [isDark, currency]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 6);
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Contextual Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:px-6">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active Cycle: November 2026 ·{' '}
            {backendConnected
              ? 'Synchronized with Python Flask Backend'
              : 'Interactive Demo Mode (Connect Flask API in Settings)'}
          </p>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-0.5">
            Personal Spending & Predictive Intelligence
          </h2>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActivePage('expenses')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
          <button
            type="button"
            onClick={() => setActivePage('chatbot')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap"
          >
            <MessageSquareText size={15} />
            <span>Ask SpendWise AI</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Monthly Spending */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Monthly Spending
              </p>
              <p className="font-mono-tabular font-bold text-2xl text-slate-900 dark:text-white mt-1.5">
                {formatCurrency(totalMonthlySpending, currency)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Wallet size={20} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center gap-1 font-mono-tabular font-semibold ${
                spendDeltaPct <= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {spendDeltaPct <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
              {formatPercent(spendDeltaPct)}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              vs {formatCurrency(previousMonthSpend, currency)} last month
            </span>
          </div>
        </div>

        {/* Card 2: Remaining Budget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Remaining Budget
              </p>
              <p
                className={`font-mono-tabular font-bold text-2xl mt-1.5 ${
                  remainingBudget >= 0
                    ? 'text-slate-900 dark:text-white'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatCurrency(remainingBudget, currency)}
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                remainingBudget >= 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400'
              }`}
            >
              <PiggyBank size={20} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center gap-1 font-mono-tabular font-semibold ${
                remainingBudget >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {remainingDeltaPct >= 0 ? (
                <ArrowUpRight size={14} />
              ) : (
                <ArrowDownRight size={14} />
              )}
              {formatPercent(remainingDeltaPct)}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              of {formatCurrency(totalAllocatedBudget, currency)} allocated
            </span>
          </div>
        </div>

        {/* Card 3: Average Daily Spending */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Average Daily Spending
              </p>
              <p className="font-mono-tabular font-bold text-2xl text-slate-900 dark:text-white mt-1.5">
                {formatCurrency(averageDailySpending, currency)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <CalendarClock size={20} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center gap-1 font-mono-tabular font-semibold ${
                avgDailyDeltaPct <= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {avgDailyDeltaPct <= 0 ? (
                <ArrowDownRight size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}
              {formatPercent(avgDailyDeltaPct)}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              vs {formatCurrency(prevAvgDaily, currency)}/day last mo
            </span>
          </div>
        </div>

        {/* Card 4: Predicted Next Month Spending */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Predicted Next Month Spending
              </p>
              <p className="font-mono-tabular font-bold text-2xl text-slate-900 dark:text-white mt-1.5">
                {formatCurrency(predictedNextMonthSpending, currency)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span
              className={`inline-flex items-center gap-1 font-mono-tabular font-semibold ${
                predictedDeltaPct <= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {predictedDeltaPct <= 0 ? (
                <ArrowDownRight size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}
              {formatPercent(predictedDeltaPct)}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Projected vs current cycle
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row: Expense Breakdown (Doughnut) & Monthly Spending Trend (Line) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Expense Breakdown Doughnut Chart */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Expense Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Distribution across 8 core spending categories
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('analytics')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              Full Analytics
            </button>
          </div>

          <div className="h-72 relative my-auto">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </section>

        {/* Monthly Spending Trend Line Chart */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Monthly Spending Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Historical actual expenditure vs. ML predicted trajectory
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('predictions')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              Forecast Details
            </button>
          </div>

          <div className="h-72 relative my-auto">
            <Line data={lineData} options={lineOptions} />
          </div>
        </section>
      </div>

      {/* Recent Transactions Table */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Latest posted expenses across your personal accounts
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActivePage('expenses')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors whitespace-nowrap"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-6">Transaction</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-6 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 px-6 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    No transactions recorded yet. Click &ldquo;Add Expense&rdquo; to log your first
                    entry.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={tx.category} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {tx.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                            {tx.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {tx.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDateShort(tx.date)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono-tabular font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      -{formatCurrency(tx.amount, currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
