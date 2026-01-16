import { useState, useEffect } from 'react';
import { Wallet, TrendingDown, BarChart2, Settings, Target, TrendingUp, LayoutDashboard, DollarSign, Receipt, Palette, Sparkles, Brain, Heart, FileDown, Bell, Search, ArrowUpDown, PieChart, Repeat } from 'lucide-react';
import { DashboardTab } from './components/DashboardTab';
import { ExpensesTab } from './components/ExpensesTab';
import { IncomeTab } from './components/IncomeTab';
import { BillsTab } from './components/BillsTab';
import { DebtsTab } from './components/DebtsTab';
import { ReportsTab } from './components/ReportsTab';
import { BudgetTab } from './components/BudgetTab';
import { GoalsTab } from './components/GoalsTab';
import { CategoriesTab } from './components/CategoriesTab';
import { BudgetTemplatesTab } from './components/BudgetTemplatesTab';
import { AdvancedAnalyticsTab } from './components/AdvancedAnalyticsTab';
import { FinancialHealthTab } from './components/FinancialHealthTab';
import { ExportTab } from './components/ExportTab';
import { NotificationsTab } from './components/NotificationsTab';
import { SearchTab } from './components/SearchTab';
import { CompareTab } from './components/CompareTab';
import { SettingsTab } from './components/SettingsTab';
import { ChartsTab } from './components/ChartsTab';
import { RecurringTab } from './components/RecurringTab';
import { Tab } from './types';
import { useStore } from './store';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const settings = useStore((state) => state.settings);

  useEffect(() => {
    // Apply theme
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply accent color
    document.documentElement.classList.remove('accent-blue', 'accent-green', 'accent-purple', 'accent-orange', 'accent-red');
    document.documentElement.classList.add(`accent-${settings.accentColor}`);
    
    // Apply RTL for Kurdish and Arabic
    if (settings.language === 'ku' || settings.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [settings.theme, settings.language, settings.accentColor]);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'داشبۆرد', icon: LayoutDashboard },
    { id: 'expenses' as Tab, label: 'خەرجی', icon: Wallet },
    { id: 'income' as Tab, label: 'داهات', icon: DollarSign },
    { id: 'bills' as Tab, label: 'پسوڵە', icon: Receipt },
    { id: 'debts' as Tab, label: 'قەرز', icon: TrendingDown },
    { id: 'budget' as Tab, label: 'بودجە', icon: TrendingUp },
    { id: 'goals' as Tab, label: 'ئامانج', icon: Target },
    { id: 'categories' as Tab, label: 'کاتەگۆری', icon: Palette },
    { id: 'templates' as Tab, label: 'تێمپلێت', icon: Sparkles },
    { id: 'analytics' as Tab, label: 'شیکاری AI', icon: Brain },
    { id: 'health' as Tab, label: 'تەندروستی', icon: Heart },
    { id: 'export' as Tab, label: 'دەرهێنان', icon: FileDown },
    { id: 'notifications' as Tab, label: 'ئاگاداری', icon: Bell },
    { id: 'search' as Tab, label: 'گەڕان', icon: Search },
    { id: 'compare' as Tab, label: 'بەراوردکردن', icon: ArrowUpDown },
    { id: 'charts' as Tab, label: 'چارتەکان', icon: PieChart },
    { id: 'recurring' as Tab, label: 'دووبارەبوو', icon: Repeat },
    { id: 'reports' as Tab, label: 'راپۆرت', icon: BarChart2 },
    { id: 'settings' as Tab, label: 'ڕێکخستن', icon: Settings },
  ];

  return (
    <div className={`min-h-screen ${settings.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`border-b sticky top-0 z-40 shadow-sm ${
        settings.theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className={`text-2xl font-bold text-center ${
            settings.theme === 'dark' ? 'text-primary-400' : 'text-primary-600'
          }`}>
            بەدواداچوونی خەرجی
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
        {activeTab === 'income' && <IncomeTab />}
        {activeTab === 'bills' && <BillsTab />}
        {activeTab === 'debts' && <DebtsTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'goals' && <GoalsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'templates' && <BudgetTemplatesTab />}
        {activeTab === 'analytics' && <AdvancedAnalyticsTab />}
        {activeTab === 'health' && <FinancialHealthTab />}
        {activeTab === 'export' && <ExportTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'search' && <SearchTab />}
        {activeTab === 'compare' && <CompareTab />}
        {activeTab === 'charts' && <ChartsTab />}
        {activeTab === 'recurring' && <RecurringTab />}
        {activeTab === 'reports' && <ReportsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t z-50 shadow-lg overflow-x-auto ${
        settings.theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-2xl mx-auto px-1">
          <div className="flex justify-around min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 transition-all min-w-[70px] ${
                    isActive
                      ? settings.theme === 'dark'
                        ? 'text-primary-400'
                        : 'text-primary-600'
                      : settings.theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full ${
                      settings.theme === 'dark' ? 'bg-primary-400' : 'bg-primary-600'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}

export default App;
