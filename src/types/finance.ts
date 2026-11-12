export type ExpenseCategory =
  | 'Food'
  | 'Transportation'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Education'
  | 'Others';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Others',
];

export type PageId =
  | 'dashboard'
  | 'chatbot'
  | 'expenses'
  | 'analytics'
  | 'predictions'
  | 'budget'
  | 'settings';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  description: string;
}

export interface MonthlyDataPoint {
  month: string; // e.g., "Jun 2026"
  actual: number | null;
  predicted: number | null;
}

export interface WeeklyPatternPoint {
  day: string;
  amount: number;
  transactionsCount: number;
}

export interface CategoryPrediction {
  category: ExpenseCategory;
  historicalAvg: number;
  currentMonth: number;
  predictedNextMonth: number;
  changePercent: number;
  confidence: number;
}

export interface PredictionPayload {
  predictedNextMonthTotal: number;
  previousMonthTotal: number;
  changePercent: number;
  confidenceScore: number;
  modelExplanation: string;
  algorithmUsed: string;
  categoryPredictions: CategoryPrediction[];
  monthlySeries: MonthlyDataPoint[];
}

export interface CategoryBudget {
  category: ExpenseCategory;
  allocated: number;
  recommended: number;
}

export interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  category: ExpenseCategory;
  potentialMonthlySavings: number;
  priority: 'high' | 'medium' | 'low';
}

export interface UnnecessarySpendItem {
  id: string;
  title: string;
  category: ExpenseCategory;
  monthlyCost: number;
  frequency: string;
  reason: string;
}

export interface StructuredChatData {
  summary?: {
    label: string;
    value: number;
    changePercent?: number;
  }[];
  categoryBreakdown?: {
    category: ExpenseCategory;
    amount: number;
    percentage: number;
  }[];
  predictions?: {
    nextMonthTotal: number;
    confidence?: number;
    topIncreases?: { category: ExpenseCategory; predicted: number; changePercent: number }[];
  };
  budgetSuggestions?: {
    category: ExpenseCategory;
    current: number;
    recommended: number;
    note: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
  errorEndpoint?: string;
  errorDetails?: string;
  structuredData?: StructuredChatData;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface UserProfile {
  fullName: string;
  email: string;
  roleTitle: string;
  monthlyIncome: number;
  monthlySavingsGoal: number;
}

export interface NotificationPreferences {
  overspendingAlerts: boolean;
  weeklyDigest: boolean;
  predictionUpdates: boolean;
  unusualActivity: boolean;
  budgetThresholdPercent: number;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'warning' | 'danger' | 'info' | 'success';
  read: boolean;
  targetPage?: PageId;
}

export interface ApiEndpointConfig {
  baseUrl: string;
  timeoutMs: number;
  endpoints: {
    chat: string;
    dashboard: string;
    expenses: string;
    categories: string;
    analytics: string;
    predictions: string;
    budget: string;
    health: string;
  };
}
