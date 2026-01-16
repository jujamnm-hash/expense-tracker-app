import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Expense, Debt, NotificationSettings, Payment, Budget, Goal, AppSettings, Income, Bill, CustomCategory, BudgetTemplate } from './types';

interface AppState {
  expenses: Expense[];
  incomes: Income[];
  bills: Bill[];
  debts: Debt[];
  budgets: Budget[];
  goals: Goal[];
  customCategories: CustomCategory[];
  budgetTemplates: BudgetTemplate[];
  notificationSettings: NotificationSettings;
  settings: AppSettings;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Income actions
  addIncome: (income: Omit<Income, 'id' | 'createdAt'>) => void;
  deleteIncome: (id: string) => void;
  
  // Bill actions
  addBill: (bill: Omit<Bill, 'id' | 'createdAt'>) => void;
  deleteBill: (id: string) => void;
  toggleBillPaid: (id: string) => void;
  
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
  
  // Custom Category actions
  addCustomCategory: (category: Omit<CustomCategory, 'id' | 'createdAt'>) => void;
  deleteCustomCategory: (id: string) => void;
  
  // Budget Template actions
  addBudgetTemplate: (template: Omit<BudgetTemplate, 'id' | 'createdAt'>) => void;
  deleteBudgetTemplate: (id: string) => void;
  applyBudgetTemplate: (templateId: string) => void;
  
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
      incomes: [],
      bills: [],
      debts: [],
      budgets: [],
      goals: [],
      customCategories: [],
      budgetTemplates: [],
      notificationSettings: {
        enabled: true,
        time: '20:00',
      },
      settings: {
        theme: 'light',
        language: 'ku',
        currency: 'IQD',
        isLocked: false,
        billReminderDays: 3,
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
      
      addIncome: (income) =>
        set((state) => ({
          incomes: [
            ...state.incomes,
            {
              ...income,
              id: Date.now().toString() + '-income',
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      
      deleteIncome: (id) =>
        set((state) => ({
          incomes: state.incomes.filter((inc) => inc.id !== id),
        })),
      
      addBill: (bill) =>
        set((state) => ({
          bills: [
            ...state.bills,
            {
              ...bill,
              id: Date.now().toString() + '-bill',
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      
      deleteBill: (id) =>
        set((state) => ({
          bills: state.bills.filter((bill) => bill.id !== id),
        })),
      
      toggleBillPaid: (id) =>
        set((state) => ({
          bills: state.bills.map((bill) =>
            bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill
          ),
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
      
      addCustomCategory: (category) =>
        set((state) => ({
          customCategories: [
            ...state.customCategories,
            {
              ...category,
              id: Date.now().toString() + '-category',
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      
      deleteCustomCategory: (id) =>
        set((state) => ({
          customCategories: state.customCategories.filter((c) => c.id !== id),
        })),
      
      addBudgetTemplate: (template) =>
        set((state) => ({
          budgetTemplates: [
            ...state.budgetTemplates,
            {
              ...template,
              id: Date.now().toString() + '-template',
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      
      deleteBudgetTemplate: (id) =>
        set((state) => ({
          budgetTemplates: state.budgetTemplates.filter((t) => t.id !== id),
        })),
      
      applyBudgetTemplate: (templateId) =>
        set((state) => {
          const template = state.budgetTemplates.find((t) => t.id === templateId);
          if (!template) return state;
          
          const newBudgets: Budget[] = template.budgets.map((b, index) => ({
            id: (Date.now() + index).toString() + '-budget',
            category: b.category,
            monthlyLimit: b.limit,
            spent: 0,
            month: new Date().toISOString().slice(0, 7),
          }));
          
          return {
            ...state,
            budgets: [...state.budgets, ...newBudgets],
          };
        }),
      
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
