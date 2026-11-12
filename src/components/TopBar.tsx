import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Settings,
  Menu,
  Sun,
  Moon,
  CheckCheck,
  X,
} from 'lucide-react';
import { PageId } from '../types/finance';
import { useFinance } from '../context/FinanceContext';

const PAGE_TITLES: Record<PageId, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Financial Overview',
    subtitle: 'Monthly spending performance, category distribution, and predictive trajectory',
  },
  chatbot: {
    title: 'SpendWise AI Assistant',
    subtitle: 'Conversational expense analysis, anomaly detection, and budget planning',
  },
  expenses: {
    title: 'Expense Management',
    subtitle: 'Search, filter, categorize, and audit your personal transaction ledger',
  },
  analytics: {
    title: 'Spending Analytics',
    subtitle: 'Deep-dive category distributions, weekly velocity, and historical comparisons',
  },
  predictions: {
    title: 'Spending Predictions',
    subtitle: 'Upcoming month forecast modeled against historical transaction trends',
  },
  budget: {
    title: 'Smart Budget Advisor',
    subtitle: 'Category utilization tracking, overspending alerts, and savings optimization',
  },
  settings: {
    title: 'Workspace & API Settings',
    subtitle: 'Manage profile preferences, currency formatting, theme, and Flask API connection',
  },
};

export const TopBar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    setMobileMenuOpen,
    isDark,
    toggleTheme,
    globalSearchQuery,
    setGlobalSearchQuery,
    userProfile,
    notifications,
    markAllNotificationsRead,
    dismissNotification,
    backendConnected,
  } = useFinance();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pageMeta = PAGE_TITLES[activePage];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim() && activePage !== 'expenses') {
      setActivePage('expenses');
    }
  };

  const initials = userProfile.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Trigger + Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
              {pageMeta.title}
            </h1>
            <span className="hidden md:inline-block text-xs text-slate-400 dark:text-slate-500">
              ·
            </span>
            <span className="hidden md:inline-block text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
              {backendConnected ? 'Flask API Connected' : 'Local Demo Dataset'}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Search, Theme Toggle, Notifications, Settings Shortcut, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Transaction Search */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="search"
            value={globalSearchQuery}
            onChange={(e) => {
              setGlobalSearchQuery(e.target.value);
              if (e.target.value.trim() && activePage !== 'expenses') {
                setActivePage('expenses');
              }
            }}
            placeholder="Search transactions..."
            aria-label="Search transactions"
            className="w-44 md:w-60 pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-lg bg-slate-100 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 border border-transparent focus:border-blue-600 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-colors"
          />
        </form>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="View notifications"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-mono-tabular font-semibold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Financial Alerts
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {unreadCount} unread notification{unreadCount === 1 ? '' : 's'}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
                  >
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                    No active alerts. Your budgets are on track.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`px-4 py-3 flex items-start justify-between gap-3 transition-colors ${
                        item.read
                          ? 'bg-white dark:bg-slate-900'
                          : 'bg-blue-50/40 dark:bg-blue-950/20'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (item.targetPage) setActivePage(item.targetPage);
                          setNotifOpen(false);
                        }}
                        className="text-left flex-1 min-w-0"
                      >
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                          {item.timestamp}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => dismissNotification(item.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                        aria-label="Dismiss notification"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings Shortcut */}
        <button
          type="button"
          onClick={() => setActivePage('settings')}
          className={`p-2 rounded-lg transition-colors ${
            activePage === 'settings'
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          aria-label="Open settings"
          title="Settings"
        >
          <Settings size={18} />
        </button>

        {/* User Profile / Avatar */}
        <button
          type="button"
          onClick={() => setActivePage('settings')}
          className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="View user profile & settings"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-blue-600 text-white text-xs font-display font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
              {userProfile.fullName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight whitespace-nowrap">
              {userProfile.roleTitle}
            </p>
          </div>
        </button>
      </div>
    </header>
  );
};
