import React, { useState } from 'react';
import { Plus, Target, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { format } from 'date-fns';
import { EXPENSE_CATEGORIES } from '../types';

export const BudgetTab: React.FC = () => {
  const { budgets, expenses, addBudget, updateBudget, deleteBudget } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [monthlyLimit, setMonthlyLimit] = useState('');

  const currentMonth = format(new Date(), 'yyyy-MM');

  // Calculate spent amount for each budget
  const budgetsWithSpent = budgets
    .filter((b) => b.month === currentMonth)
    .map((budget) => {
      const spent = expenses
        .filter((exp) => {
          const expDate = new Date(exp.date);
          return (
            exp.category === budget.category &&
            format(expDate, 'yyyy-MM') === currentMonth
          );
        })
        .reduce((sum, exp) => sum + exp.amount, 0);

      return { ...budget, spent };
    });

  const totalBudget = budgetsWithSpent.reduce((sum, b) => sum + b.monthlyLimit, 0);
  const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  const handleAddBudget = () => {
    if (!monthlyLimit || parseFloat(monthlyLimit) <= 0) return;

    // Check if budget already exists for this category and month
    const exists = budgets.find(
      (b) => b.category === category && b.month === currentMonth
    );

    if (exists) {
      updateBudget(exists.id, { monthlyLimit: parseFloat(monthlyLimit) });
    } else {
      addBudget({
        category,
        monthlyLimit: parseFloat(monthlyLimit),
        month: currentMonth,
      });
    }

    setMonthlyLimit('');
    setShowAddForm(false);
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return 'text-red-600 bg-red-50 border-red-200';
    if (percentage >= 80) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  return (
    <div className="pb-20 space-y-6">
      {/* Summary Card */}
      <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Target size={24} />
          <h2 className="text-xl font-bold">بودجەی مانگانە</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <div className="text-xs opacity-90 mb-1">بودجە</div>
            <div className="text-lg font-bold">{formatCurrency(totalBudget)}</div>
          </div>
          <div>
            <div className="text-xs opacity-90 mb-1">خەرجکراو</div>
            <div className="text-lg font-bold">{formatCurrency(totalSpent)}</div>
          </div>
          <div>
            <div className="text-xs opacity-90 mb-1">ماوە</div>
            <div className={`text-lg font-bold ${totalRemaining < 0 ? 'text-red-200' : ''}`}>
              {formatCurrency(Math.abs(totalRemaining))}
            </div>
          </div>
        </div>
        
        {/* Total Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-white/20 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                totalSpent > totalBudget ? 'bg-red-300' : 'bg-white'
              }`}
              style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
            />
          </div>
          <div className="text-xs opacity-90 mt-1 text-center">
            {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0}% لە بودجە بەکارهاتووە
          </div>
        </div>
      </div>

      {/* Budget List */}
      <div className="space-y-3">
        {budgetsWithSpent.length === 0 ? (
          <div className="card text-center py-12">
            <Target size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">هیچ بودجەیەک دانەندراوە</p>
            <p className="text-sm text-gray-400 mt-1">
              بودجەی مانگانەت بۆ هەر جۆرێک دابنێ
            </p>
          </div>
        ) : (
          budgetsWithSpent.map((budget) => {
            const percentage = (budget.spent / budget.monthlyLimit) * 100;
            const remaining = budget.monthlyLimit - budget.spent;

            return (
              <div key={budget.id} className="card">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{budget.category}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-600">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.monthlyLimit)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(budget.spent, budget.monthlyLimit)}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('دڵنیای لە سڕینەوەی ئەم بودجەیە؟')) {
                        deleteBudget(budget.id);
                      }
                    }}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <AlertCircle size={20} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className={`h-2.5 rounded-full transition-all ${getProgressColor(budget.spent, budget.monthlyLimit)}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                {/* Remaining Amount */}
                <div className={`text-sm font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {remaining >= 0
                    ? `${formatCurrency(remaining)} دینار ماوە`
                    : `${formatCurrency(Math.abs(remaining))} دینار زیادە`}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Budget Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-800 mb-4">دانانی بودجە</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  جۆری خەرجی
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="input"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سنووری مانگانە (دینار)
                </label>
                <input
                  type="number"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="input"
                  placeholder="٥٠٠٠٠٠"
                  min="0"
                  step="10000"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddBudget}
                  className="btn btn-primary flex-1"
                >
                  دانان
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary"
                >
                  پاشگەزبوونەوە
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 btn btn-primary shadow-lg px-6 py-3 rounded-full flex items-center gap-2 z-10"
      >
        <Plus size={24} />
        <span>دانانی بودجە</span>
      </button>
    </div>
  );
};
