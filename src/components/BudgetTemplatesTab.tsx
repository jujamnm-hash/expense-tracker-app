import React, { useState } from 'react';
import { Briefcase, GraduationCap, Users, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';

const PRESET_TEMPLATES = [
  {
    id: 'student',
    name: 'بودجەی قوتابی',
    description: 'بودجەیەکی گونجاو بۆ قوتابیان',
    icon: '🎓',
    color: '#3B82F6',
    budgets: [
      { category: 'خواردن', limit: 150000 },
      { category: 'گواستنەوە', limit: 50000 },
      { category: 'قوتابخانە', limit: 100000 },
      { category: 'پشوودان', limit: 30000 },
      { category: 'هیتر', limit: 20000 },
    ]
  },
  {
    id: 'family',
    name: 'بودجەی خێزان',
    description: 'بودجەیەکی تەواو بۆ خێزان',
    icon: '👨‍👩‍👧‍👦',
    color: '#10B981',
    budgets: [
      { category: 'خواردن', limit: 400000 },
      { category: 'گواستنەوە', limit: 150000 },
      { category: 'خانووبەرە', limit: 300000 },
      { category: 'تەندروستی', limit: 100000 },
      { category: 'كارەبا و ئاو', limit: 100000 },
      { category: 'قوتابخانە', limit: 200000 },
      { category: 'پشوودان', limit: 100000 },
      { category: 'هیتر', limit: 50000 },
    ]
  },
  {
    id: 'employee',
    name: 'بودجەی کارمەند',
    description: 'بودجە بۆ کارمەندێکی تاک',
    icon: '💼',
    color: '#8B5CF6',
    budgets: [
      { category: 'خواردن', limit: 200000 },
      { category: 'گواستنەوە', limit: 100000 },
      { category: 'خانووبەرە', limit: 200000 },
      { category: 'تەندروستی', limit: 50000 },
      { category: 'كارەبا و ئاو', limit: 50000 },
      { category: 'پشوودان', limit: 80000 },
      { category: 'کڕین', limit: 100000 },
      { category: 'هیتر', limit: 20000 },
    ]
  },
  {
    id: 'minimal',
    name: 'بودجەی کەمینە',
    description: 'بودجەیەکی سادە و کەم',
    icon: '🌱',
    color: '#14B8A6',
    budgets: [
      { category: 'خواردن', limit: 100000 },
      { category: 'گواستنەوە', limit: 30000 },
      { category: 'خانووبەرە', limit: 100000 },
      { category: 'هیتر', limit: 20000 },
    ]
  },
  {
    id: 'business',
    name: 'بودجەی بازرگان',
    description: 'بودجە بۆ خاوەنی کار',
    icon: '📊',
    color: '#F59E0B',
    budgets: [
      { category: 'خواردن', limit: 300000 },
      { category: 'گواستنەوە', limit: 200000 },
      { category: 'خانووبەرە', limit: 400000 },
      { category: 'تەندروستی', limit: 100000 },
      { category: 'كارەبا و ئاو', limit: 150000 },
      { category: 'پشوودان', limit: 150000 },
      { category: 'کڕین', limit: 200000 },
      { category: 'هیتر', limit: 100000 },
    ]
  },
];

export const BudgetTemplatesTab: React.FC = () => {
  const { settings, addBudget } = useStore();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = PRESET_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      // Get current month
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      // Add each budget from template
      template.budgets.forEach(budgetItem => {
        addBudget({
          category: budgetItem.category,
          monthlyLimit: budgetItem.limit,
          month: currentMonth,
        });
      });
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedTemplate(null);
      }, 2000);
    }
  };

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-purple-500 to-pink-600 text-white">
        <div className="flex items-center gap-3">
          <Sparkles className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">تێمپلێتی بودجە</h2>
            <p className="text-purple-100 text-sm mt-1">
              بودجەیەکی ئامادە هەڵبژێرە یان خۆت دروستی بکە
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="card bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse">
          <div className="flex items-center gap-3">
            <Check className="w-6 h-6" />
            <p className="font-semibold">بودجەکان بە سەرکەوتوویی زیادکران!</p>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-4">
        {PRESET_TEMPLATES.map((template) => {
          const totalBudget = template.budgets.reduce((sum, b) => sum + b.limit, 0);
          const isSelected = selectedTemplate === template.id;

          return (
            <div
              key={template.id}
              className={`card hover:shadow-xl transition-all cursor-pointer ${
                isSelected ? 'ring-4 ring-blue-500' : ''
              }`}
              style={{
                background: `linear-gradient(135deg, ${template.color}15 0%, ${template.color}05 100%)`,
                borderColor: `${template.color}40`,
                borderWidth: '2px',
              }}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="text-4xl w-16 h-16 flex items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${template.color}20` }}
                    >
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: template.color }}>
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  {template.id === 'student' && (
                    <GraduationCap className="w-6 h-6 text-blue-500" />
                  )}
                  {template.id === 'family' && (
                    <Users className="w-6 h-6 text-green-500" />
                  )}
                  {template.id === 'employee' && (
                    <Briefcase className="w-6 h-6 text-purple-500" />
                  )}
                </div>

                {/* Total Budget */}
                <div className="p-4 bg-white dark:bg-gray-800 rounded-xl">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">کۆی بودجەی مانگانە</p>
                  <p className="text-3xl font-bold" style={{ color: template.color }}>
                    {formatCurrency(totalBudget, settings.currency)}
                  </p>
                </div>

                {/* Budget Items */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">پۆلێنکردن:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {template.budgets.map((budget, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{budget.category}</p>
                        <p className="font-semibold text-sm" style={{ color: template.color }}>
                          {formatCurrency(budget.limit, settings.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => handleApplyTemplate(template.id)}
                  className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-105"
                  style={{ backgroundColor: template.color }}
                >
                  <Check className="w-5 h-5" />
                  بەکارهێنانی ئەم بودجەیە
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-1">
              چۆن کاردەکات؟
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• تێمپلێتێک هەڵبژێرە کە گونجاوە بۆ دۆخەکەت</li>
              <li>• بودجەکان ئۆتۆماتیک زیاد دەکرێن بۆ مانگی ئێستا</li>
              <li>• دەتوانی دواتر گۆڕانکاری بکەیت لە بەشی "بودجە"</li>
              <li>• هەر تێمپلێتێک دەتوانی چەند جارێک بەکاری بهێنیت</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Custom Budget Tip */}
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800">
        <div className="flex gap-3">
          <span className="text-2xl">✨</span>
          <div>
            <h4 className="font-bold text-purple-800 dark:text-purple-400 mb-1">
              بودجەی تایبەت دەتەوێت؟
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              بڕۆ بۆ بەشی "بودجە" و بودجەی تایبەتی خۆت دروست بکە بۆ هەر کاتەگۆرییەک بە بڕی دڵخوازت!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
