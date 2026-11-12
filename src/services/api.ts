import {
  ApiEndpointConfig,
  CategoryBudget,
  ExpenseCategory,
  StructuredChatData,
  Transaction,
} from '../types/finance';

export const DEFAULT_API_CONFIG: ApiEndpointConfig = {
  baseUrl: (import.meta.env.VITE_API_BASE_URL || 'https://spendwise-backend-am5k.onrender.com/api').replace(/\/+$/, ''),
  timeoutMs: 65000,
  endpoints: {
    chat: '/chat',
    dashboard: '/dashboard',
    expenses: '/expenses',
    categories: '/categories',
    analytics: '/analytics',
    predictions: '/predictions',
    budget: '/budget',
    health: '/health',
  },
};

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  endpointUrl: string;
}

export interface FlaskChatResponse {
  reply: string;
  structuredData?: StructuredChatData;
}

/**
 * Centralized API Service Layer for communicating with the Python Flask backend
 * (Flask + Pandas + Scikit-learn).
 *
 * All UI components call these functions rather than making direct fetch calls.
 */
class SpendWiseFlaskApiService {
  private config: ApiEndpointConfig = { ...DEFAULT_API_CONFIG };

  constructor() {
    try {
      const savedBaseUrl = localStorage.getItem('spendwise_api_base_url');
      if (savedBaseUrl && savedBaseUrl.trim()) {
        this.config.baseUrl = savedBaseUrl.trim().replace(/\/+$/, '');
      }
    } catch {
      // Ignore storage access errors
    }
  }

  public getConfig(): ApiEndpointConfig {
    return { ...this.config };
  }

  public setBaseUrl(newBaseUrl: string): void {
    const cleaned = newBaseUrl.trim().replace(/\/+$/, '') || DEFAULT_API_CONFIG.baseUrl;
    this.config.baseUrl = cleaned;
    try {
      localStorage.setItem('spendwise_api_base_url', cleaned);
    } catch {
      // Ignore storage errors
    }
  }

  private buildUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.config.baseUrl}${normalizedPath}`;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<ApiResult<T>> {
    const endpointUrl = this.buildUrl(path);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(endpointUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options.headers || {}),
        },
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errMessage = `HTTP ${response.status} (${response.statusText || 'Backend Error'})`;
        try {
          const errJson = await response.json();
          if (errJson && typeof errJson.error === 'string') {
            errMessage = errJson.error;
          } else if (errJson && typeof errJson.message === 'string') {
            errMessage = errJson.message;
          }
        } catch {
          // Response was not JSON
        }
        return {
          ok: false,
          error: errMessage,
          statusCode: response.status,
          endpointUrl,
        };
      }

      const payload = await response.json();
      if (payload === null || payload === undefined) {
        return {
          ok: false,
          error: 'Empty JSON payload returned from Flask backend.',
          statusCode: response.status,
          endpointUrl,
        };
      }

      return {
        ok: true,
        data: payload as T,
        statusCode: response.status,
        endpointUrl,
      };
    } catch (err: unknown) {
      clearTimeout(timer);
      const isAbort = err instanceof DOMException && err.name === 'AbortError';
      const errorMsg = isAbort
        ? `Request timed out after ${this.config.timeoutMs / 1000}s waiting for Flask server at ${endpointUrl}.`
        : `Unable to reach Python Flask backend at ${endpointUrl}. Ensure your Flask server is running and CORS is enabled.`;

      return {
        ok: false,
        error: errorMsg,
        endpointUrl,
      };
    }
  }

  /**
   * 1. Check Flask server health/status
   */
  public async checkBackendHealth(): Promise<ApiResult<{ status: string }>> {
    return this.request<{ status: string }>(this.config.endpoints.health, {
      method: 'GET',
    });
  }

  /**
   * 2. Send Chatbot Message to Flask AI Assistant
   * Never fabricates or mocks an AI response if the backend is offline.
   */
  public async sendChatMessage(payload: {
    message: string;
    sessionId: string;
    context?: {
      totalMonthlySpend: number;
      remainingBudget: number;
      recentTransactionCount: number;
    };
  }): Promise<ApiResult<FlaskChatResponse>> {
    const res = await this.request<Record<string, unknown>>(
      this.config.endpoints.chat,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok || !res.data) {
      return {
        ok: false,
        error: res.error,
        statusCode: res.statusCode,
        endpointUrl: res.endpointUrl,
      };
    }

    // Validate response shape
    const raw = res.data;
    const replyText =
      typeof raw.reply === 'string'
        ? raw.reply
        : typeof raw.response === 'string'
          ? raw.response
          : typeof raw.message === 'string'
            ? raw.message
            : null;

    if (!replyText) {
      return {
        ok: false,
        error:
          'Invalid response schema from Flask /chat endpoint. Expected JSON containing a "reply" string.',
        endpointUrl: res.endpointUrl,
      };
    }

    return {
      ok: true,
      data: {
        reply: replyText,
        structuredData: (raw.structuredData || raw.data) as StructuredChatData | undefined,
      },
      statusCode: res.statusCode,
      endpointUrl: res.endpointUrl,
    };
  }

  /**
   * 3. Retrieve Dashboard Statistics
   */
  public async fetchDashboardStats(): Promise<ApiResult<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(this.config.endpoints.dashboard, {
      method: 'GET',
    });
  }

  /**
   * 4. Fetch All Transactions
   */
  public async fetchTransactions(): Promise<ApiResult<Transaction[]>> {
    const res = await this.request<Transaction[] | { transactions: Transaction[] }>(
      this.config.endpoints.expenses,
      { method: 'GET' }
    );
    if (!res.ok || !res.data) return res as ApiResult<Transaction[]>;

    const list = Array.isArray(res.data)
      ? res.data
      : Array.isArray((res.data as { transactions?: Transaction[] }).transactions)
        ? (res.data as { transactions: Transaction[] }).transactions
        : null;

    if (!list) {
      return {
        ok: false,
        error: 'Invalid response schema from /expenses endpoint.',
        endpointUrl: res.endpointUrl,
      };
    }

    return { ok: true, data: list, endpointUrl: res.endpointUrl };
  }

  /**
   * 5. Add New Expense
   */
  public async addExpense(
    expense: Omit<Transaction, 'id'>
  ): Promise<ApiResult<Transaction>> {
    return this.request<Transaction>(this.config.endpoints.expenses, {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  }

  /**
   * 6. Update Existing Expense
   */
  public async updateExpense(
    id: string,
    expense: Partial<Transaction>
  ): Promise<ApiResult<Transaction>> {
    return this.request<Transaction>(
      `${this.config.endpoints.expenses}/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(expense),
      }
    );
  }

  /**
   * 7. Delete Expense
   */
  public async deleteExpense(id: string): Promise<ApiResult<{ deletedId: string }>> {
    return this.request<{ deletedId: string }>(
      `${this.config.endpoints.expenses}/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * 8. Retrieve Expense Categories
   */
  public async fetchCategories(): Promise<ApiResult<ExpenseCategory[]>> {
    return this.request<ExpenseCategory[]>(this.config.endpoints.categories, {
      method: 'GET',
    });
  }

  /**
   * 9. Fetch Spending Analytics (Pandas aggregation endpoint)
   */
  public async fetchAnalytics(): Promise<ApiResult<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(this.config.endpoints.analytics, {
      method: 'GET',
    });
  }

  /**
   * 10. Fetch Spending Predictions (Scikit-learn regression endpoint)
   */
  public async fetchPredictions(): Promise<ApiResult<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>(this.config.endpoints.predictions, {
      method: 'GET',
    });
  }

  /**
   * 11. Fetch Smart Budget Recommendations
   */
  public async fetchBudgetRecommendations(): Promise<
    ApiResult<{ budgets?: CategoryBudget[]; [key: string]: unknown }>
  > {
    return this.request<{ budgets?: CategoryBudget[]; [key: string]: unknown }>(
      this.config.endpoints.budget,
      { method: 'GET' }
    );
  }
}

export const flaskApi = new SpendWiseFlaskApiService();
