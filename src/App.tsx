import { useState, useEffect } from 'react';
import { Wallet, TrendingDown, LayoutDashboard, Menu } from 'lucide-react';
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
import { NavigationMenu } from './components/NavigationMenu';
import { Tab } from './types';
import { useStore } from './store';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // 4 main tabs for bottom navigation
  const mainTabs = [
    { id: 'dashboard' as Tab, label: 'داشبۆرد', icon: LayoutDashboard },
    { id: 'expenses' as Tab, label: 'خەرجی', icon: TrendingDown },
    { id: 'income' as Tab, label: 'داهات', icon: Wallet },
    { id: 'menu' as 'menu', label: 'زیاتر', icon: Menu },
  ];

  const handleTabClick = (tabId: Tab | 'menu') => {
    if (tabId === 'menu') {
      setIsMenuOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${settings.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
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
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-24 overflow-y-auto">{activeTab === 'dashboard' && <DashboardTab />}
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

      {/* Navigation Menu */}
      <NavigationMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={settings.theme}
      />

      {/* Bottom Navigation - 4 Main Tabs */}
      <nav className={`fixed bottom-0 left-0 right-0 border-t z-50 shadow-lg ${
        settings.theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-around">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id !== 'menu' && activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all relative ${
                    isActive
                      ? settings.theme === 'dark'
                        ? 'text-primary-400'
                        : 'text-primary-600'
                      : settings.theme === 'dark'
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-xs ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-b-full ${
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
