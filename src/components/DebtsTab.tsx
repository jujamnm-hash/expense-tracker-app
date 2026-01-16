import React, { useState, useMemo } from 'react';
import { Plus, TrendingDown, TrendingUp } from 'lucide-react';
import { useStore } from '../store';
import { AddDebtForm } from './AddDebtForm';
import { DebtItem } from './DebtItem';
import { formatCurrency } from '../utils';

export const DebtsTab: React.FC = () => {
  const debts = useStore((state) => state.debts);
  const deleteDebt = useStore((state) => state.deleteDebt);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'borrowed' | 'lent' | 'active' | 'paid'>('all');

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      if (filter === 'all') return true;
      if (filter === 'active' || filter === 'paid') return debt.status === filter;
      return debt.type === filter;
    }).sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'active' ? -1 : 1;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [debts, filter]);

  const stats = useMemo(() => {
    const borrowed = debts
      .filter((d) => d.type === 'borrowed' && d.status === 'active')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
    
    const lent = debts
      .filter((d) => d.type === 'lent' && d.status === 'active')
      .reduce((sum, d) => sum + d.remainingAmount, 0);
    
    const netBalance = lent - borrowed;
    
    return { borrowed, lent, netBalance };
  }, [debts]);

  return (
    <div className="pb-20">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={18} />
            <span className="text-sm opacity-90">قەرزگرتن</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(stats.borrowed)}</div>
          <div className="text-xs opacity-75">دینار</div>
        </div>
        
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} />
            <span className="text-sm opacity-90">قەرزدان</span>
          </div>
          <div className="text-2xl font-bold">{formatCurrency(stats.lent)}</div>
          <div className="text-xs opacity-75">دینار</div>
        </div>
      </div>

      {/* Net Balance Card */}
      <div className={`card mb-6 ${stats.netBalance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">بالانسی گشتی</span>
          <div className="text-right">
            <div className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.netBalance >= 0 ? '+' : ''}{formatCurrency(stats.netBalance)}
            </div>
            <div className="text-xs text-gray-600">دینار</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {[
          { value: 'all', label: 'هەموو' },
          { value: 'active', label: 'چالاک' },
          { value: 'paid', label: 'تەواوبووە' },
          { value: 'borrowed', label: 'قەرزگرتن' },
          { value: 'lent', label: 'قەرزدان' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value as any)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filter === item.value
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Debt List */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-6xl mb-3">💰</div>
            <p className="text-gray-500">هیچ قەرزێک نییە</p>
            <p className="text-sm text-gray-400 mt-1">
              دەستپێبکە بە تۆمارکردنی قەرزەکانت
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {filteredDebts.length} قەرز
              </h3>
            </div>
            {filteredDebts.map((debt) => (
              <DebtItem
                key={debt.id}
                debt={debt}
                onDelete={deleteDebt}
              />
            ))}
          </>
        )}
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 btn btn-primary shadow-lg px-6 py-3 rounded-full flex items-center gap-2 z-10"
      >
        <Plus size={24} />
        <span>زیادکردنی قەرز</span>
      </button>

      {showAddForm && <AddDebtForm onClose={() => setShowAddForm(false)} />}
    </div>
  );
};
