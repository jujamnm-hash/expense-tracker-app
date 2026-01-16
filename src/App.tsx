import { useState, useEffect } from 'react';
import { Wallet, TrendingDown, BarChart2, Settings, Target, TrendingUp, LayoutDashboard } from 'lucide-react';
import { DashboardTab } from './components/DashboardTab';
import { ExpensesTab } from './components/ExpensesTab';
import { DebtsTab } from './components/DebtsTab';
import { ReportsTab } from './components/ReportsTab';
import { BudgetTab } from './components/BudgetTab';
import { GoalsTab } from './components/GoalsTab';
import { SettingsTab } from './components/SettingsTab';
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
    
    // Apply RTL for Kurdish and Arabic
    if (settings.language === 'ku' || settings.language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }, [settings.theme, settings.language]);

  const tabs = [
    { id: 'dashboard' as Tab, label: 'داشبۆرد', icon: LayoutDashboard },
    { id: 'expenses' as Tab, label: 'خەرجی', icon: Wallet },
    { id: 'debts' as Tab, label: 'قەرز', icon: TrendingDown },
    { id: 'budget' as Tab, label: 'بودجە', icon: TrendingUp },
    { id: 'goals' as Tab, label: 'ئامانج', icon: Target },
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
        {activeTab === 'debts' && <DebtsTab />}
        {activeTab === 'budget' && <BudgetTab />}
        {activeTab === 'goals' && <GoalsTab />}
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
