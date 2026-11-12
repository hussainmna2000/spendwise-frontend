import {
  Transaction,
  CategoryBudget,
  MonthlyDataPoint,
  CategoryPrediction,
  SmartSuggestion,
  UnnecessarySpendItem,
  UserProfile,
  NotificationPreferences,
  AppNotification,
} from '../types/finance';

export const WELCOME_MESSAGE_TEXT =
  "Hello! I'm SpendWise AI, your personal financial assistant. I can help you understand your spending, predict upcoming expenses, and create smarter budgets. What would you like to know today?";

export const SUGGESTED_CHAT_PROMPTS: string[] = [
  'Where is most of my money going?',
  'Analyze my spending this month.',
  'Predict my expenses for next month.',
  'How can I reduce unnecessary spending?',
  'Suggest a monthly budget for me.',
  'Show my highest spending categories.',
];

// Clearly identified realistic sample demo data used when Flask backend has not yet been connected
export const INITIAL_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN-1024',
    title: 'Whole Foods Market Grocery',
    amount: 164.80,
    category: 'Food',
    date: '2026-11-10',
    description: 'Weekly organic groceries, fresh produce, and pantry staples',
  },
  {
    id: 'TXN-1023',
    title: 'ConEdison Electric & Gas Utility',
    amount: 215.40,
    category: 'Bills',
    date: '2026-11-09',
    description: 'Monthly residential electricity and heating utility billing',
  },
  {
    id: 'TXN-1022',
    title: 'Uber Commute & Airport Ride',
    amount: 68.50,
    category: 'Transportation',
    date: '2026-11-09',
    description: 'Downtown client meeting transit and evening return trip',
  },
  {
    id: 'TXN-1021',
    title: 'Nordstrom Winter Apparel',
    amount: 342.00,
    category: 'Shopping',
    date: '2026-11-08',
    description: 'Merino wool sweater and tailored winter coat',
  },
  {
    id: 'TXN-1020',
    title: 'Blue Bottle Coffee & Bistro Lunch',
    amount: 46.25,
    category: 'Food',
    date: '2026-11-07',
    description: 'Team lunch meeting and specialty espresso',
  },
  {
    id: 'TXN-1019',
    title: 'Coursera Machine Learning Specialization',
    amount: 79.00,
    category: 'Education',
    date: '2026-11-06',
    description: 'Monthly professional certificate subscription for data science',
  },
  {
    id: 'TXN-1018',
    title: 'One Medical Annual Checkup & Lab',
    amount: 145.00,
    category: 'Healthcare',
    date: '2026-11-06',
    description: 'Preventive metabolic panel copay and pharmacy prescription',
  },
  {
    id: 'TXN-1017',
    title: 'Fiber Gigabit Internet & Cloud Storage',
    amount: 112.00,
    category: 'Bills',
    date: '2026-11-05',
    description: 'High-speed home fiber internet and 2TB encrypted backup plan',
  },
  {
    id: 'TXN-1016',
    title: 'AMC IMAX Cinema & Streaming Bundle',
    amount: 84.90,
    category: 'Entertainment',
    date: '2026-11-04',
    description: 'Weekend IMAX tickets plus 4K streaming multi-service renewal',
  },
  {
    id: 'TXN-1015',
    title: 'Shell V-Power Fuel & MetroCard Pass',
    amount: 128.00,
    category: 'Transportation',
    date: '2026-11-04',
    description: 'Full tank refuel and monthly regional transit refill',
  },
  {
    id: 'TXN-1014',
    title: 'Sweetgreen & Artisanal Sushi Dinner',
    amount: 138.60,
    category: 'Food',
    date: '2026-11-03',
    description: 'Weekday salad bowls and Friday evening sushi dining',
  },
  {
    id: 'TXN-1013',
    title: 'Apple Store USB-C Hub & Accessories',
    amount: 219.00,
    category: 'Shopping',
    date: '2026-11-02',
    description: 'Thunderbolt workstation dock and braided charging cables',
  },
  {
    id: 'TXN-1012',
    title: 'Residential Property & Renter Insurance',
    amount: 495.00,
    category: 'Bills',
    date: '2026-11-02',
    description: 'Monthly HOA maintenance fee and comprehensive coverage policy',
  },
  {
    id: 'TXN-1011',
    title: 'Trader Joe’s & Local Farmers Market',
    amount: 192.35,
    category: 'Food',
    date: '2026-11-01',
    description: 'Bi-weekly household grocery restock and fresh bakery items',
  },
  {
    id: 'TXN-1010',
    title: 'Equinox Fitness & Dental Wellness',
    amount: 210.00,
    category: 'Healthcare',
    date: '2026-11-01',
    description: 'Monthly health club membership and preventive dental care',
  },
  {
    id: 'TXN-1009',
    title: 'O’Reilly Technical Books & Workshop',
    amount: 115.00,
    category: 'Education',
    date: '2026-11-01',
    description: 'Quantitative finance textbook and Python engineering seminar',
  },
  {
    id: 'TXN-1008',
    title: 'Symphony Hall Concert Tickets',
    amount: 148.00,
    category: 'Entertainment',
    date: '2026-11-01',
    description: 'Two evening orchestra seats and intermission refreshments',
  },
  {
    id: 'TXN-1007',
    title: 'FedEx International Courier & Dry Cleaning',
    amount: 76.40,
    category: 'Others',
    date: '2026-11-01',
    description: 'Document express shipping and executive suit garment care',
  },
];

export const INITIAL_DEMO_BUDGETS: CategoryBudget[] = [
  { category: 'Food', allocated: 600, recommended: 520 },
  { category: 'Transportation', allocated: 280, recommended: 250 },
  { category: 'Shopping', allocated: 450, recommended: 380 },
  { category: 'Bills', allocated: 900, recommended: 850 },
  { category: 'Entertainment', allocated: 220, recommended: 180 },
  { category: 'Healthcare', allocated: 400, recommended: 400 },
  { category: 'Education', allocated: 250, recommended: 250 },
  { category: 'Others', allocated: 150, recommended: 120 },
];

export const INITIAL_MONTHLY_TREND: MonthlyDataPoint[] = [
  { month: 'May 2026', actual: 2690, predicted: 2640 },
  { month: 'Jun 2026', actual: 2845, predicted: 2790 },
  { month: 'Jul 2026', actual: 3110, predicted: 2980 },
  { month: 'Aug 2026', actual: 2920, predicted: 3010 },
  { month: 'Sep 2026', actual: 2780, predicted: 2850 },
  { month: 'Oct 2026', actual: 3140, predicted: 3060 },
  { month: 'Nov 2026', actual: 2980.2, predicted: 2950 },
  { month: 'Dec 2026 (Forecast)', actual: null, predicted: 3185 },
];

export const DEMO_CATEGORY_PREDICTIONS: CategoryPrediction[] = [
  {
    category: 'Bills',
    historicalAvg: 810,
    currentMonth: 822.4,
    predictedNextMonth: 865,
    changePercent: 5.2,
    confidence: 94,
  },
  {
    category: 'Shopping',
    historicalAvg: 440,
    currentMonth: 561.0,
    predictedNextMonth: 645,
    changePercent: 15.0,
    confidence: 86,
  },
  {
    category: 'Food',
    historicalAvg: 515,
    currentMonth: 542.0,
    predictedNextMonth: 568,
    changePercent: 4.8,
    confidence: 91,
  },
  {
    category: 'Healthcare',
    historicalAvg: 340,
    currentMonth: 355.0,
    predictedNextMonth: 330,
    changePercent: -7.0,
    confidence: 89,
  },
  {
    category: 'Entertainment',
    historicalAvg: 195,
    currentMonth: 232.9,
    predictedNextMonth: 265,
    changePercent: 13.8,
    confidence: 83,
  },
  {
    category: 'Transportation',
    historicalAvg: 215,
    currentMonth: 196.5,
    predictedNextMonth: 218,
    changePercent: 10.9,
    confidence: 88,
  },
  {
    category: 'Education',
    historicalAvg: 190,
    currentMonth: 194.0,
    predictedNextMonth: 194,
    changePercent: 0.0,
    confidence: 96,
  },
  {
    category: 'Others',
    historicalAvg: 95,
    currentMonth: 76.4,
    predictedNextMonth: 100,
    changePercent: 30.9,
    confidence: 79,
  },
];

export const DEMO_SMART_SUGGESTIONS: SmartSuggestion[] = [
  {
    id: 'SUG-1',
    title: 'Consolidate Multi-Platform Streaming & Cinema Tiers',
    description:
      'Your Entertainment spend exceeded its $220 target. Switching from overlapping 4K streaming bundles to a single annual plan reduces recurring charges.',
    category: 'Entertainment',
    potentialMonthlySavings: 54,
    priority: 'high',
  },
  {
    id: 'SUG-2',
    title: 'Implement a 48-Hour Rule on Non-Essential Apparel & Tech',
    description:
      'Shopping transactions averaged $280.50 per order this month (+24.7% over budget). Delaying discretionary purchases by 48 hours curbs impulse spikes.',
    category: 'Shopping',
    potentialMonthlySavings: 145,
    priority: 'high',
  },
  {
    id: 'SUG-3',
    title: 'Shift Mid-Week Bistro Lunches to Batch Meal Prep',
    description:
      'Dining out accounts for 34% of your Food category. Replacing 2 restaurant lunches per week with home-prepared meals keeps Food comfortably under $520.',
    category: 'Food',
    potentialMonthlySavings: 88,
    priority: 'medium',
  },
  {
    id: 'SUG-4',
    title: 'Optimize Off-Peak Utility Usage & Fiber Plan Tier',
    description:
      'Residential electric and gigabit fiber bills rose 4.1% compared to Q3 averages. Enrolling in time-of-use billing and negotiating loyalty rates lowers fixed overhead.',
    category: 'Bills',
    potentialMonthlySavings: 42,
    priority: 'low',
  },
];

export const DEMO_UNNECESSARY_SPENDING: UnnecessarySpendItem[] = [
  {
    id: 'UN-1',
    title: 'Overlapping 4K Streaming & Cinema Add-ons',
    category: 'Entertainment',
    monthlyCost: 48.9,
    frequency: 'Monthly Recurring',
    reason: 'Low utilization detected across 3 simultaneous media subscriptions.',
  },
  {
    id: 'UN-2',
    title: 'Peak-Hour Surge Ride-Hailing Commutes',
    category: 'Transportation',
    monthlyCost: 68.5,
    frequency: '3x per Month',
    reason: 'Occurs on routes already covered by your active regional MetroCard pass.',
  },
  {
    id: 'UN-3',
    title: 'Unplanned Discretionary Workstation & Apparel Upgrades',
    category: 'Shopping',
    monthlyCost: 185.0,
    frequency: 'Ad-hoc Impulse',
    reason: 'Pushed Shopping utilization to 124.7% of monthly allocation.',
  },
];

export const INITIAL_USER_PROFILE: UserProfile = {
  fullName: 'Alex Morgan',
  email: 'alex.morgan@spendwise.finance',
  roleTitle: 'Senior Product Architect',
  monthlyIncome: 6800,
  monthlySavingsGoal: 2200,
};

export const INITIAL_NOTIFICATION_PREFS: NotificationPreferences = {
  overspendingAlerts: true,
  weeklyDigest: true,
  predictionUpdates: true,
  unusualActivity: true,
  budgetThresholdPercent: 85,
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOTIF-1',
    title: 'Shopping Budget Exceeded (124.7%)',
    message: 'Your Shopping spending ($561.00) has surpassed your $450.00 monthly allocation.',
    timestamp: '2 hours ago',
    type: 'danger',
    read: false,
    targetPage: 'budget',
  },
  {
    id: 'NOTIF-2',
    title: 'Entertainment Budget Exceeded (105.9%)',
    message: 'Entertainment expenses reached $232.90 against a $220.00 budget limit.',
    timestamp: '5 hours ago',
    type: 'warning',
    read: false,
    targetPage: 'budget',
  },
  {
    id: 'NOTIF-3',
    title: 'December Forecast Ready',
    message: 'Scikit-learn time-series projection estimates $3,185.00 for next month (+6.9% seasonal variance).',
    timestamp: '1 day ago',
    type: 'info',
    read: false,
    targetPage: 'predictions',
  },
];
