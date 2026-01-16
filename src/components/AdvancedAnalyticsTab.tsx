import React, { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, Target, Zap, Brain } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from 'date-fns';

export const AdvancedAnalyticsTab: React.FC = () => {
  const { expenses, incomes, settings } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState<3 | 6 | 12>(6);

  // Calculate trends over multiple months
  const monthlyData = useMemo(() => {
    const months: { month: string; expenses: number; income: number; savings: number }[] = [];
    
    for (let i = selectedPeriod - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthExpenses = expenses
        .filter(e => {
          const expDate = parseISO(e.date);
          return expDate >= monthStart && expDate <= monthEnd;
        })
        .reduce((sum, e) => sum + e.amount, 0);
      
      const monthIncome = incomes
        .filter(inc => {
          const incDate = parseISO(inc.date);
          return incDate >= monthStart && incDate <= monthEnd;
        })
        .reduce((sum, inc) => sum + inc.amount, 0);
      
      months.push({
        month: format(date, 'MMM yyyy'),
        expenses: monthExpenses,
        income: monthIncome,
        savings: monthIncome - monthExpenses,
      });
    }
    
    return months;
  }, [expenses, incomes, selectedPeriod]);

  // Calculate AI insights
  const insights = useMemo(() => {
    if (monthlyData.length < 3) return null;

    const avgExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0) / monthlyData.length;
    const avgIncome = monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length;
    const avgSavings = monthlyData.reduce((sum, m) => sum + m.savings, 0) / monthlyData.length;
    
    const lastMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];
    
    const expensesTrend = lastMonth.expenses > previousMonth.expenses ? 'زیادبوون' : 'کەمبوونەوە';
    const expensesTrendPercent = Math.abs(
      ((lastMonth.expenses - previousMonth.expenses) / previousMonth.expenses) * 100
    ).toFixed(1);
    
    const incomeTrend = lastMonth.income > previousMonth.income ? 'زیادبوون' : 'کەمبوونەوە';
    const incomeTrendPercent = Math.abs(
      ((lastMonth.income - previousMonth.income) / previousMonth.income) * 100
    ).toFixed(1);

    // Predict next month
    const recentTrend = monthlyData.slice(-3);
    const trendSlope = (recentTrend[2].expenses - recentTrend[0].expenses) / 2;
    const predictedExpenses = lastMonth.expenses + trendSlope;
    const predictedIncome = avgIncome; // Simple assumption
    const predictedSavings = predictedIncome - predictedExpenses;

    return {
      avgExpenses,
      avgIncome,
      avgSavings,
      expensesTrend,
      expensesTrendPercent,
      incomeTrend,
      incomeTrendPercent,
      savingsRate: (avgSavings / avgIncome) * 100,
      predictedExpenses,
      predictedIncome,
      predictedSavings,
    };
  }, [monthlyData]);

  // Category breakdown for top spending
  const topCategories = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    expenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    
    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: (amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100,
      }));
  }, [expenses]);

  const maxExpense = Math.max(...monthlyData.map(m => m.expenses), 1);
  const maxIncome = Math.max(...monthlyData.map(m => m.income), 1);

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 text-white">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">شیکاری پێشکەوتوو</h2>
            <p className="text-purple-100 text-sm mt-1">
              شیکاری ترێند و پێشبینی بە AI
            </p>
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="card">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          ماوەی شیکاری:
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[3, 6, 12].map((months) => (
            <button
              key={months}
              onClick={() => setSelectedPeriod(months as 3 | 6 | 12)}
              className={`py-3 rounded-xl font-semibold transition-all ${
                selectedPeriod === months
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              {months} مانگ
            </button>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      {insights && (
        <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-400">
              تێگەیشتنی AI
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">خەرجی مانگانە</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(insights.avgExpenses, settings.currency)}
                </p>
                <span className={`text-xs flex items-center gap-1 ${
                  insights.expensesTrend === 'زیادبوون' ? 'text-red-500' : 'text-green-500'
                }`}>
                  {insights.expensesTrend === 'زیادبوون' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {insights.expensesTrendPercent}%
                </span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">داهاتی مانگانە</p>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(insights.avgIncome, settings.currency)}
                </p>
                <span className={`text-xs flex items-center gap-1 ${
                  insights.incomeTrend === 'زیادبوون' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {insights.incomeTrend === 'زیادبوون' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {insights.incomeTrendPercent}%
                </span>
              </div>
            </div>

            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg">
              <p className="text-sm opacity-90">ڕێژەی پاشەکەوت</p>
              <p className="text-3xl font-bold mt-1">
                {insights.savingsRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Card */}
      {insights && (
        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-400">
              پێشبینی مانگی داهاتوو
            </h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">خەرجی چاوەڕوانکراو</span>
              <span className="font-bold text-red-600">
                {formatCurrency(insights.predictedExpenses, settings.currency)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">داهاتی چاوەڕوانکراو</span>
              <span className="font-bold text-green-600">
                {formatCurrency(insights.predictedIncome, settings.currency)}
              </span>
            </div>
            <div className="h-px bg-gray-300 dark:bg-gray-700 my-2"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">پاشەکەوتی چاوەڕوانکراو</span>
              <span className={`font-bold text-lg ${
                insights.predictedSavings > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(insights.predictedSavings, settings.currency)}
              </span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300">
              💡 ئەم پێشبینیە لەسەر بنەمای {selectedPeriod} مانگی ڕابردوو دروستکراوە
            </p>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-bold">چارتی ترێند</h3>
        </div>

        <div className="space-y-6">
          {monthlyData.map((data, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {data.month}
                </span>
                <div className="flex gap-3 text-xs">
                  <span className="text-red-600">
                    {formatCurrency(data.expenses, settings.currency)}
                  </span>
                  <span className="text-green-600">
                    {formatCurrency(data.income, settings.currency)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                {/* Expenses Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12">خەرجی</span>
                  <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all"
                      style={{ width: `${(data.expenses / maxExpense) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Income Bar */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12">داهات</span>
                  <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${(data.income / maxIncome) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Savings Indicator */}
              <div className="mt-1 text-right">
                <span className={`text-xs font-semibold ${
                  data.savings > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  پاشەکەوت: {formatCurrency(data.savings, settings.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-bold">زۆرترین کاتەگۆری</h3>
        </div>

        <div className="space-y-3">
          {topCategories.map((cat, index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {index + 1}. {cat.category}
                </span>
                <div className="text-right">
                  <p className="font-bold text-orange-600">
                    {formatCurrency(cat.amount, settings.currency)}
                  </p>
                  <p className="text-xs text-gray-500">{cat.percentage.toFixed(1)}%</p>
                </div>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tip */}
      <div className="card bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800">
        <div className="flex gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-1">
              تێبینی
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              ئەم شیکاریانە بەپێی ڕێژەکانی پێشووت دروستکراون. زانیاری زیاتر = پێشبینی وردتر!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
