import React from 'react';
import { X, LayoutDashboard, Wallet, TrendingDown, Receipt, Target, BarChart2, DollarSign, PieChart, Brain, Heart, FileDown, Bell, Search, ArrowUpDown, RefreshCw, Palette, Sparkles, Settings } from 'lucide-react';
import { Tab } from '../types';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  theme: 'light' | 'dark';
}

export const NavigationMenu: React.FC<NavigationMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  theme,
}) => {
  const handleTabClick = (tab: Tab) => {
    onTabChange(tab);
    onClose();
  };

  const menuSections = [
    {
      title: 'سەرەکی',
      items: [
        { id: 'dashboard' as Tab, label: 'داشبۆرد', icon: LayoutDashboard, color: 'text-blue-600' },
        { id: 'expenses' as Tab, label: 'خەرجی', icon: TrendingDown, color: 'text-red-600' },
        { id: 'income' as Tab, label: 'داهات', icon: Wallet, color: 'text-green-600' },
        { id: 'bills' as Tab, label: 'پسوڵە', icon: Receipt, color: 'text-orange-600' },
        { id: 'debts' as Tab, label: 'قەرز', icon: DollarSign, color: 'text-purple-600' },
      ],
    },
    {
      title: 'پلاندانان',
      items: [
        { id: 'budget' as Tab, label: 'بودجە', icon: PieChart, color: 'text-indigo-600' },
        { id: 'goals' as Tab, label: 'ئامانج', icon: Target, color: 'text-pink-600' },
        { id: 'recurring' as Tab, label: 'دووبارەبووەکان', icon: RefreshCw, color: 'text-teal-600' },
      ],
    },
    {
      title: 'شیکاری',
      items: [
        { id: 'analytics' as Tab, label: 'شیکاری', icon: Brain, color: 'text-cyan-600' },
        { id: 'charts' as Tab, label: 'چارتەکان', icon: BarChart2, color: 'text-blue-600' },
        { id: 'reports' as Tab, label: 'راپۆرت', icon: Sparkles, color: 'text-purple-600' },
        { id: 'health' as Tab, label: 'تەندروستی دارایی', icon: Heart, color: 'text-red-600' },
        { id: 'compare' as Tab, label: 'بەراوردکردن', icon: ArrowUpDown, color: 'text-orange-600' },
      ],
    },
    {
      title: 'ئامرازەکان',
      items: [
        { id: 'search' as Tab, label: 'گەڕان', icon: Search, color: 'text-gray-600' },
        { id: 'notifications' as Tab, label: 'ئاگاداری', icon: Bell, color: 'text-yellow-600' },
        { id: 'export' as Tab, label: 'دەرهێنان', icon: FileDown, color: 'text-green-600' },
      ],
    },
    {
      title: 'ڕێکخستن',
      items: [
        { id: 'categories' as Tab, label: 'جۆرەکان', icon: Palette, color: 'text-indigo-600' },
        { id: 'templates' as Tab, label: 'تێمپلەیتەکان', icon: Sparkles, color: 'text-pink-600' },
        { id: 'settings' as Tab, label: 'ڕێکخستنەکان', icon: Settings, color: 'text-gray-600' },
      ],
    },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={`fixed inset-y-0 right-0 w-80 max-w-full z-50 transform transition-transform duration-300 ease-out ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        } shadow-2xl overflow-y-auto`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 p-4 border-b flex items-center justify-between ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            مینیو
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700 text-gray-300'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Menu Content */}
        <div className="p-4 space-y-6">
          {menuSections.map((section) => (
            <div key={section.title}>
              <h3 className={`text-xs font-bold mb-3 px-2 uppercase tracking-wider ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                        isActive
                          ? theme === 'dark'
                            ? 'bg-gray-700 shadow-lg'
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                          : theme === 'dark'
                          ? 'hover:bg-gray-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={isActive ? item.color : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}
                      />
                      <span className={`font-medium ${
                        isActive
                          ? item.color
                          : theme === 'dark'
                          ? 'text-gray-300'
                          : 'text-gray-700'
                      }`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <div className={`mr-auto w-2 h-2 rounded-full ${
                          item.color.replace('text-', 'bg-')
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 p-4 border-t text-center text-xs ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-white border-gray-200 text-gray-500'
        }`}>
          بەدواداچوونی خەرجی • v1.0.0
        </div>
      </div>
    </>
  );
};

export default NavigationMenu;
