import { Expense, MonthlyReport } from './types';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ar-IQ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getMonthlyReport = (
  expenses: Expense[],
  month: number,
  year: number
): MonthlyReport => {
  const startDate = startOfMonth(new Date(year, month, 1));
  const endDate = endOfMonth(startDate);
  
  const monthlyExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startDate && expenseDate <= endDate;
  });
  
  const totalExpenses = monthlyExpenses.reduce(
    (sum, exp) => sum + exp.amount,
    0
  );
  
  const categoryBreakdown: { [key: string]: number } = {};
  monthlyExpenses.forEach((expense) => {
    categoryBreakdown[expense.category] =
      (categoryBreakdown[expense.category] || 0) + expense.amount;
  });
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dailyExpenses = days.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayTotal = monthlyExpenses
      .filter((exp) => exp.date === dayStr)
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    return { date: dayStr, amount: dayTotal };
  });
  
  return {
    month: format(startDate, 'MMMM'),
    year,
    totalExpenses,
    categoryBreakdown,
    dailyExpenses,
  };
};

export const getTodayExpenseTotal = (expenses: Expense[]): number => {
  const today = format(new Date(), 'yyyy-MM-dd');
  return expenses
    .filter((exp) => exp.date === today)
    .reduce((sum, exp) => sum + exp.amount, 0);
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const showNotification = (title: string, body: string): void => {
  if ('serviceWorker' in navigator && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [200, 100, 200],
        tag: 'expense-reminder',
        renotify: true,
        requireInteraction: false,
        dir: 'rtl',
        lang: 'ku',
      });
    });
  } else if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/pwa-192x192.png',
      dir: 'rtl',
      lang: 'ku',
    });
  }
};

export const checkAndSendNotification = (
  lastNotified: string | undefined,
  notificationTime: string,
  todayHasExpenses: boolean
): boolean => {
  const now = new Date();
  const [hours, minutes] = notificationTime.split(':').map(Number);
  const notificationDateTime = new Date();
  notificationDateTime.setHours(hours, minutes, 0, 0);
  
  const today = format(now, 'yyyy-MM-dd');
  const lastNotifiedDate = lastNotified ? format(new Date(lastNotified), 'yyyy-MM-dd') : null;
  
  // Send notification if:
  // 1. Current time is past notification time
  // 2. Haven't notified today yet
  // 3. User hasn't entered expenses today
  if (
    now >= notificationDateTime &&
    lastNotifiedDate !== today &&
    !todayHasExpenses
  ) {
    showNotification(
      'یادەوەری خەرجیەکان',
      'تکایە خەرجیەکانی ئەمرۆت داخڵ بکە'
    );
    return true;
  }
  
  return false;
};

export const getKurdishMonthName = (monthIndex: number): string => {
  const months = [
    'کانوونی دووەم',
    'شوبات',
    'ئازار',
    'نیسان',
    'ئایار',
    'حوزەیران',
    'تەمموز',
    'ئاب',
    'ئەیلوول',
    'تشرینی یەکەم',
    'تشرینی دووەم',
    'کانوونی یەکەم',
  ];
  return months[monthIndex];
};

export const exportToCSV = (expenses: Expense[]): void => {
  const headers = ['بەروار', 'بڕ', 'جۆر', 'وەسف'];
  const rows = expenses.map((exp) => [
    exp.date,
    exp.amount.toString(),
    exp.category,
    exp.description,
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');
  
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
