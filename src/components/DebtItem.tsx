import React, { useState } from 'react';
import { Trash2, Calendar, User, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Debt } from '../types';
import { formatCurrency } from '../utils';
import { format } from 'date-fns';
import { useStore } from '../store';

interface DebtItemProps {
  debt: Debt;
  onDelete: (id: string) => void;
}

export const DebtItem: React.FC<DebtItemProps> = ({ debt, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const addPayment = useStore((state) => state.addPayment);

  const handleDelete = () => {
    if (confirm('دڵنیای لە سڕینەوەی ئەم قەرزە؟')) {
      onDelete(debt.id);
    }
  };

  const handleAddPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    if (parseFloat(paymentAmount) > debt.remainingAmount) {
      alert('بڕی وەرگیراوە زۆرترە لە ماوەی قەرزەکە');
      return;
    }

    addPayment(debt.id, {
      amount: parseFloat(paymentAmount),
      date: format(new Date(), 'yyyy-MM-dd'),
      note: paymentNote || undefined,
    });

    setPaymentAmount('');
    setPaymentNote('');
  };

  const progressPercentage = ((debt.amount - debt.remainingAmount) / debt.amount) * 100;

  return (
    <div className={`card ${debt.type === 'borrowed' ? 'border-r-4 border-r-red-400' : 'border-r-4 border-r-green-400'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                debt.type === 'borrowed'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {debt.type === 'borrowed' ? 'قەرزگرتن' : 'قەرزدان'}
            </span>
            {debt.status === 'paid' && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                تەواوبووە
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <User size={18} className="text-gray-500" />
            <span className="font-medium text-gray-800">{debt.personName}</span>
          </div>
          
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(debt.remainingAmount)}
            <span className="text-sm font-normal text-gray-500 mr-2">/ {formatCurrency(debt.amount)} دینار</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className={`h-2 rounded-full transition-all ${
                debt.type === 'borrowed' ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{format(new Date(debt.date), 'yyyy/MM/dd')}</span>
            </div>
            {debt.dueDate && (
              <div className="flex items-center gap-1">
                <span>→</span>
                <span>{format(new Date(debt.dueDate), 'yyyy/MM/dd')}</span>
              </div>
            )}
          </div>
          
          {debt.description && (
            <p className="mt-2 text-sm text-gray-700">{debt.description}</p>
          )}
        </div>
        
        <button
          onClick={handleDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Expand/Collapse Button */}
      {debt.status === 'active' && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        >
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          <span>{isExpanded ? 'داخستن' : 'زیادکردنی پارەدان'}</span>
        </button>
      )}

      {/* Payment Section */}
      {isExpanded && debt.status === 'active' && (
        <div className="mt-4 pt-4 border-t space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              بڕی پارەدان
            </label>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="input text-sm"
              placeholder="بڕ بە دینار"
              min="0"
              max={debt.remainingAmount}
              step="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              تێبینی (دڵخواز)
            </label>
            <input
              type="text"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="input text-sm"
              placeholder="تێبینی..."
            />
          </div>
          
          <button
            onClick={handleAddPayment}
            className="btn btn-primary w-full text-sm"
            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
          >
            <Plus size={18} className="inline ml-1" />
            زیادکردنی پارەدان
          </button>
        </div>
      )}

      {/* Payment History */}
      {debt.payments.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            مێژووی پارەدانەکان ({debt.payments.length})
          </h4>
          <div className="space-y-2">
            {debt.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
              >
                <div>
                  <div className="font-medium text-gray-800">
                    {formatCurrency(payment.amount)} دینار
                  </div>
                  {payment.note && (
                    <div className="text-xs text-gray-600">{payment.note}</div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(payment.date), 'yyyy/MM/dd')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
