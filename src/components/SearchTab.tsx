import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Calendar, DollarSign, Tag } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { parseISO, format, startOfMonth, subMonths } from 'date-fns';

export const SearchTab: React.FC = () => {
  const { expenses, incomes, settings } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'month' | '3months' | '6months' | 'year'>('all');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  // Get unique categories
  const categories = useMemo(() => {
    const expenseCategories = [...new Set(expenses.map(e => e.category))];
    const incomeCategories = [...new Set(incomes.map(i => i.source))];
    return [...new Set([...expenseCategories, ...incomeCategories])].sort();
  }, [expenses, incomes]);

  // Filter results
  const searchResults = useMemo(() => {
    let results: Array<{
      id: string;
      type: 'expense' | 'income';
      amount: number;
      category: string;
      description: string;
      date: string;
    }> = [];

    // Add expenses
    if (selectedType === 'all' || selectedType === 'expense') {
      const expenseResults = expenses.map(e => ({
        id: e.id,
        type: 'expense' as const,
        amount: e.amount,
        category: e.category,
        description: e.description,
        date: e.date,
      }));
      results = [...results, ...expenseResults];
    }

    // Add incomes
    if (selectedType === 'all' || selectedType === 'income') {
      const incomeResults = incomes.map(i => ({
        id: i.id,
        type: 'income' as const,
        amount: i.amount,
        category: i.source,
        description: i.description,
        date: i.date,
      }));
      results = [...results, ...incomeResults];
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(r =>
        r.description.toLowerCase().includes(term) ||
        r.category.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(r => r.category === selectedCategory);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (dateRange) {
        case 'month':
          startDate = startOfMonth(now);
          break;
        case '3months':
          startDate = subMonths(now, 3);
          break;
        case '6months':
          startDate = subMonths(now, 6);
          break;
        case 'year':
          startDate = subMonths(now, 12);
          break;
        default:
          startDate = new Date(0);
      }

      results = results.filter(r => {
        const itemDate = parseISO(r.date);
        return itemDate >= startDate;
      });
    }

    // Filter by amount range
    const min = parseFloat(minAmount) || 0;
    const max = parseFloat(maxAmount) || Infinity;
    results = results.filter(r => r.amount >= min && r.amount <= max);

    // Sort by date (newest first)
    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, incomes, searchTerm, selectedType, selectedCategory, dateRange, minAmount, maxAmount]);

  // Calculate totals
  const totals = useMemo(() => {
    const expenseTotal = searchResults
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);
    const incomeTotal = searchResults
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);

    return { expenseTotal, incomeTotal, net: incomeTotal - expenseTotal };
  }, [searchResults]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setDateRange('all');
    setMinAmount('');
    setMaxAmount('');
  };

  const hasActiveFilters = searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || 
                          dateRange !== 'all' || minAmount || maxAmount;

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-cyan-600 via-blue-500 to-indigo-600 text-white">
        <div className="flex items-center gap-3">
          <Search className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">گەڕان و فلتەر</h2>
            <p className="text-white/90 text-sm mt-1">
              گەڕان لە {expenses.length + incomes.length} مامەڵە
            </p>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="card">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="گەڕان بە وردەکاری یان کاتەگۆری..."
            className="w-full pr-10 pl-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold">فلتەرەکان</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mr-auto text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              پاککردنەوە
            </button>
          )}
        </div>

        {/* Type Filter */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">جۆر:</p>
          <div className="grid grid-cols-3 gap-2">
            {['all', 'expense', 'income'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`py-2 rounded-lg font-semibold transition-all ${
                  selectedType === type
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {type === 'all' ? 'هەموو' : type === 'expense' ? 'خەرجی' : 'داهات'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">کاتەگۆری:</p>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="all">هەموو کاتەگۆریەکان</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ماوە:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'all', label: 'هەموو' },
              { value: 'month', label: 'مانگ' },
              { value: '3months', label: '3 مانگ' },
              { value: '6months', label: '6 مانگ' },
              { value: 'year', label: 'ساڵ' },
            ].map((range) => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value as any)}
                className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                  dateRange === range.value
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Range Filter */}
        <div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">بڕ:</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="کەمترین"
              className="p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="زۆرترین"
              className="p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-5 h-5 text-green-600" />
          <h3 className="font-bold">ئەنجامەکان: {searchResults.length}</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">خەرجی</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(totals.expenseTotal, settings.currency)}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">داهات</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(totals.incomeTotal, settings.currency)}
            </p>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">پاشەکەوت</p>
            <p className={`text-lg font-bold ${totals.net >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(totals.net, settings.currency)}
            </p>
          </div>
        </div>
      </div>

      {/* Results List */}
      {searchResults.length === 0 ? (
        <div className="card text-center py-12">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
            هیچ ئەنجامێک نەدۆزرایەوە
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            فلتەرەکان بگۆڕە یان گەڕانێکی دیکە تاقی بکەرەوە
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {searchResults.map((result) => (
            <div
              key={result.id}
              className={`card border-2 ${
                result.type === 'expense'
                  ? 'border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
                  : 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      result.type === 'expense'
                        ? 'bg-red-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}>
                      {result.type === 'expense' ? 'خەرجی' : 'داهات'}
                    </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {result.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {result.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>{format(parseISO(result.date), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1 mb-1">
                    <DollarSign className={`w-4 h-4 ${
                      result.type === 'expense' ? 'text-red-600' : 'text-green-600'
                    }`} />
                  </div>
                  <p className={`text-xl font-bold ${
                    result.type === 'expense' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(result.amount, settings.currency)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <div className="card bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-indigo-800 dark:text-indigo-400 mb-1">
              تێبینی
            </h4>
            <ul className="text-sm text-indigo-700 dark:text-indigo-300 space-y-1">
              <li>• گەڕان لە هەردوو وردەکاری و کاتەگۆری</li>
              <li>• فلتەرەکان دەتوانی یەکلایی بکەیتەوە</li>
              <li>• ئەنجامەکان بەپێی بەروار ڕیزکراون</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
