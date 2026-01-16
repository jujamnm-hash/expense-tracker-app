import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useStore } from '../store';
import { format } from 'date-fns';

interface AddDebtFormProps {
  onClose: () => void;
}

export const AddDebtForm: React.FC<AddDebtFormProps> = ({ onClose }) => {
  const addDebt = useStore((state) => state.addDebt);
  const [type, setType] = useState<'borrowed' | 'lent'>('borrowed');
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !personName) return;

    addDebt({
      type,
      personName,
      amount: parseFloat(amount),
      description,
      date,
      dueDate: dueDate || undefined,
      status: 'active',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 animate-fade-in">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">زیادکردنی قەرز</h2>
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
              جۆری قەرز
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('borrowed')}
                className={`p-3 rounded-lg border-2 font-medium transition-all ${
                  type === 'borrowed'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                قەرزگرتن
              </button>
              <button
                type="button"
                onClick={() => setType('lent')}
                className={`p-3 rounded-lg border-2 font-medium transition-all ${
                  type === 'lent'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                قەرزدان
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ناوی کەس
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="input"
              placeholder="ناو"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              بڕ (دینار)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input"
              placeholder="١٠٠٠٠٠"
              required
              min="0"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              بەرواری قەرز
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
              بەرواری گەڕانەوە (دڵخواز)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تێبینی (دڵخواز)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              rows={3}
              placeholder="وردەکاری..."
            />
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
  );
};
