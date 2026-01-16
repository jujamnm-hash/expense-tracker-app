import React, { useMemo } from 'react';
import { Bell, AlertTriangle, CheckCircle, Clock, DollarSign, TrendingUp, Target, Calendar } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { startOfMonth, endOfMonth, parseISO, differenceInDays, format } from 'date-fns';

interface Notification {
  id: string;
  type: 'budget' | 'bill' | 'goal' | 'debt' | 'income' | 'expense';
  severity: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  date: string;
  icon: React.ElementType;
  color: string;
}

export const NotificationsTab: React.FC = () => {
  const { expenses, incomes, budgets, bills, goals, debts, settings } = useStore();

  const notifications = useMemo(() => {
    const notifs: Notification[] = [];
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Budget warnings
    const monthBudgets = budgets.filter(b => b.month === currentMonth);
    monthBudgets.forEach(budget => {
      const percentage = (budget.spent / budget.monthlyLimit) * 100;
      
      if (percentage > 100) {
        notifs.push({
          id: `budget-over-${budget.id}`,
          type: 'budget',
          severity: 'danger',
          title: `بودجەی ${budget.category} تێپەڕیوە!`,
          message: `${formatCurrency(budget.spent, settings.currency)} خەرجکراوە لە ${formatCurrency(budget.monthlyLimit, settings.currency)} (${percentage.toFixed(0)}%)`,
          date: now.toISOString(),
          icon: AlertTriangle,
          color: 'red',
        });
      } else if (percentage > 90) {
        notifs.push({
          id: `budget-warning-${budget.id}`,
          type: 'budget',
          severity: 'danger',
          title: `بودجەی ${budget.category} نزیکە بە کۆتایی`,
          message: `${formatCurrency(budget.spent, settings.currency)} لە ${formatCurrency(budget.monthlyLimit, settings.currency)} (${percentage.toFixed(0)}%)`,
          date: now.toISOString(),
          icon: AlertTriangle,
          color: 'orange',
        });
      } else if (percentage > 80) {
        notifs.push({
          id: `budget-caution-${budget.id}`,
          type: 'budget',
          severity: 'warning',
          title: `بودجەی ${budget.category} لە 80% تێپەڕیوە`,
          message: `${formatCurrency(budget.spent, settings.currency)} لە ${formatCurrency(budget.monthlyLimit, settings.currency)} (${percentage.toFixed(0)}%)`,
          date: now.toISOString(),
          icon: TrendingUp,
          color: 'yellow',
        });
      }
    });

    // Bill reminders
    bills
      .filter(b => !b.isPaid && b.isRecurring)
      .forEach(bill => {
        const dueDate = parseISO(bill.dueDate);
        const daysUntilDue = differenceInDays(dueDate, now);

        if (daysUntilDue < 0) {
          notifs.push({
            id: `bill-overdue-${bill.id}`,
            type: 'bill',
            severity: 'danger',
            title: `پسوڵەی ${bill.name} دواکەوتووە!`,
            message: `بڕ: ${formatCurrency(bill.amount, settings.currency)} - ${Math.abs(daysUntilDue)} ڕۆژ لەمەوبەر`,
            date: bill.dueDate,
            icon: AlertTriangle,
            color: 'red',
          });
        } else if (daysUntilDue <= bill.reminderDays) {
          notifs.push({
            id: `bill-reminder-${bill.id}`,
            type: 'bill',
            severity: 'warning',
            title: `یادەوەری پسوڵەی ${bill.name}`,
            message: `بڕ: ${formatCurrency(bill.amount, settings.currency)} - ${daysUntilDue} ڕۆژ ماوە`,
            date: bill.dueDate,
            icon: Clock,
            color: 'blue',
          });
        }
      });

    // Goal achievements
    goals.forEach(goal => {
      const percentage = (goal.currentAmount / goal.targetAmount) * 100;
      
      if (percentage >= 100) {
        notifs.push({
          id: `goal-completed-${goal.id}`,
          type: 'goal',
          severity: 'success',
          title: `ئامانجی ${goal.name} تەواو بوو! 🎉`,
          message: `${formatCurrency(goal.currentAmount, settings.currency)} لە ${formatCurrency(goal.targetAmount, settings.currency)}`,
          date: now.toISOString(),
          icon: CheckCircle,
          color: 'green',
        });
      } else if (percentage >= 75) {
        notifs.push({
          id: `goal-progress-${goal.id}`,
          type: 'goal',
          severity: 'info',
          title: `نزیکیت بە ئامانجی ${goal.name}`,
          message: `${percentage.toFixed(0)}% تەواو بووە - ${formatCurrency(goal.targetAmount - goal.currentAmount, settings.currency)} ماوە`,
          date: now.toISOString(),
          icon: Target,
          color: 'purple',
        });
      }
    });

    // Debt reminders
    debts
      .filter(d => d.status === 'active' && d.dueDate)
      .forEach(debt => {
        if (debt.dueDate) {
          const dueDate = parseISO(debt.dueDate);
          const daysUntilDue = differenceInDays(dueDate, now);

          if (daysUntilDue < 0) {
            notifs.push({
              id: `debt-overdue-${debt.id}`,
              type: 'debt',
              severity: 'danger',
              title: `قەرزی ${debt.personName} دواکەوتووە`,
              message: `${formatCurrency(debt.remainingAmount, settings.currency)} - ${Math.abs(daysUntilDue)} ڕۆژ دواکەوتوو`,
              date: debt.dueDate,
              icon: AlertTriangle,
              color: 'red',
            });
          } else if (daysUntilDue <= 7) {
            notifs.push({
              id: `debt-reminder-${debt.id}`,
              type: 'debt',
              severity: 'warning',
              title: `یادەوەری قەرزی ${debt.personName}`,
              message: `${formatCurrency(debt.remainingAmount, settings.currency)} - ${daysUntilDue} ڕۆژ ماوە`,
              date: debt.dueDate,
              icon: Clock,
              color: 'orange',
            });
          }
        }
      });

    // Large expense alerts
    const monthlyExpenses = expenses
      .filter(e => {
        const expDate = parseISO(e.date);
        return expDate >= monthStart && expDate <= monthEnd;
      });

    const avgExpense = monthlyExpenses.length > 0
      ? monthlyExpenses.reduce((sum, e) => sum + e.amount, 0) / monthlyExpenses.length
      : 0;

    monthlyExpenses
      .filter(e => e.amount > avgExpense * 3)
      .slice(0, 3)
      .forEach(expense => {
        notifs.push({
          id: `expense-large-${expense.id}`,
          type: 'expense',
          severity: 'info',
          title: `خەرجی زۆر`,
          message: `${expense.category}: ${formatCurrency(expense.amount, settings.currency)} - ${expense.description}`,
          date: expense.date,
          icon: DollarSign,
          color: 'blue',
        });
      });

    // Income notifications
    const monthlyIncome = incomes
      .filter(inc => {
        const incDate = parseISO(inc.date);
        return incDate >= monthStart && incDate <= monthEnd;
      });

    const recentIncome = monthlyIncome
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 2);

    recentIncome.forEach(income => {
      notifs.push({
        id: `income-received-${income.id}`,
        type: 'income',
        severity: 'success',
        title: `داهاتی نوێ`,
        message: `${income.source}: ${formatCurrency(income.amount, settings.currency)}`,
        date: income.date,
        icon: CheckCircle,
        color: 'green',
      });
    });

    // Sort by severity and date
    return notifs.sort((a, b) => {
      const severityOrder = { danger: 0, warning: 1, success: 2, info: 3 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [expenses, incomes, budgets, bills, goals, debts, settings]);

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'danger':
        return 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-orange-200 dark:border-orange-800';
      case 'success':
        return 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800';
      case 'info':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'red': return 'text-red-600';
      case 'orange': return 'text-orange-600';
      case 'yellow': return 'text-yellow-600';
      case 'green': return 'text-green-600';
      case 'blue': return 'text-blue-600';
      case 'purple': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const dangerCount = notifications.filter(n => n.severity === 'danger').length;
  const warningCount = notifications.filter(n => n.severity === 'warning').length;
  const successCount = notifications.filter(n => n.severity === 'success').length;

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">ئاگادارکردنەوەکان</h2>
              <p className="text-white/90 text-sm mt-1">
                {notifications.length} ئاگادارکردنەوە
              </p>
            </div>
          </div>
          {dangerCount > 0 && (
            <div className="bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
              {dangerCount}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800">
          <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
          <p className="text-2xl font-bold text-red-600">{dangerCount}</p>
          <p className="text-xs text-red-700 dark:text-red-400">مەترسی</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-2 border-orange-200 dark:border-orange-800">
          <Clock className="w-6 h-6 text-orange-600 mb-2" />
          <p className="text-2xl font-bold text-orange-600">{warningCount}</p>
          <p className="text-xs text-orange-700 dark:text-orange-400">ئاگاداری</p>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
          <CheckCircle className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-2xl font-bold text-green-600">{successCount}</p>
          <p className="text-xs text-green-700 dark:text-green-400">سەرکەوتوو</p>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            هیچ ئاگادارکردنەوەیەک نییە!
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            هەموو شتێک باشە 👍
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = notification.icon;
            return (
              <div
                key={notification.id}
                className={`card ${getSeverityStyle(notification.severity)} border-2`}
              >
                <div className="flex gap-3">
                  <div className={`${getIconColor(notification.color)} flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar className="w-3 h-3" />
                      <span>{format(parseISO(notification.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tips */}
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-purple-800 dark:text-purple-400 mb-1">
              تێبینیەکان
            </h4>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• ئاگادارکردنەوەکان ئۆتۆماتیک نوێ دەبنەوە</li>
              <li>• بودجەکانت کۆنترۆڵ بکە بۆ کەمکردنەوەی ئاگادارکردنەوە</li>
              <li>• پسوڵەکانت لە کاتی خۆیاندا بدە</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
