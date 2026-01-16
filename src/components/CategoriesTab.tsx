import React, { useState } from 'react';
import { Plus, Trash2, Save, X, Palette } from 'lucide-react';
import { useStore } from '../store';

const AVAILABLE_ICONS = [
  '🍔', '🚗', '🏠', '💊', '📚', '💡', '🎮', '🛒', '✈️', '🎬',
  '☕', '🍕', '🚌', '🏥', '📱', '💰', '🎁', '👕', '🎨', '🏋️',
  '💼', '🎓', '🔧', '📺', '🎵', '🌟', '💳', '🍽️', '⛽', '🏪'
];

const AVAILABLE_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#6366F1',
  '#84CC16', '#F43F5E', '#22C55E', '#A855F7', '#EAB308'
];

export const CategoriesTab: React.FC = () => {
  const { customCategories, addCustomCategory, deleteCustomCategory } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏷️');
  const [color, setColor] = useState('#3B82F6');
  const [type, setType] = useState<'expense' | 'income'>('expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      addCustomCategory({
        name: name.trim(),
        icon,
        color,
        type,
      });
      setName('');
      setIcon('🏷️');
      setColor('#3B82F6');
      setShowForm(false);
    }
  };

  const expenseCategories = customCategories?.filter(c => c.type === 'expense') || [];
  const incomeCategories = customCategories?.filter(c => c.type === 'income') || [];

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">کاتەگۆری تایبەت</h2>
            <p className="text-indigo-100 text-sm mt-1">
              کاتەگۆری تایبەتی خۆت دروست بکە بە ئایکۆن و ڕەنگی جیاواز
            </p>
          </div>
        </div>
      </div>

      {/* Add Category Button */}
      <button
        onClick={() => setShowForm(true)}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        زیادکردنی کاتەگۆریی نوێ
      </button>

      {/* Add Category Form */}
      {showForm && (
        <div className="card bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold mb-4 text-blue-800 dark:text-blue-400 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            کاتەگۆریی نوێ
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">جۆری کاتەگۆری</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    type === 'expense'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">💸</div>
                  <div className="font-semibold">خەرجی</div>
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    type === 'income'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">💰</div>
                  <div className="font-semibold">داهات</div>
                </button>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium mb-2">ناوی کاتەگۆری</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                placeholder="وەک: خواردنی دەرەوە، کادۆ..."
                required
              />
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">ئایکۆن هەڵبژێرە</label>
              <div className="grid grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 bg-white dark:bg-gray-800 rounded-lg border">
                {AVAILABLE_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`text-2xl p-2 rounded-lg transition-all hover:scale-110 ${
                      icon === emoji
                        ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-center">
                <span className="text-4xl">{icon}</span>
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">ڕەنگ هەڵبژێرە</label>
              <div className="grid grid-cols-5 gap-3">
                {AVAILABLE_COLORS.map((clr) => (
                  <button
                    key={clr}
                    type="button"
                    onClick={() => setColor(clr)}
                    className={`h-12 rounded-lg transition-all hover:scale-110 ${
                      color === clr ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                    }`}
                    style={{ backgroundColor: clr }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2">
                <div
                  className="w-12 h-12 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-semibold">{color}</span>
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">پێشبینی</p>
              <div
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ backgroundColor: `${color}20` }}
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-semibold" style={{ color }}>
                  {name || 'ناوی کاتەگۆری'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />
                پاشەکەوت
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setName('');
                  setIcon('🏷️');
                  setColor('#3B82F6');
                }}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                پاشگەزبوونەوە
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense Categories */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">💸</span>
          کاتەگۆریەکانی خەرجی ({expenseCategories.length})
        </h3>
        {expenseCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            هێشتا هیچ کاتەگۆریی تایبەتت دروست نەکردووە
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {expenseCategories.map((category) => (
              <div
                key={category.id}
                className="p-4 rounded-xl border-2 hover:shadow-lg transition-all"
                style={{
                  backgroundColor: `${category.color}10`,
                  borderColor: `${category.color}40`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h4 className="font-bold" style={{ color: category.color }}>
                        {category.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        خەرجی
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCustomCategory(category.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Income Categories */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="text-2xl">💰</span>
          کاتەگۆریەکانی داهات ({incomeCategories.length})
        </h3>
        {incomeCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            هێشتا هیچ کاتەگۆریی تایبەتت دروست نەکردووە
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incomeCategories.map((category) => (
              <div
                key={category.id}
                className="p-4 rounded-xl border-2 hover:shadow-lg transition-all"
                style={{
                  backgroundColor: `${category.color}10`,
                  borderColor: `${category.color}40`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <h4 className="font-bold" style={{ color: category.color }}>
                        {category.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        داهات
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCustomCategory(category.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-1">
              تیپ
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              کاتەگۆریە تایبەتەکانت لە هەموو بەشەکانی ئەپەکەدا بەکاردێن: خەرجی، داهات، بودجە و راپۆرتەکان.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
