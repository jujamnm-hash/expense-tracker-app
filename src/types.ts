// Types for the expense tracker system
export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  createdAt: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  tags?: string[];
}

export interface Debt {
  id: string;
  type: 'borrowed' | 'lent'; // قەرزگرتن یان قەرزدان
  personName: string;
  amount: number;
  remainingAmount: number;
  description: string;
  date: string;
  dueDate?: string;
  status: 'active' | 'paid';
  payments: Payment[];
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface MonthlyReport {
  month: string;
  year: number;
  totalExpenses: number;
  categoryBreakdown: { [key: string]: number };
  dailyExpenses: { date: string; amount: number }[];
}

export interface NotificationSettings {
  enabled: boolean;
  time: string; // HH:mm format
  lastNotified?: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  spent: number;
  month: string; // YYYY-MM
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  description: string;
  color: string;
  createdAt: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'ku' | 'ar' | 'en';
  currency: 'IQD' | 'USD' | 'EUR';
  isLocked: boolean;
  password?: string;
}

export type Tab = 'dashboard' | 'expenses' | 'debts' | 'reports' | 'budget' | 'goals' | 'settings';

export const EXPENSE_CATEGORIES = [
  'خواردن',
  'گواستنەوە',
  'خانووبەرە',
  'تەندروستی',
  'قوتابخانە',
  'كارەبا و ئاو',
  'پشوودان',
  'کڕین',
  'هیتر'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
