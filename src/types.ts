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

export interface Income {
  id: string;
  amount: number;
  source: string; // سەرچاوە: مووچە، فرۆشتن، کرێ، هتد
  description: string;
  date: string;
  createdAt: string;
  isRecurring?: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly';
  category: 'salary' | 'business' | 'investment' | 'rental' | 'gift' | 'other';
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDate: string;
  isPaid: boolean;
  isRecurring: boolean;
  frequency?: 'monthly' | 'yearly';
  reminderDays: number; // چەند رۆژ پێش بەروار یادەوەری بکات
  createdAt: string;
}

export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
  createdAt: string;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  type: 'student' | 'family' | 'employee' | 'business' | 'custom';
  budgets: {
    category: string;
    limit: number;
  }[];
  createdAt: string;
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
  billReminderDays: number;
}

export type Tab = 'dashboard' | 'expenses' | 'income' | 'bills' | 'debts' | 'reports' | 'budget' | 'goals' | 'categories' | 'templates' | 'analytics' | 'health' | 'settings';

export const INCOME_SOURCES = [
  'مووچە',
  'بازرگانی',
  'وەبەرهێنان',
  'کرێ',
  'دیاری',
  'هیتر'
] as const;

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

export type IncomeSource = typeof INCOME_SOURCES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
