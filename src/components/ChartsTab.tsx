import React, { useMemo } from 'react';
import { PieChart, BarChart3, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { format, subMonths } from 'date-fns';

export const ChartsTab: React.FC = () => {
  const { expenses, incomes, budgets, settings } = useStore();

  // Category breakdown for current month
  const categoryData = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const currentExpenses = expenses.filter(
      (exp) => format(new Date(exp.date), 'yyyy-MM') === currentMonth
    );

    const totals: Record<string, number> = {};
    currentExpenses.forEach((exp) => {
      totals[exp.category] = (totals[exp.category] || 0) + exp.amount;
    });

    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-orange-500',
    ];

    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .map(([category, amount], index) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
        color: colors[index % colors.length],
      }));
  }, [expenses]);

  // Last 6 months trend
  const monthlyTrend = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'yyyy-MM');
      const monthName = format(date, 'MMM');

      const monthExpenses = expenses
        .filter((exp) => format(new Date(exp.date), 'yyyy-MM') === monthKey)
        .reduce((sum, exp) => sum + exp.amount, 0);

      const monthIncomes = incomes
        .filter((inc) => format(new Date(inc.date), 'yyyy-MM') === monthKey)
        .reduce((sum, inc) => sum + inc.amount, 0);

      months.push({
        month: monthName,
        expenses: monthExpenses,
        income: monthIncomes,
        savings: monthIncomes - monthExpenses,
      });
    }

    const maxValue = Math.max(
      ...months.map((m) => Math.max(m.expenses, m.income))
    );

    return { months, maxValue };
  }, [expenses, incomes]);

  // Budget usage
  const budgetUsage = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const currentBudgets = budgets.filter((b) => b.month === currentMonth);

    return currentBudgets.map((budget) => {
      const spent = expenses
        .filter(
          (exp) =>
            exp.category === budget.category &&
            format(new Date(exp.date), 'yyyy-MM') === currentMonth
        )
        .reduce((sum, exp) => sum + exp.amount, 0);

      const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;

      return {
        category: budget.category,
        spent,
        limit: budget.monthlyLimit,
        percentage,
      };
    });
  }, [budgets, expenses]);

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">چارت و گرافەکان</h1>
            <p className="text-sm opacity-90">بینینی بینراوی ئامار و زانیاری</p>
          </div>
        </div>
      </div>

      {/* Category Pie Chart */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          دابەشبوونی هاوپێچ بە پێی جۆر
        </h2>

        {categoryData.length > 0 ? (
          <>
            {/* Visual Bars */}
            <div className="space-y-3 mb-6">
              {categoryData.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex items-center px-2">
                    <div
                      className={`h-6 ${item.color} rounded transition-all duration-500 flex items-center justify-end px-2`}
                      style={{ width: `${item.percentage}%` }}
                    >
                      <span className="text-white text-xs font-bold">
                        {formatCurrency(item.amount, settings.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 pt-4 border-t dark:border-gray-700">
              {categoryData.slice(0, 4).map((item) => (
                <div key={item.category} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${item.color}`}></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            هیچ خەرجییەک نییە بۆ ئەم مانگە
          </div>
        )}
      </div>

      {/* Monthly Trend Chart */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          ترێندی 6 مانگی ڕابردوو
        </h2>

        <div className="space-y-6">
          {monthlyTrend.months.map((month, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {month.month}
                </span>
                <span
                  className={`font-bold ${
                    month.savings >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {month.savings >= 0 ? '+' : ''}
                  {formatCurrency(month.savings, settings.currency)}
                </span>
              </div>

              {/* Expenses Bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-red-600">خەرجی</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(month.expenses, settings.currency)}
                  </span>
                </div>
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-500"
                    style={{
                      width: `${
                        monthlyTrend.maxValue > 0
                          ? (month.expenses / monthlyTrend.maxValue) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Income Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-green-600">داهات</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(month.income, settings.currency)}
                  </span>
                </div>
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                    style={{
                      width: `${
                        monthlyTrend.maxValue > 0
                          ? (month.income / monthlyTrend.maxValue) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Usage Progress */}
      {budgetUsage.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-600" />
            بەکارهێنانی بودجە
          </h2>

          <div className="space-y-4">
            {budgetUsage.map((budget) => (
              <div key={budget.category}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">{budget.category}</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatCurrency(budget.spent, settings.currency)} / {formatCurrency(budget.limit, settings.currency)}
                  </span>
                </div>

                <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 flex items-center justify-center ${
                      budget.percentage > 100
                        ? 'bg-gradient-to-r from-red-500 to-red-600'
                        : budget.percentage > 80
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  >
                    <span className="text-white text-xs font-bold">
                      {budget.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {budget.percentage > 100 && (
                  <p className="text-xs text-red-600 mt-1">
                    زیادە بەسەر سنوور: {formatCurrency(budget.spent - budget.limit, settings.currency)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <div className="text-xs text-blue-600 mb-1">کۆی هاوپێچەکان</div>
          <div className="text-2xl font-bold text-blue-600">{categoryData.length}</div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="text-xs text-purple-600 mb-1">بودجەی چاودێریکراو</div>
          <div className="text-2xl font-bold text-purple-600">{budgetUsage.length}</div>
        </div>
      </div>
    </div>
  );
};

export default ChartsTab;
