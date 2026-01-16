import React, { useState, useMemo } from 'react';
import { Plus, Filter, Calendar, Repeat, Search, Tag, X } from 'lucide-react';
import { useStore } from '../store';
import { AddExpenseForm } from './AddExpenseForm';
import { RecurringExpenseForm } from './RecurringExpenseForm';
import { ExpenseItem } from './ExpenseItem';
import { formatCurrency, getTodayExpenseTotal } from '../utils';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { EXPENSE_CATEGORIES } from '../types';

export const ExpensesTab: React.FC = () => {
  const expenses = useStore((state) => state.expenses);
  const deleteExpense = useStore((state) => state.deleteExpense);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      
      const expenseDate = new Date(expense.date);
      const [year, month] = filterMonth.split('-').map(Number);
      const monthStart = startOfMonth(new Date(year, month - 1));
      const monthEnd = endOfMonth(monthStart);
      const matchesMonth = expenseDate >= monthStart && expenseDate <= monthEnd;
      
      const matchesSearch = searchTerm === '' || 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTag = !selectedTag || (expense.tags && expense.tags.includes(selectedTag));
      
      return matchesCategory && matchesMonth && matchesSearch && matchesTag;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterCategory, filterMonth, searchTerm, selectedTag]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    expenses.forEach((exp) => {
      if (exp.tags) {
        exp.tags.forEach((tag) => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [expenses]);

  const todayTotal = getTodayExpenseTotal(expenses);
  const monthTotal = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="pb-20">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="text-sm opacity-90 mb-1">خەرجی ئەمرۆ</div>
          <div className="text-2xl font-bold">{formatCurrency(todayTotal)}</div>
          <div className="text-xs opacity-75">دینار</div>
        </div>
        
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="text-sm opacity-90 mb-1">خەرجی مانگ</div>
          <div className="text-2xl font-bold">{formatCurrency(monthTotal)}</div>
          <div className="text-xs opacity-75">دینار</div>
        </div>
      </div>

      {/* Search */}
      <div className="card mb-4">
        <div className="relative">
          <Search size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pr-10"
            placeholder="گەڕان لە خەرجیەکان..."
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={16} className="text-gray-500" />
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedTag === tag
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-medium text-gray-800">فلتەر</h3>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">جۆر</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input text-sm"
            >
              <option value="all">هەموو جۆرەکان</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">مانگ</label>
            <input
              type="month"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="input text-sm"
            />
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="card text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">هیچ خەرجیەک نییە</p>
            <p className="text-sm text-gray-400 mt-1">
              دەستپێبکە بە زیادکردنی خەرجیەکانت
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {filteredExpenses.length} خەرجی
              </h3>
            </div>
            {filteredExpenses.map((expense) => (
              <ExpenseItem
                key={expense.id}
                expense={expense}
                onDelete={deleteExpense}
              />
            ))}
          </>
        )}
      </div>

      {/* Add Button */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        <button
          onClick={() => setShowRecurringForm(true)}
          className="btn bg-purple-500 hover:bg-purple-600 text-white shadow-lg px-4 py-3 rounded-full flex items-center gap-2"
        >
          <Repeat size={20} />
        </button>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn btn-primary shadow-lg px-6 py-3 rounded-full flex items-center gap-2"
        >
          <Plus size={24} />
          <span>زیادکردنی خەرجی</span>
        </button>
      </div>

      {showAddForm && <AddExpenseForm onClose={() => setShowAddForm(false)} />}
      {showRecurringForm && <RecurringExpenseForm onClose={() => setShowRecurringForm(false)} />}
    </div>
  );
};
