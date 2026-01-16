import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Clock, Download, Info, Moon, Sun, Globe, Lock, Unlock, Save, Upload, Key } from 'lucide-react';
import { useStore } from '../store';
import { requestNotificationPermission, checkAndSendNotification, getTodayExpenseTotal } from '../utils';

export const SettingsTab: React.FC = () => {
  const {
    notificationSettings,
    updateNotificationSettings,
    markNotified,
    expenses,
    settings,
    updateSettings,
  } = useStore();
  
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [unlockPassword, setUnlockPassword] = useState('');
  const [showUnlockForm, setShowUnlockForm] = useState(settings.isLocked);

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (!notificationSettings.enabled) return;

    const checkInterval = setInterval(() => {
      const todayHasExpenses = getTodayExpenseTotal(expenses) > 0;
      const shouldNotify = checkAndSendNotification(
        notificationSettings.lastNotified,
        notificationSettings.time,
        todayHasExpenses
      );
      
      if (shouldNotify) {
        markNotified();
      }
    }, 60000); // Check every minute

    return () => clearInterval(checkInterval);
  }, [notificationSettings, expenses, markNotified]);

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setPermissionStatus('granted');
      updateNotificationSettings({ enabled: true });
    } else {
      alert('تکایە ڕێگە بە نۆتیفیکەیشن بدە لە ڕێکخستنەکانی وێبگەڕەکەتەوە');
    }
  };

  const handleDisableNotifications = () => {
    updateNotificationSettings({ enabled: false });
  };

  const handleTimeChange = (time: string) => {
    updateNotificationSettings({ time });
  };

  const clearAllData = () => {
    if (confirm('دڵنیای لە سڕینەوەی هەموو زانیاریەکان؟ ئەم کارە ناگەڕێتەوە!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleBackup = () => {
    const data = localStorage.getItem('expense-tracker-storage');
    if (!data) {
      alert('هیچ زانیاریەک نییە بۆ بەکوپ!');
      return;
    }
    
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          localStorage.setItem('expense-tracker-storage', data);
          alert('زانیارییەکان بە سەرکەوتوویی گەڕێندرانەوە!');
          window.location.reload();
        } catch (error) {
          alert('هەڵەیەک ڕوویدا لە گەڕاندنەوەی زانیارییەکان!');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSetPassword = () => {
    if (password !== confirmPassword) {
      alert('وشەی نهێنیەکان وەک یەک نین!');
      return;
    }
    if (password.length < 4) {
      alert('وشەی نهێنی دەبێ لانیکەم ٤ پیت بێ!');
      return;
    }
    
    updateSettings({ password, isLocked: true });
    setPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
    alert('وشەی نهێنی بە سەرکەوتوویی دانرا!');
  };

  const handleUnlock = () => {
    if (unlockPassword === settings.password) {
      setShowUnlockForm(false);
      setUnlockPassword('');
    } else {
      alert('وشەی نهێنی هەڵەیە!');
    }
  };

  const handleRemovePassword = () => {
    if (confirm('دڵنیای لە لابردنی وشەی نهێنی؟')) {
      updateSettings({ password: undefined, isLocked: false });
      alert('وشەی نهێنی لابرا!');
    }
  };

  if (showUnlockForm) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card max-w-md w-full text-center">
          <Lock size={48} className="mx-auto text-primary-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">ئەپەکە داخراوە</h2>
          <p className="text-gray-600 mb-6">وشەی نهێنی بنووسە بۆ کردنەوە</p>
          
          <div className="space-y-4">
            <input
              type="password"
              value={unlockPassword}
              onChange={(e) => setUnlockPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              className="input"
              placeholder="وشەی نهێنی"
              autoFocus
            />
            <button onClick={handleUnlock} className="btn btn-primary w-full">
              <Unlock size={20} className="inline ml-2" />
              کردنەوە
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    totalExpenses: expenses.length,
    storageSize: new Blob([JSON.stringify(localStorage)]).size / 1024,
  };

  return (
    <div className="pb-20 space-y-6">
      {/* App Info */}
      <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <h2 className="text-2xl font-bold mb-2">بەدواداچوونی خەرجی</h2>
        <p className="text-sm opacity-90">سیستەمی بەدواداچوونی خەرجیە رۆژانەکان و قەرزەکان</p>
        <div className="mt-4 text-xs opacity-75">
          Version 1.0.0
        </div>
      </div>

      {/* Theme Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            <h3 className="font-bold text-gray-800">ڕووکار</h3>
          </div>
          <button
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              settings.theme === 'dark'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {settings.theme === 'dark' ? 'تاریک' : 'ڕووناک'}
          </button>
        </div>
      </div>

      {/* Language Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={20} className="text-gray-700" />
          <h3 className="font-bold text-gray-800">زمان</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { code: 'ku', name: 'کوردی' },
            { code: 'ar', name: 'عەرەبی' },
            { code: 'en', name: 'English' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => updateSettings({ language: lang.code as any })}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                settings.language === lang.code
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Currency Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Download size={20} className="text-gray-700" />
          <h3 className="font-bold text-gray-800">جۆری پارە</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { code: 'IQD', name: 'دینار', symbol: 'د.ع' },
            { code: 'USD', name: 'دۆلار', symbol: '$' },
            { code: 'EUR', name: 'یۆرۆ', symbol: '€' },
          ].map((curr) => (
            <button
              key={curr.code}
              onClick={() => updateSettings({ currency: curr.code as any })}
              className={`p-3 rounded-lg border-2 font-medium transition-all ${
                settings.currency === curr.code
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <div className="text-lg">{curr.symbol}</div>
              <div className="text-xs">{curr.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Security Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Key size={20} className="text-gray-700" />
          <h3 className="font-bold text-gray-800">پاراستن</h3>
        </div>
        
        {settings.password ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 flex items-center gap-2">
                <Lock size={16} />
                ئەپەکە بە وشەی نهێنی پارێزراوە
              </p>
            </div>
            <button onClick={handleRemovePassword} className="btn btn-danger w-full text-sm">
              لابردنی وشەی نهێنی
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              وشەی نهێنی زیاد بکە بۆ پاراستنی زانیارییەکانت
            </p>
            <button
              onClick={() => setShowPasswordForm(true)}
              className="btn btn-primary w-full text-sm"
            >
              <Lock size={18} className="inline ml-1" />
              دانانی وشەی نهێنی
            </button>
          </div>
        )}
      </div>

      {/* Password Form */}
      {showPasswordForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">دانانی وشەی نهێنی</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وشەی نهێنی
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="لانیکەم ٤ پیت"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دووپاتکردنەوە
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  placeholder="دووبارە بنووسە"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSetPassword} className="btn btn-primary flex-1">
                  <Save size={18} className="inline ml-1" />
                  پاشەکەوتکردن
                </button>
                <button
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  className="btn btn-secondary"
                >
                  پاشگەزبوونەوە
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-gray-700" />
            <h3 className="font-bold text-gray-800">نۆتیفیکەیشنی یادەوەری</h3>
          </div>
          <button
            onClick={
              notificationSettings.enabled
                ? handleDisableNotifications
                : handleEnableNotifications
            }
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              notificationSettings.enabled
                ? 'bg-primary-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {notificationSettings.enabled ? 'چالاکە' : 'ناچالاکە'}
          </button>
        </div>

        {permissionStatus === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700">
              نۆتیفیکەیشن قەدەغە کراوە. تکایە لە ڕێکخستنەکانی وێبگەڕەکەتەوە ڕێگەی پێبدە.
            </p>
          </div>
        )}

        {notificationSettings.enabled && permissionStatus === 'granted' && (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                نۆتیفیکەیشن چالاکە و هەموو رۆژێک لە کاتژمێری دیاریکراودا یادەوەرییەک دەگاتە.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock size={16} />
                کاتی یادەوەری
              </label>
              <input
                type="time"
                value={notificationSettings.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="input"
              />
              <p className="text-xs text-gray-500 mt-1">
                نۆتیفیکەیشنێک دەگاتە ئەگەر هێشتا خەرجیەکانی ئەمرۆت داخل نەکردبێ
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Info size={20} className="text-gray-700" />
          <h3 className="font-bold text-gray-800">ئامار</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">کۆی خەرجیەکان</span>
            <span className="font-medium text-gray-800">{stats.totalExpenses}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">قەبارەی زانیاری</span>
            <span className="font-medium text-gray-800">
              {stats.storageSize.toFixed(2)} KB
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-600">دۆخی ئۆفلاین</span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              ئامادەیە
            </span>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Download size={20} className="text-gray-700" />
          <h3 className="font-bold text-gray-800">بەڕێوەبردنی زانیاری</h3>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            هەموو زانیاریەکانت لەسەر ئامێرەکەت پارێزراوە و لە ئینتەرنێتدا نییە.
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleBackup}
              className="btn btn-primary text-sm"
            >
              <Download size={18} className="inline ml-1" />
              بەکوپ
            </button>
            <button
              onClick={handleRestore}
              className="btn btn-secondary text-sm"
            >
              <Upload size={18} className="inline ml-1" />
              ڕێستۆر
            </button>
          </div>
          
          <button
            onClick={clearAllData}
            className="btn btn-danger w-full"
          >
            سڕینەوەی هەموو زانیاریەکان
          </button>
          
          <p className="text-xs text-gray-500">
            ⚠️ ئاگاداربە: ئەم کارە هەموو خەرجیەکان و قەرزەکانت دەسڕێتەوە
          </p>
        </div>
      </div>

      {/* Features List */}
      <div className="card">
        <h3 className="font-bold text-gray-800 mb-3">تایبەتمەندیەکان</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>تۆمارکردنی خەرجیە رۆژانەکان</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>سیستەمی بەدواداچوونی قەرز</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>راپۆرتی مانگانە بە چارتەوە</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>یادەوەری رۆژانە</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>کارکردن بەبێ ئینتەرنێت</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>ئیکسپۆرتی زانیارییەکان</span>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>دروستکراوە بە ❤️ بۆ بەدواداچوونی باشتری دارایی</p>
        <p className="mt-1 text-xs">© 2026 - هەموو مافێک پارێزراوە</p>
      </div>
    </div>
  );
};
