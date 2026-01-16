import React, { useState, useMemo } from 'react';
import { Plus, RefreshCw, Trash2, Edit2, Calendar, DollarSign, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Expense } from '../types';
import { format, addDays, addWeeks, addMonths, isBefore } from 'date-fns';

interface RecurringExpense {
  id: string;
  amount: number;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  lastProcessed: string;
  isActive: boolean;
  nextDue: string;
}

export const RecurringTab: React.FC = () => {
  const { addExpense, customCategories, settings } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'خواردن',
    description: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly',
    startDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Load recurring expenses from localStorage
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    const saved = localStorage.getItem('recurringExpenses');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever changed
  const saveRecurring = (expenses: RecurringExpense[]) => {
    setRecurringExpenses(expenses);
    localStorage.setItem('recurringExpenses', JSON.stringify(expenses));
  };

  // Calculate next due date
  const calculateNextDue = (lastProcessed: string, frequency: 'daily' | 'weekly' | 'monthly'): string => {
    const date = new Date(lastProcessed);
    switch (frequency) {
      case 'daily':
        return format(addDays(date, 1), 'yyyy-MM-dd');
      case 'weekly':
        return format(addWeeks(date, 1), 'yyyy-MM-dd');
      case 'monthly':
        return format(addMonths(date, 1), 'yyyy-MM-dd');
    }
  };

  // Process due recurring expenses
  const processDueExpenses = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    let processed = 0;

    const updated = recurringExpenses.map((recurring) => {
      if (recurring.isActive && isBefore(new Date(recurring.nextDue), new Date(today + 'T23:59:59'))) {
        // Create new expense
        const newExpense: Expense = {
          id: crypto.randomUUID(),
          amount: recurring.amount,
          category: recurring.category,
          description: `${recurring.description} (خۆکار)`,
          date: recurring.nextDue,
          createdAt: new Date().toISOString(),
          isRecurring: true,
          recurringFrequency: recurring.frequency,
        };
        addExpense(newExpense);
        processed++;

        // Update recurring expense
        const nextDue = calculateNextDue(recurring.nextDue, recurring.frequency);
        return {
          ...recurring,
          lastProcessed: recurring.nextDue,
          nextDue,
        };
      }
      return recurring;
    });

    if (processed > 0) {
      saveRecurring(updated);
      alert(`${processed} خەرجی دووبارەبووە زیادکرا!`);
    } else {
      alert('هیچ خەرجییەکی دووبارەبووە نییە بۆ ئێستا');
    }
  };

  // Categories list
  const categories = useMemo(() => {
    const defaultCategories = [
      'خواردن',
      'گواستنەوە',
      'خانووبەرە',
      'تەندروستی',
      'قوتابخانە',
      'كارەبا و ئاو',
      'پشوودان',
      'کڕین',
      'هیتر',
    ];
    return [...defaultCategories, ...customCategories];
  }, [customCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newRecurring: RecurringExpense = {
      id: editingId || crypto.randomUUID(),
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      frequency: formData.frequency,
      startDate: formData.startDate,
      lastProcessed: formData.startDate,
      nextDue: calculateNextDue(formData.startDate, formData.frequency),
      isActive: true,
    };

    if (editingId) {
      saveRecurring(
        recurringExpenses.map((r) => (r.id === editingId ? newRecurring : r))
      );
    } else {
      saveRecurring([...recurringExpenses, newRecurring]);
    }

    setShowForm(false);
    setEditingId(null);
    setFormData({
      amount: '',
      category: 'خواردن',
      description: '',
      frequency: 'monthly',
      startDate: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleEdit = (recurring: RecurringExpense) => {
    setEditingId(recurring.id);
    setFormData({
      amount: recurring.amount.toString(),
      category: recurring.category,
      description: recurring.description,
      frequency: recurring.frequency,
      startDate: recurring.startDate,
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('دڵنیایت لە سڕینەوەی ئەم خەرجییە دووبارەبووە؟')) {
      saveRecurring(recurringExpenses.filter((r) => r.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    saveRecurring(
      recurringExpenses.map((r) =>
        r.id === id ? { ...r, isActive: !r.isActive } : r
      )
    );
  };

  const frequencyLabels = {
    daily: 'رۆژانە',
    weekly: 'هەفتانە',
    monthly: 'مانگانە',
  };

  const activeCount = recurringExpenses.filter((r) => r.isActive).length;
  const totalMonthly = recurringExpenses
    .filter((r) => r.isActive)
    .reduce((sum, r) => {
      if (r.frequency === 'monthly') return sum + r.amount;
      if (r.frequency === 'weekly') return sum + r.amount * 4;
      if (r.frequency === 'daily') return sum + r.amount * 30;
      return sum;
    }, 0);

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">خەرجییە دووبارەبووەکان</h1>
              <p className="text-sm opacity-90">Netflix، کارەبا، کرێ، هتد</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs opacity-80 mb-1">چالاک</p>
            <p className="text-2xl font-bold">{activeCount}</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs opacity-80 mb-1">مانگانە (نزیکەی)</p>
            <p className="text-xl font-bold">{formatCurrency(totalMonthly, settings.currency)}</p>
          </div>
        </div>
      </div>

      {/* Process Button */}
      <button
        onClick={processDueExpenses}
        className="w-full card bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-all"
      >
        <div className="flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5" />
          <span className="font-bold">پرۆسێسکردنی خەرجییە دووبارەبووەکان</span>
        </div>
        <p className="text-xs mt-1 opacity-90">هەموو خەرجییەکانی کاتگەیشتوو زیاد دەکات</p>
      </button>

      {/* Add Button */}
      <button
        onClick={() => {
          setEditingId(null);
          setShowForm(!showForm);
        }}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        زیادکردنی خەرجی دووبارەبووە
      </button>

      {/* Form */}
      {showForm && (
        <div className="card">
          <h3 className="font-bold text-lg mb-4">
            {editingId ? 'دەستکاریکردن' : 'زیادکردنی نوێ'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">بڕ</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">جۆر</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input-field"
              >
                {categories.map((cat) => {
                  const catName = typeof cat === 'string' ? cat : cat.name;
                  return (
                    <option key={catName} value={catName}>
                      {catName}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">وردەکاری</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input-field"
                placeholder="Netflix, کارەبا, کرێ..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">دووبارەبوونەوە</label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    frequency: e.target.value as 'daily' | 'weekly' | 'monthly',
                  })
                }
                className="input-field"
              >
                <option value="daily">رۆژانە</option>
                <option value="weekly">هەفتانە</option>
                <option value="monthly">مانگانە</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                بەرواری دەستپێکردن
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1">
                {editingId ? 'نوێکردنەوە' : 'زیادکردن'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="btn-secondary flex-1"
              >
                هەڵوەشاندنەوە
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {recurringExpenses.length === 0 ? (
          <div className="card text-center py-8 text-gray-500 dark:text-gray-400">
            <RefreshCw className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>هیچ خەرجی دووبارەبووەیەک نییە</p>
            <p className="text-sm mt-1">دەتوانیت خەرجی دووبارەبووە زیادبکەیت</p>
          </div>
        ) : (
          recurringExpenses.map((recurring) => (
            <div
              key={recurring.id}
              className={`card ${
                !recurring.isActive ? 'opacity-50' : ''
              } border-l-4 ${
                recurring.isActive ? 'border-green-500' : 'border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">
                      {recurring.description}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        recurring.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      {recurring.isActive ? 'چالاک' : 'ناچالاک'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {recurring.category} • {frequencyLabels[recurring.frequency]}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-red-600">
                    {formatCurrency(recurring.amount, settings.currency)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                <Calendar className="w-4 h-4" />
                <span>داهاتوو: {recurring.nextDue}</span>
              </div>

              {isBefore(new Date(recurring.nextDue), new Date()) && recurring.isActive && (
                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg mb-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>ئەم خەرجییە کاتەکەی هاتووە!</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => toggleActive(recurring.id)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    recurring.isActive
                      ? 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {recurring.isActive ? 'ناچالاککردن' : 'چالاککردن'}
                </button>
                <button
                  onClick={() => handleEdit(recurring)}
                  className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(recurring.id)}
                  className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-blue-900 dark:text-blue-100">
            <p className="font-bold mb-1">چۆن کار دەکات؟</p>
            <p className="text-xs opacity-80">
              خەرجییە دووبارەبووەکانت زیادبکە و کاتێک کاتیان دەگات، کرتە بکە لەسەر
              دوگمەی "پرۆسێسکردن" تا خۆکار زیادبکرێن بۆ خەرجیەکانت.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurringTab;
