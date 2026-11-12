import React, { useState } from 'react';
import {
  User,
  Globe,
  Sun,
  Moon,
  Bell,
  Server,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { CurrencyCode } from '../types/finance';
import { CURRENCY_META, formatCurrency } from '../utils/formatters';
import { DEFAULT_API_CONFIG } from '../services/api';

const CURRENCY_CODES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD'];

export const SettingsPage: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    currency,
    setCurrency,
    isDark,
    setThemeMode,
    notificationPrefs,
    updateNotificationPrefs,
    apiBaseUrl,
    updateApiBaseUrl,
    backendConnected,
    checkingBackend,
    lastSyncError,
    testBackendConnection,
    resetDemoData,
  } = useFinance();

  // Local profile form state
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [email, setEmail] = useState(userProfile.email);
  const [roleTitle, setRoleTitle] = useState(userProfile.roleTitle);
  const [monthlyIncome, setMonthlyIncome] = useState(String(userProfile.monthlyIncome));
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState(
    String(userProfile.monthlySavingsGoal)
  );
  const [profileError, setProfileError] = useState<string | null>(null);

  // API Base URL state
  const [urlInput, setUrlInput] = useState(apiBaseUrl);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setProfileError('Full Name and Email Address are required.');
      return;
    }
    const incomeNum = Number(monthlyIncome);
    const goalNum = Number(monthlySavingsGoal);
    if (isNaN(incomeNum) || incomeNum <= 0) {
      setProfileError('Please enter a valid positive Monthly Income.');
      return;
    }
    setProfileError(null);
    updateUserProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      roleTitle: roleTitle.trim() || 'Member',
      monthlyIncome: incomeNum,
      monthlySavingsGoal: isNaN(goalNum) ? 0 : goalNum,
    });
  };

  const handleApiSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    updateApiBaseUrl(urlInput);
    await testBackendConnection();
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: User Profile & Account Settings */}
        <section className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <User size={18} className="text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                User Profile & Account Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personal identity and baseline monthly income targets
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="prof-name"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="prof-role"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Role / Title
                </label>
                <input
                  id="prof-role"
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="prof-email"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
              >
                Email Address
              </label>
              <input
                id="prof-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="prof-income"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Net Monthly Income (USD Base)
                </label>
                <input
                  id="prof-income"
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="prof-savings"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Target Monthly Savings (USD Base)
                </label>
                <input
                  id="prof-savings"
                  type="number"
                  value={monthlySavingsGoal}
                  onChange={(e) => setMonthlySavingsGoal(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {profileError && (
              <p className="text-xs text-red-600 dark:text-red-400">{profileError}</p>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Displayed in {currency}:{' '}
                <strong className="font-mono-tabular text-slate-800 dark:text-slate-200">
                  {formatCurrency(Number(monthlyIncome) || 0, currency)}
                </strong>{' '}
                income
              </span>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Save size={14} />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Theme Preference & Currency Selection */}
        <div className="lg:col-span-5 space-y-6">
          {/* Theme Preference */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              {isDark ? (
                <Moon size={18} className="text-blue-400" />
              ) : (
                <Sun size={18} className="text-amber-500" />
              )}
              <div>
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Appearance & Theme Preference
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch between high-contrast Light and Dark workspace modes
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold border transition-colors ${
                  !isDark
                    ? 'bg-blue-50 border-blue-600 text-blue-700'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sun size={15} />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold border transition-colors ${
                  isDark
                    ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Moon size={15} />
                <span>Dark Mode</span>
              </button>
            </div>
          </section>

          {/* Currency Selection */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <Globe size={18} className="text-blue-600 dark:text-blue-400" />
              <div>
                <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  Display Currency
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formats all KPI cards, charts, and CSV exports immediately
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label
                htmlFor="currency-select"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Active Currency
              </label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
              >
                {CURRENCY_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code} — {CURRENCY_META[code].name}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>
      </div>

      {/* Notification Preferences */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Bell size={18} className="text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Notification & Alert Preferences
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure how SpendWise AI notifies you about budget limits and forecasts
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Overspending Warnings
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Alert immediately when a category crosses 80% budget utilization
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationPrefs.overspendingAlerts}
              onChange={(e) =>
                updateNotificationPrefs({
                  ...notificationPrefs,
                  overspendingAlerts: e.target.checked,
                })
              }
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                ML Prediction Updates
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Notify when new monthly Scikit-learn forecasts are computed
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationPrefs.predictionUpdates}
              onChange={(e) =>
                updateNotificationPrefs({
                  ...notificationPrefs,
                  predictionUpdates: e.target.checked,
                })
              }
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Weekly Spending Digest
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive a weekly summary of category trends every Monday morning
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationPrefs.weeklyDigest}
              onChange={(e) =>
                updateNotificationPrefs({
                  ...notificationPrefs,
                  weeklyDigest: e.target.checked,
                })
              }
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Unusual Transaction Detection
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Flag duplicate charges or spikes above 2x category average
              </p>
            </div>
            <input
              type="checkbox"
              checked={notificationPrefs.unusualActivity}
              onChange={(e) =>
                updateNotificationPrefs({
                  ...notificationPrefs,
                  unusualActivity: e.target.checked,
                })
              }
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>
        </div>
      </section>

      {/* Python Flask Backend API Configuration & Contract Documentation */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Server size={18} className="text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Python Flask Backend Integration & API Configuration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect this frontend to your Python + Flask + Pandas + Scikit-learn server
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors self-start sm:self-auto"
          >
            <RotateCcw size={14} />
            <span>Reset Local Demo Dataset</span>
          </button>
        </div>

        <form onSubmit={handleApiSaveAndTest} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label
              htmlFor="flask-base-url"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              Configurable Backend Base URL
            </label>
            <input
              id="flask-base-url"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://localhost:5000/api"
              className="w-full px-3.5 py-2 text-sm font-mono-tabular rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={checkingBackend}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap h-[38px]"
            >
              <RefreshCw size={14} className={checkingBackend ? 'animate-spin' : ''} />
              <span>Save & Test Connection</span>
            </button>
          </div>
        </form>

        {/* Connection Diagnostics Box */}
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
            backendConnected
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          {backendConnected ? (
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold">
              {backendConnected
                ? `Connected to Flask Server at ${apiBaseUrl}`
                : 'Flask Server Currently Offline — Auto-Fallback Demo Data Active'}
            </p>
            {!backendConnected && lastSyncError && (
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{lastSyncError}</p>
            )}
          </div>
        </div>

        {/* Documented Endpoint Contracts for Flask Backend Integration */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-4">Method & Endpoint</th>
                <th className="py-2.5 px-4">Service Function</th>
                <th className="py-2.5 px-4">Expected Request / Response JSON Format</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono-tabular">
              <tr>
                <td className="py-2.5 px-4 font-semibold text-blue-600 dark:text-blue-400">
                  POST {DEFAULT_API_CONFIG.endpoints.chat}
                </td>
                <td className="py-2.5 px-4">flaskApi.sendChatMessage()</td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                  Req: {`{ message, sessionId, context }`} → Res:{' '}
                  {`{ reply: string, structuredData?: { summary, categoryBreakdown, predictions, budgetSuggestions } }`}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                  GET {DEFAULT_API_CONFIG.endpoints.dashboard}
                </td>
                <td className="py-2.5 px-4">flaskApi.fetchDashboardStats()</td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                  Res: {`{ totalMonthlySpending, remainingBudget, averageDailySpending, predictedNextMonth }`}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                  GET / POST / PUT / DELETE {DEFAULT_API_CONFIG.endpoints.expenses}
                </td>
                <td className="py-2.5 px-4">
                  fetchTransactions / addExpense / updateExpense / deleteExpense
                </td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                  Entity: {`{ id, title, amount, category, date, description }`}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                  GET {DEFAULT_API_CONFIG.endpoints.analytics}
                </td>
                <td className="py-2.5 px-4">flaskApi.fetchAnalytics()</td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                  Res: {`{ categoryTotals, weeklyPatterns, monthlySeries, highestCategory }`}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                  GET {DEFAULT_API_CONFIG.endpoints.predictions}
                </td>
                <td className="py-2.5 px-4">flaskApi.fetchPredictions()</td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                  Res: {`{ predictedNextMonthTotal, confidenceScore, categoryPredictions[] }`}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                  GET {DEFAULT_API_CONFIG.endpoints.budget}
                </td>
                <td className="py-2.5 px-4">flaskApi.fetchBudgetRecommendations()</td>
                <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                  Res: {`{ budgets: [{ category, allocated, recommended }], smartSuggestions[] }`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
