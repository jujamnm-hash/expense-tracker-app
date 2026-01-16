import React, { useState } from 'react';
import { Plus, Bell, Calendar, Check, X, Trash2, AlertCircle } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { format, differenceInDays } from 'date-fns';

export const BillsTab: React.FC = () => {
  const { bills, addBill, deleteBill, toggleBillPaid, settings } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly');
  const [reminderDays, setReminderDays] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount > 0 && name.trim()) {
      addBill({
        name: name.trim(),
        amount,
        category: category.trim() || 'هیتر',
        dueDate,
        isPaid: false,
        isRecurring,
        frequency: isRecurring ? frequency : undefined,
        reminderDays,
      });
      setName('');
      setAmount(0);
      setCategory('');
      setDueDate(format(new Date(), 'yyyy-MM-dd'));
      setIsRecurring(false);
      setShowForm(false);
    }
  };

  const today = new Date();
  const upcomingBills = bills.filter(bill => !bill.isPaid);
  const paidBills = bills.filter(bill => bill.isPaid);

  const getBillStatus = (bill: any) => {
    const daysUntilDue = differenceInDays(new Date(bill.dueDate), today);
    if (bill.isPaid) return { text: 'پارەدراوە', color: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200' };
    if (daysUntilDue < 0) return { text: 'لە دواکەوتووە', color: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200' };
    if (daysUntilDue <= reminderDays) return { text: `${daysUntilDue} رۆژ ماوە`, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200' };
    return { text: `${daysUntilDue} رۆژ ماوە`, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200' };
  };

  const totalUnpaid = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
  const totalPaid = paidBills.reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className="pb-20 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">پسوڵەی نەدراو</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalUnpaid, settings.currency)}</p>
              <p className="text-orange-200 text-sm mt-1">{upcomingBills.length} پسوڵە</p>
            </div>
            <AlertCircle className="w-10 h-10 text-orange-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">پسوڵەی دراو</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalPaid, settings.currency)}</p>
              <p className="text-green-200 text-sm mt-1">{paidBills.length} پسوڵە</p>
            </div>
            <Check className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">کۆی گشتی</p>
              <p className="text-2xl font-bold mt-1">{bills.length}</p>
              <p className="text-purple-200 text-sm mt-1">پسوڵە</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Add Bill Button */}
      <button
        onClick={() => setShowForm(true)}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" />
        زیادکردنی پسوڵە
      </button>

      {/* Add Bill Form */}
      {showForm && (
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-2 border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-bold mb-4 text-blue-800 dark:text-blue-400">
            پسوڵەی نوێ
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ناوی پسوڵە</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input w-full"
                placeholder="کارەبا، ئاو، مۆبایل..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">بڕی پارە</label>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="input w-full"
                placeholder="0"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">جۆر</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input w-full"
                placeholder="كارەبا و ئاو، گواستنەوە..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">بەرواری کۆتایی</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">یادەوەری ({reminderDays} رۆژ پێشتر)</label>
              <input
                type="range"
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value))}
                min="1"
                max="30"
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 رۆژ</span>
                <span>30 رۆژ</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recurring-bill"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="recurring-bill" className="text-sm flex items-center gap-2">
                <Bell className="w-4 h-4" />
                پسوڵەی دووبارە
              </label>
            </div>

            {isRecurring && (
              <div>
                <label className="block text-sm font-medium mb-2">ماوە</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="input w-full"
                >
                  <option value="monthly">مانگانە</option>
                  <option value="yearly">ساڵانە</option>
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                زیادکردن
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setName('');
                  setAmount(0);
                  setCategory('');
                  setIsRecurring(false);
                }}
                className="btn-secondary flex-1"
              >
                پاشگەزبوونەوە
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upcoming Bills */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          پسوڵەی داهاتوو ({upcomingBills.length})
        </h3>
        {upcomingBills.length === 0 ? (
          <div className="card text-center py-8">
            <Check className="w-16 h-16 mx-auto text-green-300 dark:text-green-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              هەموو پسوڵەکان دراون! 🎉
            </p>
          </div>
        ) : (
          upcomingBills
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map((bill) => {
              const status = getBillStatus(bill);
              return (
                <div
                  key={bill.id}
                  className="card hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-lg">{bill.name}</h4>
                        {bill.isRecurring && (
                          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                            {bill.frequency === 'monthly' ? 'مانگانە' : 'ساڵانە'}
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                        {formatCurrency(bill.amount, settings.currency)}
                      </p>
                      {bill.category && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {bill.category}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>بەرواری کۆتایی: {format(new Date(bill.dueDate), 'dd/MM/yyyy')}</span>
                      </div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${status.color}`}>
                        {status.text}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleBillPaid(bill.id)}
                        className="p-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg transition-colors"
                        title="نیشانکردن وەک دراو"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteBill(bill.id)}
                        className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Paid Bills */}
      {paidBills.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Check className="w-5 h-5 text-green-500" />
            پسوڵەی دراو ({paidBills.length})
          </h3>
          {paidBills.map((bill) => (
            <div
              key={bill.id}
              className="card opacity-60 hover:opacity-100 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg line-through">{bill.name}</h4>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                      ✓ دراوە
                    </span>
                  </div>
                  <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                    {formatCurrency(bill.amount, settings.currency)}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(bill.dueDate), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleBillPaid(bill.id)}
                    className="p-2 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900 dark:hover:bg-orange-800 text-orange-700 dark:text-orange-300 rounded-lg transition-colors"
                    title="نیشانکردن وەک نەدراو"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteBill(bill.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
