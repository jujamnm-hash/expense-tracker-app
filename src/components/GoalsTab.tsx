import React, { useState } from 'react';
import { Plus, Target, Calendar, X } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { format } from 'date-fns';

const GOAL_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export const GoalsTab: React.FC = () => {
  const { goals, addGoal, deleteGoal, addToGoal } = useStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showContributeForm, setShowContributeForm] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(GOAL_COLORS[0]);
  const [contributeAmount, setContributeAmount] = useState('');

  const handleAddGoal = () => {
    if (!name || !targetAmount || parseFloat(targetAmount) <= 0) return;

    addGoal({
      name,
      targetAmount: parseFloat(targetAmount),
      deadline: deadline || undefined,
      description,
      color: selectedColor,
    });

    setName('');
    setTargetAmount('');
    setDeadline('');
    setDescription('');
    setSelectedColor(GOAL_COLORS[0]);
    setShowAddForm(false);
  };

  const handleContribute = (goalId: string) => {
    if (!contributeAmount || parseFloat(contributeAmount) <= 0) return;

    addToGoal(goalId, parseFloat(contributeAmount));
    setContributeAmount('');
    setShowContributeForm(null);
  };

  const sortedGoals = [...goals].sort((a, b) => {
    const aProgress = (a.currentAmount / a.targetAmount) * 100;
    const bProgress = (b.currentAmount / b.targetAmount) * 100;
    
    if (aProgress === 100 && bProgress !== 100) return 1;
    if (aProgress !== 100 && bProgress === 100) return -1;
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="pb-20 space-y-6">
      {/* Summary Card */}
      <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
        <div className="flex items-center gap-2 mb-3">
          <Target size={24} />
          <h2 className="text-xl font-bold">ئامانجە داراییەکان</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <div className="text-xs opacity-90 mb-1">ئامانجەکان</div>
            <div className="text-2xl font-bold">{goals.length}</div>
          </div>
          <div>
            <div className="text-xs opacity-90 mb-1">تەواوکراو</div>
            <div className="text-2xl font-bold">{completedGoals}</div>
          </div>
          <div>
            <div className="text-xs opacity-90 mb-1">کۆڵەکراو</div>
            <div className="text-lg font-bold">{formatCurrency(totalSaved)}</div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {sortedGoals.length === 0 ? (
          <div className="card text-center py-12">
            <Target size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">هیچ ئامانجێک نییە</p>
            <p className="text-sm text-gray-400 mt-1">
              ئامانجە داراییەکانت زیاد بکە
            </p>
          </div>
        ) : (
          sortedGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = progress >= 100;
            const remaining = goal.targetAmount - goal.currentAmount;

            return (
              <div
                key={goal.id}
                className="card"
                style={{ borderRight: `4px solid ${goal.color}` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-lg mb-1 flex items-center gap-2">
                      {goal.name}
                      {isCompleted && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          ✓ تەواو
                        </span>
                      )}
                    </h3>
                    {goal.description && (
                      <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                    )}
                    {goal.deadline && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>{format(new Date(goal.deadline), 'yyyy/MM/dd')}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('دڵنیای لە سڕینەوەی ئەم ئامانجە؟')) {
                        deleteGoal(goal.id);
                      }
                    }}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Amount Info */}
                <div className="mb-3">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-2xl font-bold text-gray-800">
                      {formatCurrency(goal.currentAmount)}
                    </span>
                    <span className="text-sm text-gray-500">
                      / {formatCurrency(goal.targetAmount)} دینار
                    </span>
                  </div>
                  {!isCompleted && (
                    <p className="text-sm text-gray-600">
                      {formatCurrency(remaining)} دینار ماوە
                    </p>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: goal.color,
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-center">
                    {progress.toFixed(1)}%
                  </div>
                </div>

                {/* Add Money Button */}
                {!isCompleted && (
                  <button
                    onClick={() => setShowContributeForm(goal.id)}
                    className="w-full btn btn-primary text-sm"
                  >
                    <Plus size={18} className="inline ml-1" />
                    زیادکردنی پارە
                  </button>
                )}

                {/* Contribute Form */}
                {showContributeForm === goal.id && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
                    <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        زیادکردنی پارە بۆ {goal.name}
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            بڕ (دینار)
                          </label>
                          <input
                            type="number"
                            value={contributeAmount}
                            onChange={(e) => setContributeAmount(e.target.value)}
                            className="input"
                            placeholder="٥٠٠٠٠"
                            min="0"
                            step="1000"
                            max={remaining}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            {formatCurrency(remaining)} دینار ماوە بۆ تەواوبوون
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleContribute(goal.id)}
                            className="btn btn-primary flex-1"
                          >
                            زیادکردن
                          </button>
                          <button
                            onClick={() => {
                              setShowContributeForm(null);
                              setContributeAmount('');
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
              </div>
            );
          })
        )}
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">ئامانجێکی نوێ</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ناوی ئامانج
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="کڕینی ئۆتۆمبێل"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  بڕی ئامانج (دینار)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="input"
                  placeholder="١٠٠٠٠٠٠٠"
                  min="0"
                  step="100000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کۆتایی (دڵخواز)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وەسف (دڵخواز)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input resize-none"
                  rows={3}
                  placeholder="وردەکاری..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ڕەنگ
                </label>
                <div className="flex gap-2 flex-wrap">
                  {GOAL_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${
                        selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={handleAddGoal} className="btn btn-primary flex-1">
                  <Plus size={20} className="inline ml-2" />
                  زیادکردن
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-secondary"
                >
                  پاشگەزبوونەوە
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 btn btn-primary shadow-lg px-6 py-3 rounded-full flex items-center gap-2 z-10"
      >
        <Plus size={24} />
        <span>ئامانجی نوێ</span>
      </button>
    </div>
  );
};
