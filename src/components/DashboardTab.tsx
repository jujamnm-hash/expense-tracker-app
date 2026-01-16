import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, Target, Award, Zap, Calendar, DollarSign, CreditCard, PieChart, Activity, Sparkles, BarChart3, Wallet, Info } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { format, startOfMonth, endOfMonth, subMonths, differenceInDays, parseISO } from 'date-fns';

export const DashboardTab: React.FC = () => {
  const { expenses, incomes, debts, budgets, goals, bills, settings } = useStore();

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
    
    // Income for current month
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const currentMonthIncome = incomes.filter(inc => {
      const incDate = parseISO(inc.date);
      return incDate >= monthStart && incDate <= monthEnd;
    }).reduce((sum, inc) => sum + inc.amount, 0);

    // Savings
    const savings = currentMonthIncome - currentTotal;
    const savingsRate = currentMonthIncome > 0 ? (savings / currentMonthIncome) * 100 : 0;

    // Upcoming bills
    const upcomingBills = bills.filter(b => !b.isPaid && b.isRecurring).length;

    // Recent transactions count
    const recentCount = expenses.filter(e => {
      const days = differenceInDays(now, parseISO(e.date));
      return days <= 7;
    }).length;
    
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
      currentMonthIncome,
      savings,
      savingsRate,
      upcomingBills,
      recentCount,
      currentMonthExpenses,
    };
  }, [expenses, incomes, debts, budgets, goals, bills]);

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
      {/* Header with Quick Stats */}
      <div className="card bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">داشبۆرد</h1>
            <p className="text-sm opacity-90">پێشبینی و شیکاری زیرەکانە</p>
          </div>
          <Sparkles className="w-10 h-10 opacity-80" />
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs opacity-80 mb-1">خەرجی مانگ</p>
            <p className="text-xl font-bold">{formatCurrency(analytics.currentTotal, settings.currency)}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs opacity-80 mb-1">پاشەکەوت</p>
            <p className={`text-xl font-bold ${analytics.savings >= 0 ? 'text-white' : 'text-red-200'}`}>
              {formatCurrency(analytics.savings, settings.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
          <DollarSign className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">داهات</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            {formatCurrency(analytics.currentMonthIncome, settings.currency)}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
          <Activity className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">ڕێژەی پاشەکەوت</p>
          <p className="text-xl font-bold text-blue-600 mt-1">
            {analytics.savingsRate.toFixed(1)}%
          </p>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-2 border-orange-200 dark:border-orange-800">
          <CreditCard className="w-6 h-6 text-orange-600 mb-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">پسوڵەی داهاتوو</p>
          <p className="text-2xl font-bold text-orange-600 mt-1">
            {analytics.upcomingBills}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
          <PieChart className="w-6 h-6 text-purple-600 mb-2" />
          <p className="text-xs text-gray-600 dark:text-gray-400">مامەڵەی 7 ڕۆژ</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {analytics.recentCount}
          </p>
        </div>
      </div>

      {/* Smart Insights */}
      <div className="space-y-3">
        {insights.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div
              key={index}
              className={`card ${tip.color} border-l-4 ${tip.color.split(' ')[0].replace('text-', 'border-')}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1">{tip.title}</h3>
                  <p className="text-xs opacity-80">{tip.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistics Summary */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          ئاماری گشتی
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <span className="text-sm">کۆی گشتی مانگ</span>
            </div>
            <span className="font-bold">{formatCurrency(analytics.currentTotal, settings.currency)}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-sm">ڕۆژانە (ناوەند)</span>
            </div>
            <span className="font-bold">{formatCurrency(analytics.avgDaily, settings.currency)}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm">پێشبینی کۆتایی مانگ</span>
            </div>
            <span className="font-bold">{formatCurrency(analytics.projectedMonthly, settings.currency)}</span>
          </div>

          {analytics.totalBudget > 0 && (
            <>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-green-600" />
                  <span className="text-sm">بودجە</span>
                </div>
                <div className="text-left">
                  <div className="font-bold">{formatCurrency(analytics.totalBudget, settings.currency)}</div>
                  <div className={`text-xs ${
                    analytics.budgetUsage > 100 ? 'text-red-600' : analytics.budgetUsage > 80 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {analytics.budgetUsage.toFixed(0)}% بەکارهێنراوە
                  </div>
                </div>
              </div>
            </>
          )}

          {analytics.totalDebtBorrowed > 0 && (
            <>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
              <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm">قەرزی من</span>
                </div>
                <span className="font-bold text-red-600">
                  {formatCurrency(analytics.totalDebtBorrowed, settings.currency)}
                </span>
              </div>
            </>
          )}

          {analytics.totalDebtLent > 0 && (
            <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="text-sm">قەرزی پێم</span>
              </div>
              <span className="font-bold text-blue-600">
                {formatCurrency(analytics.totalDebtLent, settings.currency)}
              </span>
            </div>
          )}

          {analytics.activeGoals > 0 && (
            <>
              <div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="text-sm">ئامانجە چالاکەکان</span>
                </div>
                <div className="text-left">
                  <div className="font-bold">{analytics.activeGoals}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    ناوەند {analytics.avgGoalProgress.toFixed(0)}%
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Category */}
      {analytics.topCategory && (
        <div className="card bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">زۆرترین خەرجی</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold mb-1">{analytics.topCategory[0]}</div>
              <div className="text-sm opacity-90">{analytics.currentMonthExpenses.filter(e => e.category === analytics.topCategory[0]).length} مامەڵە</div>
            </div>
            <div className="text-3xl font-bold">
              {formatCurrency(analytics.topCategory[1], settings.currency)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardTab;
