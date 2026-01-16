import React, { useState } from 'react';
import { Plus, X, Repeat, Calendar } from 'lucide-react';
import { useStore } from '../store';
import { EXPENSE_CATEGORIES } from '../types';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface RecurringExpenseFormProps {
  onClose: () => void;
}

export const RecurringExpenseForm: React.FC<RecurringExpenseFormProps> = ({ onClose }) => {
  const addExpense = useStore((state) => state.addExpense);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState('');
  const [occurrences, setOccurrences] = useState('12');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const numOccurrences = parseInt(occurrences);
    let currentDate = new Date(startDate);
    const finalDate = endDate ? new Date(endDate) : null;

    for (let i = 0; i < numOccurrences; i++) {
      if (finalDate && currentDate > finalDate) break;

      addExpense({
        amount: parseFloat(amount),
        category,
        description: `${description} (دووبارە ${i + 1}/${numOccurrences})`,
        date: format(currentDate, 'yyyy-MM-dd'),
        isRecurring: true,
        recurringFrequency: frequency,
        tags: ['دووبارە'],
      });

      // Calculate next date based on frequency
      if (frequency === 'daily') {
        currentDate = addDays(currentDate, 1);
      } else if (frequency === 'weekly') {
        currentDate = addWeeks(currentDate, 1);
      } else {
        currentDate = addMonths(currentDate, 1);
      }
    }

    alert(`${numOccurrences} خەرجیی دووبارە زیادکرا!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Repeat size={24} className="text-primary-500" />
            خەرجیی دووبارە
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              بڕ (دینار)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="٥٠٠٠٠"
              required
              min="0"
              step="500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              جۆری خەرجی
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              دووبارەبوونەوە
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'daily', label: 'ڕۆژانە' },
                { value: 'weekly', label: 'هەفتانە' },
                { value: 'monthly', label: 'مانگانە' },
              ].map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setFrequency(freq.value as any)}
                  className={`p-3 rounded-lg border-2 font-medium transition-all ${
                    frequency === freq.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {freq.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              بەرواری دەستپێکردن
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ژمارەی جار
            </label>
            <input
              type="number"
              value={occurrences}
              onChange={(e) => setOccurrences(e.target.value)}
              className="input"
              min="1"
              max="365"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {frequency === 'daily' && `${occurrences} ڕۆژ`}
              {frequency === 'weekly' && `${occurrences} هەفتە`}
              {frequency === 'monthly' && `${occurrences} مانگ`}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              بەرواری کۆتایی (دڵخواز)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              وەسف
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="خانووبەرە، کارەبا، قوتابخانە..."
              required
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-700 dark:text-blue-400">
              💡 {occurrences} خەرجی بە {formatCurrency(parseFloat(amount) * parseInt(occurrences))} دینار زیاد دەکرێت
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              <Plus size={20} className="inline ml-2" />
              دروستکردن
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              پاشگەزبوونەوە
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-IQ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
