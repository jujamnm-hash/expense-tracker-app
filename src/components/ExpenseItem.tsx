import React from 'react';
import { Trash2, Calendar, Tag } from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency } from '../utils';
import { format } from 'date-fns';

interface ExpenseItemProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onDelete }) => {
  const handleDelete = () => {
    if (confirm('دڵنیای لە سڕینەوەی ئەم خەرجیە؟')) {
      onDelete(expense.id);
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-primary-600">
              {formatCurrency(expense.amount)}
            </span>
            <span className="text-sm text-gray-500">دینار</span>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Tag size={16} />
              <span>{expense.category}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{format(new Date(expense.date), 'yyyy/MM/dd')}</span>
            </div>
          </div>
          
          {expense.description && (
            <p className="mt-2 text-sm text-gray-700">{expense.description}</p>
          )}
        </div>
        
        <button
          onClick={handleDelete}
          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
};
