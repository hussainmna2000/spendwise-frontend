import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppNotification,
  CategoryBudget,
  CategoryPrediction,
  ChatMessage,
  ChatSession,
  CurrencyCode,
  EXPENSE_CATEGORIES,
  ExpenseCategory,
  MonthlyDataPoint,
  NotificationPreferences,
  PageId,
  SmartSuggestion,
  Transaction,
  UnnecessarySpendItem,
  UserProfile,
} from '../types/finance';
import {
  DEMO_CATEGORY_PREDICTIONS,
  DEMO_SMART_SUGGESTIONS,
  DEMO_UNNECESSARY_SPENDING,
  INITIAL_DEMO_BUDGETS,
  INITIAL_DEMO_TRANSACTIONS,
  INITIAL_MONTHLY_TREND,
  INITIAL_NOTIFICATION_PREFS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USER_PROFILE,
  WELCOME_MESSAGE_TEXT,
} from '../data/demoData';
import { flaskApi } from '../services/api';

interface FinanceContextValue {
  // Navigation & UI state
  activePage: PageId;
  setActivePage: (page: PageId) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark') => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  // Backend Connection State
  apiBaseUrl: string;
  updateApiBaseUrl: (url: string) => void;
  backendConnected: boolean;
  checkingBackend: boolean;
  lastSyncError: string | null;
  testBackendConnection: () => Promise<boolean>;

  // Core Financial Data
  transactions: Transaction[];
  budgets: CategoryBudget[];
  monthlySeries: MonthlyDataPoint[];
  categoryPredictions: CategoryPrediction[];
  smartSuggestions: SmartSuggestion[];
  unnecessarySpending: UnnecessarySpendItem[];

  // Derived Statistics (reactive to CRUD operations)
  totalMonthlySpending: number;
  totalAllocatedBudget: number;
  remainingBudget: number;
  averageDailySpending: number;
  predictedNextMonthSpending: number;
  categoryTotals: Record<ExpenseCategory, number>;

  // Expense CRUD Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, tx: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateCategoryBudget: (category: ExpenseCategory, allocated: number) => void;
  applyRecommendedBudgets: () => void;
  resetDemoData: () => void;

  // Chatbot Sessions & Messaging
  chatSessions: ChatSession[];
  activeSessionId: string;
  activeSession: ChatSession;
  isChatLoading: boolean;
  setActiveSessionId: (id: string) => void;
  createNewChatSession: () => void;
  clearActiveChatSession: () => void;
  deleteChatSession: (id: string) => void;
  sendChatPrompt: (promptText: string) => Promise<void>;

  // User Profile & Notifications
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  notificationPrefs: NotificationPreferences;
  updateNotificationPrefs: (prefs: NotificationPreferences) => void;
  notifications: AppNotification[];
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;

  // Toast feedback
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (text: string, type?: 'success' | 'info' | 'warning') => void;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'spendwise_theme',
  CURRENCY: 'spendwise_currency',
  TRANSACTIONS: 'spendwise_transactions_v1',
  BUDGETS: 'spendwise_budgets_v1',
  CHAT_SESSIONS: 'spendwise_chat_sessions_v1',
  USER_PROFILE: 'spendwise_user_profile_v1',
  NOTIF_PREFS: 'spendwise_notif_prefs_v1',
};

function createInitialSession(): ChatSession {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return {
    id: `session-${Date.now()}`,
    title: 'Financial Overview Inquiry',
    createdAt: 'Today',
    updatedAt: now,
    messages: [
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: WELCOME_MESSAGE_TEXT,
        timestamp: now,
      },
    ],
  };
}

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Theme initialization
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved === 'dark';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    } catch {
      // Ignore storage error
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);
  const setThemeMode = useCallback((mode: 'light' | 'dark') => setIsDark(mode === 'dark'), []);

  // Currency initialization
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyCode;
      return saved || 'USD';
    } catch {
      return 'USD';
    }
  });

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, c);
    } catch {
      // Ignore
    }
  }, []);

  // Toast helper
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const showToast = useCallback(
    (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
      setToastMessage({ text, type });
      setTimeout(() => {
        setToastMessage((curr) => (curr?.text === text ? null : curr));
      }, 3400);
    },
    []
  );

  // Flask API connection state
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(() => flaskApi.getConfig().baseUrl);
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [checkingBackend, setCheckingBackend] = useState<boolean>(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);

  // Transactions state (persisted in localStorage)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to demo data
    }
    return INITIAL_DEMO_TRANSACTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch {
      // Ignore
    }
  }, [transactions]);

  // Budgets state (persisted in localStorage)
  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_DEMO_BUDGETS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch {
      // Ignore
    }
  }, [budgets]);

  // User Profile & Notification Preferences
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
    } catch {
      return INITIAL_USER_PROFILE;
    }
  });

  const updateUserProfile = useCallback(
    (profile: UserProfile) => {
      setUserProfile(profile);
      try {
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      } catch {
        // Ignore
      }
      showToast('Profile settings saved successfully.');
    },
    [showToast]
  );

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIF_PREFS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATION_PREFS;
    } catch {
      return INITIAL_NOTIFICATION_PREFS;
    }
  });

  const updateNotificationPrefs = useCallback(
    (prefs: NotificationPreferences) => {
      setNotificationPrefs(prefs);
      try {
        localStorage.setItem(STORAGE_KEYS.NOTIF_PREFS, JSON.stringify(prefs));
      } catch {
        // Ignore
      }
      showToast('Notification preferences updated.');
    },
    [showToast]
  );

  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return [createInitialSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => chatSessions[0]?.id || '');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(chatSessions));
    } catch {
      // Ignore
    }
  }, [chatSessions]);

  const activeSession = useMemo(() => {
    return chatSessions.find((s) => s.id === activeSessionId) || chatSessions[0];
  }, [chatSessions, activeSessionId]);

  // Derived financial calculations
  const categoryTotals = useMemo(() => {
    const totals: Record<ExpenseCategory, number> = {
      Food: 0,
      Transportation: 0,
      Shopping: 0,
      Bills: 0,
      Entertainment: 0,
      Healthcare: 0,
      Education: 0,
      Others: 0,
    };
    transactions.forEach((t) => {
      if (totals[t.category] !== undefined) {
        totals[t.category] += Number(t.amount) || 0;
      } else {
        totals.Others += Number(t.amount) || 0;
      }
    });
    return totals;
  }, [transactions]);

  const totalMonthlySpending = useMemo(() => {
    return Object.values(categoryTotals).reduce((acc, v) => acc + v, 0);
  }, [categoryTotals]);

  const totalAllocatedBudget = useMemo(() => {
    return budgets.reduce((acc, b) => acc + b.allocated, 0);
  }, [budgets]);

  const remainingBudget = useMemo(() => {
    return totalAllocatedBudget - totalMonthlySpending;
  }, [totalAllocatedBudget, totalMonthlySpending]);

  const averageDailySpending = useMemo(() => {
    // Based on 11 elapsed days in the current active billing cycle or unique dates span
    const daysElapsed = 11;
    return totalMonthlySpending / daysElapsed;
  }, [totalMonthlySpending]);

  const categoryPredictions = useMemo<CategoryPrediction[]>(() => {
    return DEMO_CATEGORY_PREDICTIONS.map((item) => {
      const liveCurrent = categoryTotals[item.category] ?? item.currentMonth;
      const ratio = item.currentMonth > 0 ? liveCurrent / item.currentMonth : 1;
      const adjustedPrediction = Math.round(item.predictedNextMonth * (0.65 + 0.35 * ratio));
      const changePct =
        liveCurrent > 0 ? ((adjustedPrediction - liveCurrent) / liveCurrent) * 100 : 0;
      return {
        ...item,
        currentMonth: liveCurrent,
        predictedNextMonth: adjustedPrediction,
        changePercent: Number(changePct.toFixed(1)),
      };
    });
  }, [categoryTotals]);

  const predictedNextMonthSpending = useMemo(() => {
    return categoryPredictions.reduce((sum, p) => sum + p.predictedNextMonth, 0);
  }, [categoryPredictions]);

  const monthlySeries = useMemo<MonthlyDataPoint[]>(() => {
    return INITIAL_MONTHLY_TREND.map((pt) => {
      if (pt.month === 'Nov 2026') {
        return { ...pt, actual: Number(totalMonthlySpending.toFixed(2)) };
      }
      if (pt.month.startsWith('Dec 2026')) {
        return { ...pt, predicted: Number(predictedNextMonthSpending.toFixed(2)) };
      }
      return pt;
    });
  }, [totalMonthlySpending, predictedNextMonthSpending]);

  // Attempt initial non-blocking check against Flask backend
  const testBackendConnection = useCallback(async (): Promise<boolean> => {
    setCheckingBackend(true);
    const res = await flaskApi.fetchTransactions();
    setCheckingBackend(false);
    if (res.ok && res.data) {
      setBackendConnected(true);
      setLastSyncError(null);
      if (res.data.length > 0) {
        setTransactions(res.data);
      }
      return true;
    } else {
      setBackendConnected(false);
      setLastSyncError(res.error || 'Flask backend unreachable; using local demo dataset.');
      return false;
    }
  }, []);

  useEffect(() => {
    // Quiet check on mount
    testBackendConnection();
  }, [testBackendConnection]);

  const updateApiBaseUrl = useCallback(
    (url: string) => {
      flaskApi.setBaseUrl(url);
      setApiBaseUrl(flaskApi.getConfig().baseUrl);
      showToast(`Flask API URL updated to ${flaskApi.getConfig().baseUrl}`, 'info');
    },
    [showToast]
  );

  // CRUD operations with Flask API attempt + local persistence fallback
  const addTransaction = useCallback(
    async (tx: Omit<Transaction, 'id'>) => {
      const apiRes = await flaskApi.addExpense(tx);
      if (apiRes.ok && apiRes.data && apiRes.data.id) {
        setTransactions((prev) => [apiRes.data!, ...prev]);
        setBackendConnected(true);
        showToast('Expense saved to Flask backend.');
        return;
      }

      const newTx: Transaction = {
        ...tx,
        id: `TXN-${Math.floor(1025 + Math.random() * 8900)}`,
      };
      setTransactions((prev) => [newTx, ...prev]);
      showToast('Expense added to local ledger.');
    },
    [showToast]
  );

  const updateTransaction = useCallback(
    async (id: string, tx: Omit<Transaction, 'id'>) => {
      const apiRes = await flaskApi.updateExpense(id, tx);
      if (apiRes.ok && apiRes.data) {
        setTransactions((prev) => prev.map((item) => (item.id === id ? apiRes.data! : item)));
        setBackendConnected(true);
        showToast('Expense updated on Flask backend.');
        return;
      }

      setTransactions((prev) =>
        prev.map((item) => (item.id === id ? { ...tx, id } : item))
      );
      showToast('Expense updated.');
    },
    [showToast]
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const apiRes = await flaskApi.deleteExpense(id);
      if (apiRes.ok) {
        setBackendConnected(true);
      }
      setTransactions((prev) => prev.filter((item) => item.id !== id));
      showToast('Expense deleted from ledger.', 'info');
    },
    [showToast]
  );

  const updateCategoryBudget = useCallback(
    (category: ExpenseCategory, allocated: number) => {
      setBudgets((prev) =>
        prev.map((b) => (b.category === category ? { ...b, allocated } : b))
      );
      showToast(`${category} budget updated.`);
    },
    [showToast]
  );

  const applyRecommendedBudgets = useCallback(() => {
    setBudgets((prev) => prev.map((b) => ({ ...b, allocated: b.recommended })));
    showToast('Applied AI-recommended category budgets.');
  }, [showToast]);

  const resetDemoData = useCallback(() => {
    setTransactions(INITIAL_DEMO_TRANSACTIONS);
    setBudgets(INITIAL_DEMO_BUDGETS);
    const initialChat = createInitialSession();
    setChatSessions([initialChat]);
    setActiveSessionId(initialChat.id);
    try {
      localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEYS.BUDGETS);
      localStorage.removeItem(STORAGE_KEYS.CHAT_SESSIONS);
    } catch {
      // Ignore
    }
    showToast('Demo financial data restored to factory defaults.', 'info');
  }, [showToast]);

  // Chatbot session operations
  const createNewChatSession = useCallback(() => {
    const newSession = createInitialSession();
    newSession.title = `Conversation ${chatSessions.length + 1}`;
    setChatSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, [chatSessions.length]);

  const clearActiveChatSession = useCallback(() => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatSessions((prev) =>
      prev.map((session) =>
        session.id === activeSession.id
          ? {
              ...session,
              title: 'New Financial Inquiry',
              updatedAt: now,
              messages: [
                {
                  id: `msg-welcome-${Date.now()}`,
                  role: 'assistant',
                  content: WELCOME_MESSAGE_TEXT,
                  timestamp: now,
                },
              ],
            }
          : session
      )
    );
    showToast('Conversation history cleared.', 'info');
  }, [activeSession.id, showToast]);

  const deleteChatSession = useCallback(
    (id: string) => {
      setChatSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== id);
        if (filtered.length === 0) {
          const fallback = createInitialSession();
          setActiveSessionId(fallback.id);
          return [fallback];
        }
        if (id === activeSessionId) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
    },
    [activeSessionId]
  );

  // Send Chatbot Message strictly through the Flask API integration layer
  const sendChatPrompt = useCallback(
    async (promptText: string) => {
      const trimmed = promptText.trim();
      if (!trimmed || isChatLoading) return;

      const timestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp,
      };

      const targetSessionId = activeSession.id;

      setChatSessions((prev) =>
        prev.map((s) => {
          if (s.id !== targetSessionId) return s;
          const isDefaultTitle =
            s.title.startsWith('Financial Overview') ||
            s.title.startsWith('Conversation') ||
            s.title.startsWith('New Financial');
          return {
            ...s,
            title: isDefaultTitle ? trimmed.slice(0, 38) : s.title,
            updatedAt: timestamp,
            messages: [...s.messages, userMsg],
          };
        })
      );

      setIsChatLoading(true);

      const response = await flaskApi.sendChatMessage({
        message: trimmed,
        sessionId: targetSessionId,
        context: {
          totalMonthlySpend: totalMonthlySpending,
          remainingBudget,
          recentTransactionCount: transactions.length,
        },
      });

      const replyTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      setIsChatLoading(false);

      if (response.ok && response.data) {
        setBackendConnected(true);
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.data.reply,
          timestamp: replyTime,
          structuredData: response.data.structuredData,
        };
        setChatSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? { ...s, updatedAt: replyTime, messages: [...s.messages, assistantMsg] }
              : s
          )
        );
      } else {
        setBackendConnected(false);
        // Honest friendly connection error when the Python Flask backend is unavailable
        const errorMsg: ChatMessage = {
          id: `assistant-err-${Date.now()}`,
          role: 'assistant',
          content:
            'SpendWise AI could not reach the Python Flask backend service to process your request. Start your local Flask server or verify the API endpoint URL in Settings, then retry your message.',
          timestamp: replyTime,
          isError: true,
          errorEndpoint: response.endpointUrl,
          errorDetails: response.error,
        };
        setChatSessions((prev) =>
          prev.map((s) =>
            s.id === targetSessionId
              ? { ...s, updatedAt: replyTime, messages: [...s.messages, errorMsg] }
              : s
          )
        );
      }
    },
    [
      activeSession.id,
      isChatLoading,
      remainingBudget,
      totalMonthlySpending,
      transactions.length,
    ]
  );

  const value = useMemo<FinanceContextValue>(
    () => ({
      activePage,
      setActivePage,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileMenuOpen,
      setMobileMenuOpen,
      isDark,
      toggleTheme,
      setThemeMode,
      currency,
      setCurrency,
      globalSearchQuery,
      setGlobalSearchQuery,
      apiBaseUrl,
      updateApiBaseUrl,
      backendConnected,
      checkingBackend,
      lastSyncError,
      testBackendConnection,
      transactions,
      budgets,
      monthlySeries,
      categoryPredictions,
      smartSuggestions: DEMO_SMART_SUGGESTIONS,
      unnecessarySpending: DEMO_UNNECESSARY_SPENDING,
      totalMonthlySpending,
      totalAllocatedBudget,
      remainingBudget,
      averageDailySpending,
      predictedNextMonthSpending,
      categoryTotals,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      updateCategoryBudget,
      applyRecommendedBudgets,
      resetDemoData,
      chatSessions,
      activeSessionId,
      activeSession,
      isChatLoading,
      setActiveSessionId,
      createNewChatSession,
      clearActiveChatSession,
      deleteChatSession,
      sendChatPrompt,
      userProfile,
      updateUserProfile,
      notificationPrefs,
      updateNotificationPrefs,
      notifications,
      markAllNotificationsRead,
      dismissNotification,
      toastMessage,
      showToast,
    }),
    [
      activePage,
      sidebarCollapsed,
      mobileMenuOpen,
      isDark,
      toggleTheme,
      setThemeMode,
      currency,
      setCurrency,
      globalSearchQuery,
      apiBaseUrl,
      updateApiBaseUrl,
      backendConnected,
      checkingBackend,
      lastSyncError,
      testBackendConnection,
      transactions,
      budgets,
      monthlySeries,
      categoryPredictions,
      totalMonthlySpending,
      totalAllocatedBudget,
      remainingBudget,
      averageDailySpending,
      predictedNextMonthSpending,
      categoryTotals,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      updateCategoryBudget,
      applyRecommendedBudgets,
      resetDemoData,
      chatSessions,
      activeSessionId,
      activeSession,
      isChatLoading,
      createNewChatSession,
      clearActiveChatSession,
      deleteChatSession,
      sendChatPrompt,
      userProfile,
      updateUserProfile,
      notificationPrefs,
      updateNotificationPrefs,
      notifications,
      markAllNotificationsRead,
      dismissNotification,
      toastMessage,
      showToast,
    ]
  );

  return (
    <FinanceContext.Provider value={value}>
      {children}
      {/* Subtle non-intrusive toast feedback */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-sm font-medium shadow-lg border border-slate-700 transition-all duration-150"
        >
          <span>{toastMessage.text}</span>
        </div>
      )}
    </FinanceContext.Provider>
  );
};

export function useFinance(): FinanceContextValue {
  const ctx = useContext(FinanceContext);
  if (!ctx) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return ctx;
}

export { EXPENSE_CATEGORIES };
