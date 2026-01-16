import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Target, Award, Zap, Calendar, DollarSign } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { format, startOfMonth, endOfMonth, subMonths, differenceInDays } from 'date-fns';

export const DashboardTab: React.FC = () => {
  const { expenses, debts, budgets, goals } = useStore();

  const analytics = useMemo(() => {
    const now = new Date();
    const currentMonth = format(now, 'yyyy-MM');
    const lastMonth = format(subMonths(now, 1), 'yyyy-MM');
    
    // Current month expenses
    const currentMonthExpenses = expenses.filter(
      (exp) => format(new Date(exp.date), 'yyyy-MM') === currentMonth
    );
    const currentTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Last month expenses
    const lastMonthExpenses = expenses.filter(
      (exp) => format(new Date(exp.date), 'yyyy-MM') === lastMonth
    );
    const lastTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Calculate trend
    const trend = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;
    
    // Average daily expense
    const daysInMonth = differenceInDays(
      endOfMonth(now),
      startOfMonth(now)
    ) + 1;
    const avgDaily = currentTotal / now.getDate();
    const projectedMonthly = avgDaily * daysInMonth;
    
    // Most expensive category
    const categoryTotals: Record<string, number> = {};
    currentMonthExpenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    
    // Budget status
    const totalBudget = budgets
      .filter((b) => b.month === currentMonth)
      .reduce((sum, b) => sum + b.monthlyLimit, 0);
    const budgetUsage = totalBudget > 0 ? (currentTotal / totalBudget) * 100 : 0;
    
    // Active debts
    const activeDebts = debts.filter((d) => d.status === 'active');
    const totalDebtBorrowed = activeDebts
      .filter((d) => d.type === 'borrowed')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
    const totalDebtLent = activeDebts
      .filter((d) => d.type === 'lent')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
    
    // Goals progress
    const activeGoals = goals.filter((g) => g.currentAmount < g.targetAmount);
    const avgGoalProgress = activeGoals.length > 0
      ? activeGoals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount) * 100, 0) / activeGoals.length
      : 0;
    
    return {
      currentTotal,
      lastTotal,
      trend,
      avgDaily,
      projectedMonthly,
      topCategory,
      totalBudget,
      budgetUsage,
      totalDebtBorrowed,
      totalDebtLent,
      activeGoals: activeGoals.length,
      avgGoalProgress,
    };
  }, [expenses, debts, budgets, goals]);

  const insights = useMemo(() => {
    const tips = [];
    
    if (analytics.trend > 20) {
      tips.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'خەرجی زیادی کردووە!',
        message: `خەرجیەکانت ${analytics.trend.toFixed(0)}% زیاترە لە مانگی ڕابردوو. هەوڵ بدە کەمی بکەیتەوە.`,
        color: 'text-red-600 bg-red-50 dark:bg-red-900/30',
      });
    } else if (analytics.trend < -20) {
      tips.push({
        type: 'success',
        icon: TrendingDown,
        title: 'بەرێکەوت! خەرجی کەمت کردووەتەوە',
        message: `خەرجیەکانت ${Math.abs(analytics.trend).toFixed(0)}% کەمترە لە مانگی ڕابردوو. درێژەی پێبدە!`,
        color: 'text-green-600 bg-green-50 dark:bg-green-900/30',
      });
    }
    
    if (analytics.budgetUsage > 90) {
      tips.push({
        type: 'warning',
        icon: AlertCircle,
        title: 'ئاگاداری بودجە!',
        message: `${analytics.budgetUsage.toFixed(0)}% لە بودجەکەت بەکارهێناوە. وریابە!`,
        color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30',
      });
    }
    
    if (analytics.projectedMonthly > analytics.totalBudget && analytics.totalBudget > 0) {
      tips.push({
        type: 'warning',
        icon: Target,
        title: 'خەرجی زۆرە!',
        message: `بەپێی ناوەندی رۆژانە، خەرجیت دەگاتە ${formatCurrency(analytics.projectedMonthly)} دینار کە زیاترە لە بودجەکەت.`,
        color: 'text-red-600 bg-red-50 dark:bg-red-900/30',
      });
    }
    
    if (analytics.activeGoals > 0 && analytics.avgGoalProgress > 70) {
      tips.push({
        type: 'success',
        icon: Award,
        title: 'نزیکی ئامانجەکانیت!',
        message: `ناوەندی ${analytics.avgGoalProgress.toFixed(0)}% لە ئامانجەکانت تەواو کردووە. درێژەی پێبدە!`,
        color: 'text-green-600 bg-green-50 dark:bg-green-900/30',
      });
    }
    
    if (tips.length === 0) {
      tips.push({
        type: 'info',
        icon: Zap,
        title: 'بەرێکەوت!',
        message: 'خەرجیەکانت بە باشی بەڕێوە دەچن. درێژەی پێبدە!',
        color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
      });
    }
    
    return tips;
  }, [analytics]);

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <h1 className="text-2xl font-bold mb-2">داشبۆرد</h1>
        <p className="text-sm opacity-90">پێشبینی و شیکاری زیرەکانە</p>
      </div>

      {/* AI Insights */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Zap size={20} className="text-yellow-500" />
          شیکاری زیرەکانە
        </h2>
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`card border-2 ${insight.color}`}
            >
              <div className="flex gap-3">
                <Icon size={24} className="flex-shrink-0" />
                <div>
                  <h3 className="font-bold mb-1">{insight.title}</h3>
                  <p className="text-sm opacity-90">{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <Calendar size={18} />
            <span className="text-sm">ناوەندی رۆژانە</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {formatCurrency(analytics.avgDaily)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">دینار</div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
            <TrendingUp size={18} />
            <span className="text-sm">پێشبینی مانگ</span>
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {formatCurrency(analytics.projectedMonthly)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">دینار</div>
        </div>
      </div>

      {/* Trend Comparison */}
      <div className="card">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">
          بەراوردی مانگەکان
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">مانگی ڕابردوو</span>
            <span className="font-bold text-gray-800 dark:text-gray-100">
              {formatCurrency(analytics.lastTotal)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">مانگی ئێستا</span>
            <span className="font-bold text-gray-800 dark:text-gray-100">
              {formatCurrency(analytics.currentTotal)}
            </span>
          </div>
          <div className="pt-2 border-t dark:border-gray-700">
            <div className={`flex items-center gap-2 ${
              analytics.trend > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {analytics.trend > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
              <span className="font-bold">
                {analytics.trend > 0 ? '+' : ''}{analytics.trend.toFixed(1)}%
              </span>
              <span className="text-sm">
                {analytics.trend > 0 ? 'زیادبووە' : 'کەمبووەتەوە'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Category */}
      {analytics.topCategory && (
        <div className="card">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">
            زۆرترین خەرجی
          </h3>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                {analytics.topCategory[0]}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                لەم مانگەدا
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formatCurrency(analytics.topCategory[1])}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">دینار</div>
            </div>
          </div>
        </div>
      )}

      {/* Debts Summary */}
      {(analytics.totalDebtBorrowed > 0 || analytics.totalDebtLent > 0) && (
        <div className="card">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">
            کورتەی قەرزەکان
          </h3>
          <div className="space-y-2">
            {analytics.totalDebtBorrowed > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">قەرزگرتن</span>
                <span className="font-bold text-red-600">
                  {formatCurrency(analytics.totalDebtBorrowed)} دینار
                </span>
              </div>
            )}
            {analytics.totalDebtLent > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">قەرزدان</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(analytics.totalDebtLent)} دینار
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goals Progress */}
      {analytics.activeGoals > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3">
            پێشکەوتنی ئامانجەکان
          </h3>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {analytics.activeGoals} ئامانجی چالاک
            </span>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">
                {analytics.avgGoalProgress.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">ناوەندی پێشکەوتن</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
