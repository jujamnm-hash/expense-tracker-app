import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, TrendingDown, ArrowUpDown, DollarSign, Target, PieChart } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { startOfMonth, endOfMonth, parseISO, format, subMonths } from 'date-fns';

export const CompareTab: React.FC = () => {
  const { expenses, incomes, settings } = useStore();
  const [month1Index, setMonth1Index] = useState(0);
  const [month2Index, setMonth2Index] = useState(1);

  // Generate last 12 months
  const months = useMemo(() => {
    const result = [];
    for (let i = 0; i < 12; i++) {
      const date = subMonths(new Date(), i);
      result.push({
        date,
        label: format(date, 'MMMM yyyy'),
        shortLabel: format(date, 'MMM yy'),
      });
    }
    return result;
  }, []);

  // Calculate data for a specific month
  const getMonthData = (monthIndex: number) => {
    const monthDate = months[monthIndex].date;
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthExpenses = expenses.filter(e => {
      const expDate = parseISO(e.date);
      return expDate >= monthStart && expDate <= monthEnd;
    });

    const monthIncome = incomes.filter(inc => {
      const incDate = parseISO(inc.date);
      return incDate >= monthStart && incDate <= monthEnd;
    });

    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalIncome = monthIncome.reduce((sum, i) => sum + i.amount, 0);
    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    monthExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return {
      totalExpenses,
      totalIncome,
      savings,
      savingsRate,
      expenseCount: monthExpenses.length,
      incomeCount: monthIncome.length,
      topCategories,
      avgExpense: monthExpenses.length > 0 ? totalExpenses / monthExpenses.length : 0,
    };
  };

  const month1Data = getMonthData(month1Index);
  const month2Data = getMonthData(month2Index);

  // Calculate differences
  const expenseDiff = month1Data.totalExpenses - month2Data.totalExpenses;
  const expenseDiffPercent = month2Data.totalExpenses > 0 
    ? ((expenseDiff / month2Data.totalExpenses) * 100) 
    : 0;

  const incomeDiff = month1Data.totalIncome - month2Data.totalIncome;
  const incomeDiffPercent = month2Data.totalIncome > 0 
    ? ((incomeDiff / month2Data.totalIncome) * 100) 
    : 0;

  const savingsDiff = month1Data.savings - month2Data.savings;

  const getDiffColor = (value: number, inverse = false) => {
    if (value === 0) return 'text-gray-600';
    const isPositive = inverse ? value < 0 : value > 0;
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const getDiffIcon = (value: number, inverse = false) => {
    if (value === 0) return <ArrowUpDown className="w-4 h-4" />;
    const isPositive = inverse ? value < 0 : value > 0;
    return isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 text-white">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">بەراوردکردنی مانگانە</h2>
            <p className="text-white/90 text-sm mt-1">
              بەراورد بکە و فێر بە
            </p>
          </div>
        </div>
      </div>

      {/* Month Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-2">
            مانگی یەکەم
          </p>
          <select
            value={month1Index}
            onChange={(e) => setMonth1Index(Number(e.target.value))}
            className="w-full p-2 rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
          <p className="text-sm font-semibold text-purple-900 dark:text-purple-400 mb-2">
            مانگی دووەم
          </p>
          <select
            value={month2Index}
            onChange={(e) => setMonth2Index(Number(e.target.value))}
            className="w-full p-2 rounded-lg border-2 border-purple-300 dark:border-purple-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Cards */}
      <div className="space-y-4">
        {/* Expenses Comparison */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <h3 className="font-bold">خەرجی</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {months[month1Index].shortLabel}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(month1Data.totalExpenses, settings.currency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {month1Data.expenseCount} مامەڵە
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {months[month2Index].shortLabel}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(month2Data.totalExpenses, settings.currency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {month2Data.expenseCount} مامەڵە
              </p>
            </div>
          </div>

          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
            expenseDiff < 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            {getDiffIcon(expenseDiff, true)}
            <span className={`font-bold ${getDiffColor(expenseDiff, true)}`}>
              {expenseDiff > 0 ? '+' : ''}{formatCurrency(Math.abs(expenseDiff), settings.currency)}
              {' '}({expenseDiffPercent > 0 ? '+' : ''}{expenseDiffPercent.toFixed(1)}%)
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {expenseDiff < 0 ? 'کەمتر' : 'زیاتر'} لە {months[month2Index].shortLabel}
            </span>
          </div>
        </div>

        {/* Income Comparison */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-bold">داهات</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {months[month1Index].shortLabel}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(month1Data.totalIncome, settings.currency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {month1Data.incomeCount} مامەڵە
              </p>
            </div>

            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {months[month2Index].shortLabel}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(month2Data.totalIncome, settings.currency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {month2Data.incomeCount} مامەڵە
              </p>
            </div>
          </div>

          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
            incomeDiff > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            {getDiffIcon(incomeDiff)}
            <span className={`font-bold ${getDiffColor(incomeDiff)}`}>
              {incomeDiff > 0 ? '+' : ''}{formatCurrency(Math.abs(incomeDiff), settings.currency)}
              {' '}({incomeDiffPercent > 0 ? '+' : ''}{incomeDiffPercent.toFixed(1)}%)
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {incomeDiff > 0 ? 'زیاتر' : 'کەمتر'} لە {months[month2Index].shortLabel}
            </span>
          </div>
        </div>

        {/* Savings Comparison */}
        <div className="card bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-indigo-900 dark:text-indigo-400">پاشەکەوت</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {months[month1Index].shortLabel}
              </p>
              <p className={`text-2xl font-bold ${month1Data.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(month1Data.savings, settings.currency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {month1Data.savingsRate.toFixed(1)}% ڕێژە
              </p>
            </div>

            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {months[month2Index].shortLabel}
              </p>
              <p className={`text-2xl font-bold ${month2Data.savings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(month2Data.savings, settings.currency)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {month2Data.savingsRate.toFixed(1)}% ڕێژە
              </p>
            </div>
          </div>

          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${
            savingsDiff > 0 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            {getDiffIcon(savingsDiff)}
            <span className={`font-bold ${getDiffColor(savingsDiff)}`}>
              {savingsDiff > 0 ? '+' : ''}{formatCurrency(Math.abs(savingsDiff), settings.currency)}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {savingsDiff > 0 ? 'باشتر' : 'خراپتر'} لە {months[month2Index].shortLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Top Categories Comparison */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-orange-600" />
          <h3 className="font-bold">زۆرترین کاتەگۆری</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-3 text-center">
              {months[month1Index].shortLabel}
            </p>
            <div className="space-y-2">
              {month1Data.topCategories.map(([category, amount], index) => (
                <div key={category} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {index + 1}. {category}
                  </span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(amount, settings.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-400 mb-3 text-center">
              {months[month2Index].shortLabel}
            </p>
            <div className="space-y-2">
              {month2Data.topCategories.map(([category, amount], index) => (
                <div key={category} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {index + 1}. {category}
                  </span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(amount, settings.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Average Expense */}
      <div className="card bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-yellow-600" />
          <h3 className="font-bold text-yellow-900 dark:text-yellow-400">
            ناوەندی خەرجی یەک مامەڵە
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {months[month1Index].shortLabel}
            </p>
            <p className="text-lg font-bold text-yellow-600">
              {formatCurrency(month1Data.avgExpense, settings.currency)}
            </p>
          </div>

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {months[month2Index].shortLabel}
            </p>
            <p className="text-lg font-bold text-yellow-600">
              {formatCurrency(month2Data.avgExpense, settings.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-green-800 dark:text-green-400 mb-1">
              ڕاسپاردەکان
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <li>• بەراوردکردن یارمەتیدەرە بۆ بینینی ترێندەکان</li>
              <li>• هەوڵ بدە خەرجیەکانت کەم بکەیتەوە مانگ دوای مانگ</li>
              <li>• ڕێژەی پاشەکەوت باشتر بکە بەردەوام</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
