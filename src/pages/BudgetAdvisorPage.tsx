import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Download,
  SlidersHorizontal,
  Flame,
  Check,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ExpenseCategory } from '../types/finance';
import {
  exportBudgetReportToCSV,
  formatCurrency,
} from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';

export const BudgetAdvisorPage: React.FC = () => {
  const {
    budgets,
    categoryTotals,
    totalMonthlySpending,
    totalAllocatedBudget,
    smartSuggestions,
    unnecessarySpending,
    updateCategoryBudget,
    applyRecommendedBudgets,
    currency,
  } = useFinance();

  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const recommendedMonthlyBudget = useMemo(() => {
    return budgets.reduce((acc, b) => acc + b.recommended, 0);
  }, [budgets]);

  const budgetRows = useMemo(() => {
    return budgets.map((b) => {
      const spent = categoryTotals[b.category] || 0;
      const ratio = b.allocated > 0 ? (spent / b.allocated) * 100 : 0;

      // Visual status rules:
      // Green: Within budget (< 80%)
      // Orange: Approaching budget limit (80% - 99.9%)
      // Red: Exceeded budget (>= 100%)
      let status: 'within' | 'approaching' | 'exceeded' = 'within';
      let statusLabel = 'Within Budget';
      if (ratio >= 100) {
        status = 'exceeded';
        statusLabel = 'Exceeded Budget';
      } else if (ratio >= 80) {
        status = 'approaching';
        statusLabel = 'Approaching Limit';
      }

      return {
        category: b.category,
        spent,
        allocated: b.allocated,
        recommended: b.recommended,
        ratio,
        status,
        statusLabel,
      };
    });
  }, [budgets, categoryTotals]);

  const overspendingWarnings = useMemo(() => {
    return budgetRows.filter((r) => r.status === 'exceeded' || r.status === 'approaching');
  }, [budgetRows]);

  const potentialMonthlySavingsTotal = useMemo(() => {
    return smartSuggestions.reduce((acc, s) => acc + s.potentialMonthlySavings, 0);
  }, [smartSuggestions]);

  const startEditBudget = (cat: ExpenseCategory, currentAllocated: number) => {
    setEditingCategory(cat);
    setEditValue(String(currentAllocated));
  };

  const commitEditBudget = (cat: ExpenseCategory) => {
    const parsed = Number(editValue);
    if (!isNaN(parsed) && parsed > 0) {
      updateCategoryBudget(cat, Math.round(parsed));
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Smart Budget Advisor & Allocation Optimizer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track real-time budget utilization, identify unnecessary recurring charges, and apply AI
            recommendations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              exportBudgetReportToCSV(
                budgetRows.map((r) => ({
                  category: r.category,
                  spent: r.spent,
                  allocated: r.allocated,
                  recommended: r.recommended,
                  status: r.statusLabel,
                })),
                currency
              )
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <Download size={14} />
            <span>Export Budget Report</span>
          </button>

          <button
            type="button"
            onClick={applyRecommendedBudgets}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap"
          >
            <Sparkles size={14} />
            <span>Apply Recommended Budget ({formatCurrency(recommendedMonthlyBudget, currency)})</span>
          </button>
        </div>
      </div>

      {/* 3 Budget Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Recommended Monthly Budget
          </p>
          <p className="font-mono-tabular font-bold text-2xl text-blue-600 dark:text-blue-400 mt-1.5">
            {formatCurrency(recommendedMonthlyBudget, currency)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            Currently Allocated:{' '}
            <span className="font-mono-tabular font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(totalAllocatedBudget, currency)}
            </span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Current Spending vs. Allocated
          </p>
          <p className="font-mono-tabular font-bold text-2xl text-slate-900 dark:text-white mt-1.5">
            {formatCurrency(totalMonthlySpending, currency)}{' '}
            <span className="text-sm font-normal text-slate-400">
              / {formatCurrency(totalAllocatedBudget, currency)}
            </span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            Overall Utilization:{' '}
            <span className="font-mono-tabular font-semibold text-slate-800 dark:text-slate-200">
              {totalAllocatedBudget > 0
                ? ((totalMonthlySpending / totalAllocatedBudget) * 100).toFixed(1)
                : '0.0'}
              %
            </span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Identified Monthly Savings Opportunity
          </p>
          <p className="font-mono-tabular font-bold text-2xl text-emerald-600 dark:text-emerald-400 mt-1.5">
            +{formatCurrency(potentialMonthlySavingsTotal, currency)}/mo
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            Annualized impact:{' '}
            <span className="font-mono-tabular font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(potentialMonthlySavingsTotal * 12, currency)}/yr
            </span>
          </p>
        </div>
      </div>

      {/* Category-Wise Budget Allocation & Utilization Progress Bars */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Category-Wise Budget Allocation & Utilization
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any category budget limit to customize its monthly allocation
            </p>
          </div>

          {/* Visual Status Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span>Within Budget (&lt;80%)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />
              <span>Approaching Limit (80–99%)</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <XCircle size={14} className="text-red-600 dark:text-red-400" />
              <span>Exceeded Budget (≥100%)</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {budgetRows.map((row) => {
            const barWidth = Math.min(100, Math.max(2, row.ratio));
            const barColorClass =
              row.status === 'exceeded'
                ? 'bg-red-600'
                : row.status === 'approaching'
                  ? 'bg-amber-500'
                  : 'bg-emerald-600';

            const statusTextColor =
              row.status === 'exceeded'
                ? 'text-red-600 dark:text-red-400'
                : row.status === 'approaching'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400';

            return (
              <div
                key={row.category}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <CategoryIcon category={row.category} />
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                        {row.category}
                      </h4>
                      <div className={`flex items-center gap-1 text-xs font-medium ${statusTextColor}`}>
                        {row.status === 'exceeded' ? (
                          <XCircle size={13} />
                        ) : row.status === 'approaching' ? (
                          <AlertTriangle size={13} />
                        ) : (
                          <CheckCircle2 size={13} />
                        )}
                        <span>{row.statusLabel}</span>
                        <span>·</span>
                        <span className="font-mono-tabular">{row.ratio.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Editable Allocated Budget */}
                  <div className="text-right">
                    {editingCategory === row.category ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="number"
                          min="10"
                          step="10"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') commitEditBudget(row.category);
                            if (e.key === 'Escape') setEditingCategory(null);
                          }}
                          aria-label={`Edit ${row.category} budget`}
                          className="w-20 px-2 py-1 text-xs font-mono-tabular rounded bg-white dark:bg-slate-900 border border-blue-500 text-slate-900 dark:text-white focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => commitEditBudget(row.category)}
                          className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                          aria-label="Save budget"
                        >
                          <Check size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditBudget(row.category, row.allocated)}
                        className="group inline-flex items-center gap-1.5 text-xs font-mono-tabular font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        title="Click to adjust category budget"
                      >
                        <span>
                          {formatCurrency(row.spent, currency)} /{' '}
                          {formatCurrency(row.allocated, currency)}
                        </span>
                        <SlidersHorizontal
                          size={12}
                          className="text-slate-400 group-hover:text-blue-600"
                        />
                      </button>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      AI Recommended:{' '}
                      <span className="font-mono-tabular font-medium">
                        {formatCurrency(row.recommended, currency)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${barColorClass}`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Overspending Warnings & Unnecessary Spending Identification */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Overspending Warnings */}
        <section className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-red-600 dark:text-red-400 shrink-0" />
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Overspending Warnings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Categories exceeding or nearing 80% threshold
              </p>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            {overspendingWarnings.length === 0 ? (
              <div className="p-6 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/50 text-center">
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  All Categories Within Safe Thresholds
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  None of your expense categories have crossed 80% utilization.
                </p>
              </div>
            ) : (
              overspendingWarnings.map((w) => {
                const overAmount = w.spent - w.allocated;
                return (
                  <div
                    key={w.category}
                    className={`p-3.5 rounded-xl border ${
                      w.status === 'exceeded'
                        ? 'bg-red-50/60 dark:bg-red-950/25 border-red-200 dark:border-red-900/60'
                        : 'bg-amber-50/60 dark:bg-amber-950/25 border-amber-200 dark:border-amber-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
                        {w.category} ({w.ratio.toFixed(1)}%)
                      </span>
                      <span
                        className={`font-mono-tabular text-xs font-bold ${
                          w.status === 'exceeded'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {overAmount > 0
                          ? `+${formatCurrency(overAmount, currency)} over`
                          : `${formatCurrency(Math.abs(overAmount), currency)} left`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      Spent {formatCurrency(w.spent, currency)} of{' '}
                      {formatCurrency(w.allocated, currency)} allocated budget.
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Unnecessary Spending Identification */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Flame size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Unnecessary Spending Identification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Redundant subscriptions, surge fees, and discretionary spikes flagged for review
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {unnecessarySpending.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <CategoryIcon category={item.category} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.category} · {item.frequency}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {item.reason}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono-tabular font-bold text-sm text-red-600 dark:text-red-400">
                    {formatCurrency(item.monthlyCost, currency)}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Required "Smart Suggestions" Section */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Smart Suggestions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalized money-saving recommendations generated from your spending patterns
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smartSuggestions.map((sug) => (
            <div
              key={sug.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  <span>
                    {sug.category} · Priority:{' '}
                    <strong className="text-slate-700 dark:text-slate-200 capitalize">
                      {sug.priority}
                    </strong>
                  </span>
                  <span className="font-mono-tabular font-semibold text-emerald-600 dark:text-emerald-400">
                    Save {formatCurrency(sug.potentialMonthlySavings, currency)}/mo
                  </span>
                </div>
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  {sug.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {sug.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
