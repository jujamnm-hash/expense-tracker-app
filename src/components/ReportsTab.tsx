import React, { useState, useMemo } from 'react';
import { Download, Calendar, PieChart, TrendingUp, BarChart3 } from 'lucide-react';
import { useStore } from '../store';
import { getMonthlyReport, formatCurrency, exportToCSV, getKurdishMonthName } from '../utils';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export const ReportsTab: React.FC = () => {
  const expenses = useStore((state) => state.expenses);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const report = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    return getMonthlyReport(expenses, month - 1, year);
  }, [expenses, selectedMonth]);

  const categoryData = useMemo(() => {
    return Object.entries(report.categoryBreakdown).map(([name, value]) => ({
      name,
      value,
    }));
  }, [report.categoryBreakdown]);

  const dailyData = useMemo(() => {
    return report.dailyExpenses
      .filter((d) => d.amount > 0)
      .map((d) => ({
        date: format(new Date(d.date), 'dd'),
        amount: d.amount,
      }));
  }, [report.dailyExpenses]);

  const COLORS = [
    '#10b981',
    '#3b82f6',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#6366f1',
  ];

  const handleExport = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthExpenses = expenses.filter((exp) => {
      const expDate = new Date(exp.date);
      return expDate.getFullYear() === year && expDate.getMonth() === month - 1;
    });
    exportToCSV(monthExpenses);
  };

  return (
    <div className="pb-20 space-y-6">
      {/* Month Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          هەڵبژاردنی مانگ
        </label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="input"
        />
      </div>

      {/* Summary Card */}
      <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={24} />
          <h2 className="text-lg font-bold">
            {getKurdishMonthName(parseInt(selectedMonth.split('-')[1]) - 1)} {selectedMonth.split('-')[0]}
          </h2>
        </div>
        <div className="text-4xl font-bold mb-1">
          {formatCurrency(report.totalExpenses)}
        </div>
        <div className="text-sm opacity-90">کۆی خەرجی مانگ</div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <TrendingUp size={18} />
            <span className="text-sm">ژمارەی مامەڵە</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {expenses.filter((exp) => {
              const [year, month] = selectedMonth.split('-').map(Number);
              const expDate = new Date(exp.date);
              return expDate.getFullYear() === year && expDate.getMonth() === month - 1;
            }).length}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <BarChart3 size={18} />
            <span className="text-sm">ناوەندی رۆژانە</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">
            {formatCurrency(Math.round(report.totalExpenses / new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate()))}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart size={20} />
            پۆلێنکردن بەپێی جۆر
          </h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value) + ' دینار'} />
            </RechartsPieChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Trend */}
      {dailyData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            خەرجی رۆژانە
          </h3>
          
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                formatter={(value: number) => formatCurrency(value) + ' دینار'}
                labelFormatter={(label) => `رۆژی ${label}`}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Categories Bar Chart */}
      {categoryData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            بەراوردی جۆرەکان
          </h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value: number) => formatCurrency(value) + ' دینار'} />
              <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Export Button */}
      <button
        onClick={handleExport}
        className="btn btn-primary w-full flex items-center justify-center gap-2"
        disabled={report.totalExpenses === 0}
      >
        <Download size={20} />
        داونلۆدی راپۆرت (CSV)
      </button>

      {report.totalExpenses === 0 && (
        <div className="card text-center py-12">
          <div className="text-6xl mb-3">📊</div>
          <p className="text-gray-500">هیچ خەرجیەک نییە لەم مانگەدا</p>
          <p className="text-sm text-gray-400 mt-1">
            خەرجیەکانت زیاد بکە بۆ بینینی راپۆرتەکان
          </p>
        </div>
      )}
    </div>
  );
};
