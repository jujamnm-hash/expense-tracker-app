import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore } from '../store';
import { EXPENSE_CATEGORIES } from '../types';
import { format } from 'date-fns';

export const AddExpenseForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const addExpense = useStore((state) => state.addExpense);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    addExpense({
      amount: parseFloat(amount),
      category,
      description,
      date,
      tags: tags.length > 0 ? tags : undefined,
    });

    onClose();
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in overflow-y-auto">
      <div className="flex min-h-full items-end sm:items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">زیادکردنی خەرجی</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              بەروار
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وەسف (دڵخواز)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="تێبینی..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاگەکان (دڵخواز)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="input flex-1"
                placeholder="تاگ زیاد بکە..."
              />
              <button
                type="button"
                onClick={addTag}
                className="btn btn-secondary"
              >
                +
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn btn-primary flex-1">
              <Plus size={20} className="inline ml-2" />
              زیادکردن
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
    </div>
  );
};
