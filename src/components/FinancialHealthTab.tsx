import React, { useMemo } from 'react';
import { Heart, TrendingUp, Shield, Award, AlertCircle, CheckCircle, XCircle, Zap } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

export const FinancialHealthTab: React.FC = () => {
  const { expenses, incomes, debts, budgets, goals, settings } = useStore();

  // Calculate financial health metrics
  const healthMetrics = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Current month expenses and income
    const monthlyExpenses = expenses
      .filter(e => {
        const expDate = parseISO(e.date);
        return expDate >= monthStart && expDate <= monthEnd;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const monthlyIncome = incomes
      .filter(inc => {
        const incDate = parseISO(inc.date);
        return incDate >= monthStart && incDate <= monthEnd;
      })
      .reduce((sum, inc) => sum + inc.amount, 0);

    const monthlySavings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    // Total debt
    const totalDebt = debts
      .filter(d => d.status === 'active')
      .reduce((sum, d) => sum + d.remainingAmount, 0);

    // Budget adherence
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthBudgets = budgets.filter(b => b.month === currentMonth);
    const budgetUsage = monthBudgets.length > 0
      ? monthBudgets.reduce((sum, b) => sum + (b.spent / b.monthlyLimit), 0) / monthBudgets.length * 100
      : 0;

    // Goals progress
    const goalsProgress = goals.length > 0
      ? goals.reduce((sum, g) => sum + (g.currentAmount / g.targetAmount * 100), 0) / goals.length
      : 0;

    // Emergency fund (assuming 3-6 months of expenses is ideal)
    const emergencyFundMonths = monthlyExpenses > 0 ? monthlySavings / monthlyExpenses : 0;

    // Calculate individual scores (0-100)
    const savingsScore = Math.min(100, Math.max(0, savingsRate * 5)); // 20% savings = 100
    const debtScore = totalDebt === 0 ? 100 : Math.max(0, 100 - (totalDebt / monthlyIncome) * 10);
    const budgetScore = budgetUsage <= 80 ? 100 : Math.max(0, 100 - (budgetUsage - 80) * 5);
    const goalsScore = goalsProgress;
    const emergencyScore = Math.min(100, emergencyFundMonths * 20); // 5 months = 100

    // Overall health score (weighted average)
    const overallScore = (
      savingsScore * 0.30 +
      debtScore * 0.25 +
      budgetScore * 0.20 +
      goalsScore * 0.15 +
      emergencyScore * 0.10
    );

    return {
      overallScore: Math.round(overallScore),
      savingsScore: Math.round(savingsScore),
      debtScore: Math.round(debtScore),
      budgetScore: Math.round(budgetScore),
      goalsScore: Math.round(goalsScore),
      emergencyScore: Math.round(emergencyScore),
      savingsRate,
      monthlySavings,
      totalDebt,
      budgetUsage,
      emergencyFundMonths,
      monthlyIncome,
      monthlyExpenses,
    };
  }, [expenses, incomes, debts, budgets, goals]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'from-green-500 to-emerald-500', text: 'text-green-600', badge: 'bg-green-500' };
    if (score >= 60) return { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-600', badge: 'bg-blue-500' };
    if (score >= 40) return { bg: 'from-yellow-500 to-orange-500', text: 'text-orange-600', badge: 'bg-orange-500' };
    return { bg: 'from-red-500 to-pink-500', text: 'text-red-600', badge: 'bg-red-500' };
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'نایاب';
    if (score >= 60) return 'باش';
    if (score >= 40) return 'مامناوەند';
    return 'لاواز';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Award className="w-6 h-6" />;
    if (score >= 60) return <CheckCircle className="w-6 h-6" />;
    if (score >= 40) return <AlertCircle className="w-6 h-6" />;
    return <XCircle className="w-6 h-6" />;
  };

  const overallColor = getScoreColor(healthMetrics.overallScore);

  // Recommendations based on scores
  const recommendations = [];
  if (healthMetrics.savingsScore < 60) {
    recommendations.push('🎯 هەوڵ بدە زیاتر لە 15% لە داهاتەکەت پاشەکەوت بکەی');
  }
  if (healthMetrics.debtScore < 60) {
    recommendations.push('💳 سەرنج بدە کەمکردنەوەی قەرزەکانت - ئەولەویەتیان بدە');
  }
  if (healthMetrics.budgetScore < 60) {
    recommendations.push('📊 خەرجیەکانت زیادە لە بودجەکەت - کۆنترۆڵی زیاتر بکە');
  }
  if (healthMetrics.emergencyScore < 40) {
    recommendations.push('🚨 پارەی فریاگوزاری دروست بکە - لانیکەم 3-6 مانگ');
  }
  if (healthMetrics.goalsScore < 40 && goals.length > 0) {
    recommendations.push('🎯 هەوڵ بدە زیاتر بەرەو ئامانجەکانت بچی');
  }
  if (recommendations.length === 0) {
    recommendations.push('✨ ئافەرین! بەردەوام بە لەسەر ئەم ڕێگایە!');
  }

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className={`card bg-gradient-to-br ${overallColor.bg} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">تەندروستی دارایی</h2>
              <p className="text-white/90 text-sm mt-1">
                شیکاری تەواوی دۆخی دارایی
              </p>
            </div>
          </div>
          {getScoreIcon(healthMetrics.overallScore)}
        </div>
      </div>

      {/* Overall Score */}
      <div className={`card bg-gradient-to-br ${overallColor.bg} text-white`}>
        <div className="text-center">
          <p className="text-white/90 text-sm mb-2">نمرەی گشتی</p>
          <div className="relative w-48 h-48 mx-auto">
            <svg className="transform -rotate-90 w-48 h-48">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="16"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="white"
                strokeWidth="16"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - healthMetrics.overallScore / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-6xl font-bold">{healthMetrics.overallScore}</p>
              <p className="text-xl font-semibold">{getScoreLabel(healthMetrics.overallScore)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          وردەکاری نمرەکان
        </h3>
        <div className="space-y-4">
          {/* Savings Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                پاشەکەوت ({healthMetrics.savingsRate.toFixed(1)}%)
              </span>
              <span className={`font-bold ${getScoreColor(healthMetrics.savingsScore).text}`}>
                {healthMetrics.savingsScore}/100
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getScoreColor(healthMetrics.savingsScore).bg} transition-all duration-500`}
                style={{ width: `${healthMetrics.savingsScore}%` }}
              />
            </div>
          </div>

          {/* Debt Management */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                بەڕێوەبردنی قەرز
              </span>
              <span className={`font-bold ${getScoreColor(healthMetrics.debtScore).text}`}>
                {healthMetrics.debtScore}/100
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getScoreColor(healthMetrics.debtScore).bg} transition-all duration-500`}
                style={{ width: `${healthMetrics.debtScore}%` }}
              />
            </div>
          </div>

          {/* Budget Adherence */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                پابەندبوون بە بودجە
              </span>
              <span className={`font-bold ${getScoreColor(healthMetrics.budgetScore).text}`}>
                {healthMetrics.budgetScore}/100
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getScoreColor(healthMetrics.budgetScore).bg} transition-all duration-500`}
                style={{ width: `${healthMetrics.budgetScore}%` }}
              />
            </div>
          </div>

          {/* Goals Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                پێشکەوتنی ئامانج
              </span>
              <span className={`font-bold ${getScoreColor(healthMetrics.goalsScore).text}`}>
                {healthMetrics.goalsScore}/100
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getScoreColor(healthMetrics.goalsScore).bg} transition-all duration-500`}
                style={{ width: `${healthMetrics.goalsScore}%` }}
              />
            </div>
          </div>

          {/* Emergency Fund */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                پارەی فریاگوزاری
              </span>
              <span className={`font-bold ${getScoreColor(healthMetrics.emergencyScore).text}`}>
                {healthMetrics.emergencyScore}/100
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getScoreColor(healthMetrics.emergencyScore).bg} transition-all duration-500`}
                style={{ width: `${healthMetrics.emergencyScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800">
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">داهاتی مانگانە</p>
          <p className="text-xl font-bold text-green-600 mt-1">
            {formatCurrency(healthMetrics.monthlyIncome, settings.currency)}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800">
          <Shield className="w-6 h-6 text-red-600 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">خەرجی مانگانە</p>
          <p className="text-xl font-bold text-red-600 mt-1">
            {formatCurrency(healthMetrics.monthlyExpenses, settings.currency)}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800">
          <Award className="w-6 h-6 text-blue-600 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">پاشەکەوت</p>
          <p className={`text-xl font-bold mt-1 ${healthMetrics.monthlySavings >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(healthMetrics.monthlySavings, settings.currency)}
          </p>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
          <AlertCircle className="w-6 h-6 text-purple-600 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">کۆی قەرز</p>
          <p className="text-xl font-bold text-purple-600 mt-1">
            {formatCurrency(healthMetrics.totalDebt, settings.currency)}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800">
        <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-400 mb-3 flex items-center gap-2">
          💡 ڕاسپاردەکان
        </h3>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="text-sm text-yellow-800 dark:text-yellow-300 flex items-start gap-2">
              <span className="mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Info */}
      <div className="card bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex gap-3">
          <span className="text-2xl">📈</span>
          <div>
            <h4 className="font-bold text-indigo-800 dark:text-indigo-400 mb-1">
              چۆن نمرەکە حساب دەکرێت؟
            </h4>
            <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
              <li>• پاشەکەوت: 30% - خۆڵ لە 20% بپارێزە</li>
              <li>• قەرز: 25% - کەمتر باشترە</li>
              <li>• بودجە: 20% - لە 80% کەمتر بەکاری بهێنە</li>
              <li>• ئامانج: 15% - بەردەوام بە</li>
              <li>• فریاگوزاری: 10% - 3-6 مانگ</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
