import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Expense, Debt, NotificationSettings, Payment, Budget, Goal, AppSettings } from './types';

interface AppState {
  expenses: Expense[];
  debts: Debt[];
  budgets: Budget[];
  goals: Goal[];
  notificationSettings: NotificationSettings;
  settings: AppSettings;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Debt actions
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'payments' | 'remainingAmount'>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteDebt: (id: string) => void;
  addPayment: (debtId: string, payment: Omit<Payment, 'id'>) => void;
  
  // Budget actions
  addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => void;
  updateBudget: (id: string, budget: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  
  // Goal actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'currentAmount'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;
  
  // Settings actions
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Notification actions
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  markNotified: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      expenses: [],
      debts: [],
      budgets: [],
      goals: [],
      notificationSettings: {
        enabled: true,
        time: '20:00',
      },
      settings: {
        theme: 'light',
        language: 'ku',
        currency: 'IQD',
        isLocked: false,
      },
      
      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              ...expense,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      
      updateExpense: (id, updatedExpense) =>
        set((state) => ({
          expenses: state.expenses.map((exp) =>
            exp.id === id ? { ...exp, ...updatedExpense } : exp
          ),
        })),
      
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((exp) => exp.id !== id),
        })),
      
      addDebt: (debt) =>
        set((state) => ({
          debts: [
            ...state.debts,
            {
              ...debt,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              payments: [],
              remainingAmount: debt.amount,
            },
          ],
        })),
      
      updateDebt: (id, updatedDebt) =>
        set((state) => ({
          debts: state.debts.map((debt) =>
            debt.id === id ? { ...debt, ...updatedDebt } : debt
          ),
        })),
      
      deleteDebt: (id) =>
        set((state) => ({
          debts: state.debts.filter((debt) => debt.id !== id),
        })),
      
      addPayment: (debtId, payment) =>
        set((state) => ({
          debts: state.debts.map((debt) => {
            if (debt.id === debtId) {
              const newPayments = [
                ...debt.payments,
                { ...payment, id: Date.now().toString() },
              ];
              const totalPaid = newPayments.reduce(
                (sum, p) => sum + p.amount,
                0
              );
              const remainingAmount = debt.amount - totalPaid;
              const status = remainingAmount <= 0 ? 'paid' : 'active';
              
              return {
                ...debt,
                payments: newPayments,
                remainingAmount: Math.max(0, remainingAmount),
                status,
              };
            }
            return debt;
          }),
        })),
      
      addBudget: (budget) =>
        set((state) => ({
          budgets: [
            ...state.budgets,
            {
              ...budget,
              id: Date.now().toString(),
              spent: 0,
            },
          ],
        })),
      
      updateBudget: (id, updatedBudget) =>
        set((state) => ({
          budgets: state.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...updatedBudget } : budget
          ),
        })),
      
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
        })),
      
      addGoal: (goal) =>
        set((state) => ({
          goals: [
            ...state.goals,
            {
              ...goal,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              currentAmount: 0,
            },
          ],
        })),
      
      updateGoal: (id, updatedGoal) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updatedGoal } : goal
          ),
        })),
      
      deleteGoal: (id) =>
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== id),
        })),
      
      addToGoal: (id, amount) =>
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id
              ? { ...goal, currentAmount: goal.currentAmount + amount }
              : goal
          ),
        })),
      
      updateSettings: (settings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ...settings,
          },
        })),
      
      updateNotificationSettings: (settings) =>
        set((state) => ({
          notificationSettings: {
            ...state.notificationSettings,
            ...settings,
          },
        })),
      
      markNotified: () =>
        set((state) => ({
          notificationSettings: {
            ...state.notificationSettings,
            lastNotified: new Date().toISOString(),
          },
        })),
    }),
    {
      name: 'expense-tracker-storage',
    }
  )
);
