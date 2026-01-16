import React, { useState } from 'react';
import { Plus, TrendingUp, DollarSign, Calendar, Trash2, Filter, Repeat } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { format } from 'date-fns';
import { INCOME_SOURCES } from '../types';

export const IncomeTab: React.FC = () => {
  const { incomes, addIncome, deleteIncome, settings } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [source, setSource] = useState<string>(INCOME_SOURCES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0) {
      addIncome({
        amount,
        source,
        description: description.trim(),
        date,
        isRecurring,
        recurringFrequency: isRecurring ? frequency : undefined,
        category: 'salary' as any,
      });
      setAmount(0);
      setDescription('');
      setIsRecurring(false);
      setShowForm(false);
    }
  };

  const filteredIncomes = incomes.filter(income => {
    const incomeMonth = format(new Date(income.date), 'yyyy-MM');
    return incomeMonth === selectedMonth;
  });

  const totalIncome = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);
  const totalAllTime = incomes.reduce((sum, income) => sum + income.amount, 0);

  // Group by source
  const incomeBySource = filteredIncomes.reduce((acc, income) => {
    acc[income.source] = (acc[income.source] || 0) + income.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="pb-20 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">داهاتی ئەم مانگە</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalIncome, settings.currency)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">کۆی گشتی</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalAllTime, settings.currency)}</p>
            </div>
            <DollarSign className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">ژمارەی داهات</p>
              <p className="text-2xl font-bold mt-1">{filteredIncomes.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Income by Source */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          داهات بەپێی سەرچاوە
        </h3>
        <div className="space-y-3">
          {Object.entries(incomeBySource).map(([source, amount]) => {
            const percentage = (amount / totalIncome) * 100;
            return (
              <div key={source}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{source}</span>
                  <span className="font-semibold">{formatCurrency(amount, settings.currency)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Month Filter */}
      <div className="card">
        <label className="block text-sm font-medium mb-2">مانگی هەڵبژێردراو</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input w-full"
        />
      </div>

      {/* Add Income Button */}
      <button
        onClick={() => setShowForm(true)}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        زیادکردنی داهات
      </button>

      {/* Add Income Form */}
      {showForm && (
        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 border-2 border-green-200 dark:border-green-800">
          <h3 className="text-lg font-bold mb-4 text-green-800 dark:text-green-400">
            داهاتی نوێ
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">بڕی پارە</label>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input w-full"
                placeholder="0"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">سەرچاوە</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="input w-full"
              >
                {INCOME_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">بەروار</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">وردەکاری</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input w-full"
                placeholder="تێبینی دەربارەی داهاتەکە"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-green-600"
              />
              <label htmlFor="recurring" className="text-sm flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                داهاتی دووبارە
              </label>
            </div>

            {isRecurring && (
              <div>
                <label className="block text-sm font-medium mb-2">ماوە</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="input w-full"
                >
                  <option value="daily">رۆژانە</option>
                  <option value="weekly">هەفتانە</option>
                  <option value="monthly">مانگانە</option>
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                زیادکردن
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setAmount(0);
                  setDescription('');
                  setIsRecurring(false);
                }}
                className="btn-secondary flex-1"
              >
                پاشگەزبوونەوە
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Income List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold">داهاتەکان ({filteredIncomes.length})</h3>
        {filteredIncomes.length === 0 ? (
          <div className="card text-center py-8">
            <DollarSign className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              هیچ داهاتێک لەم مانگەدا نییە
            </p>
          </div>
        ) : (
          filteredIncomes.map((income) => (
            <div
              key={income.id}
              className="card hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                      {formatCurrency(income.amount, settings.currency)}
                    </span>
                    {income.isRecurring && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        دووبارە
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{income.source}</p>
                  {income.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      {income.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                    {format(new Date(income.date), 'dd/MM/yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => deleteIncome(income.id)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
