import React, { useState } from 'react';
import { FileDown, Download, Loader, CheckCircle, FileText, BarChart2, Wallet } from 'lucide-react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { startOfMonth, endOfMonth, parseISO, format } from 'date-fns';
import jsPDF from 'jspdf';

export const ExportTab: React.FC = () => {
  const { expenses, incomes, budgets, debts, goals, settings } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const generatePDF = async () => {
    setIsExporting(true);
    setExportComplete(false);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;

      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Expense Tracker Report', pageWidth / 2, yPos, { align: 'center' });
      
      yPos += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, pageWidth / 2, yPos, { align: 'center' });

      // Current Month Summary
      yPos += 15;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Monthly Summary', 20, yPos);
      
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      const monthlyExpenses = expenses
        .filter(e => {
          const expDate = parseISO(e.date);
          return expDate >= monthStart && expDate <= monthEnd;
        })
        .reduce((sum, e) => sum + e.amount, 0);

      const monthlyIncome = incomes
        .filter(inc => {
          const incDate = parseISO(inc.date);
          return incDate >= monthStart && incDate <= monthEnd;
        })
        .reduce((sum, inc) => sum + inc.amount, 0);

      const savings = monthlyIncome - monthlyExpenses;

      yPos += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 150, 0);
      pdf.text(`Income: ${formatCurrency(monthlyIncome, settings.currency)}`, 20, yPos);
      
      yPos += 7;
      pdf.setTextColor(220, 38, 38);
      pdf.text(`Expenses: ${formatCurrency(monthlyExpenses, settings.currency)}`, 20, yPos);
      
      yPos += 7;
      pdf.setTextColor(savings >= 0 ? 0 : 220, savings >= 0 ? 100 : 38, savings >= 0 ? 200 : 38);
      pdf.text(`Savings: ${formatCurrency(savings, settings.currency)}`, 20, yPos);

      // Top Expenses by Category
      yPos += 15;
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Top Expenses by Category', 20, yPos);

      const categoryTotals: Record<string, number> = {};
      expenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
      });

      const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

      yPos += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      topCategories.forEach(([category, amount], index) => {
        const percentage = (amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100;
        pdf.text(`${index + 1}. ${category}: ${formatCurrency(amount, settings.currency)} (${percentage.toFixed(1)}%)`, 25, yPos);
        yPos += 7;
      });

      // Budget Status
      yPos += 10;
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Budget Status', 20, yPos);

      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthBudgets = budgets.filter(b => b.month === currentMonth);

      yPos += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      if (monthBudgets.length === 0) {
        pdf.text('No budgets set for this month', 25, yPos);
        yPos += 7;
      } else {
        monthBudgets.forEach(budget => {
          const percentage = (budget.spent / budget.monthlyLimit) * 100;
          const status = percentage > 100 ? 'Over' : percentage > 80 ? 'Warning' : 'On Track';
          pdf.setTextColor(percentage > 100 ? 220 : percentage > 80 ? 200 : 0, percentage > 100 ? 38 : percentage > 80 ? 150 : 150, percentage > 100 ? 38 : percentage > 80 ? 0 : 0);
          pdf.text(`${budget.category}: ${formatCurrency(budget.spent, settings.currency)}/${formatCurrency(budget.monthlyLimit, settings.currency)} (${percentage.toFixed(0)}% - ${status})`, 25, yPos);
          yPos += 7;
          pdf.setTextColor(0, 0, 0);
        });
      }

      // Debts Summary
      yPos += 10;
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Debts Summary', 20, yPos);

      const activeDebts = debts.filter(d => d.status === 'active');
      const totalDebt = activeDebts.reduce((sum, d) => sum + d.remainingAmount, 0);

      yPos += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Active Debt: ${formatCurrency(totalDebt, settings.currency)}`, 25, yPos);

      yPos += 7;
      pdf.setFontSize(11);
      activeDebts.slice(0, 5).forEach(debt => {
        pdf.text(`${debt.personName} (${debt.type}): ${formatCurrency(debt.remainingAmount, settings.currency)}`, 25, yPos);
        yPos += 7;
      });

      // Goals Progress
      yPos += 10;
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Goals Progress', 20, yPos);

      yPos += 10;
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      if (goals.length === 0) {
        pdf.text('No goals set', 25, yPos);
      } else {
        goals.slice(0, 5).forEach(goal => {
          const percentage = (goal.currentAmount / goal.targetAmount) * 100;
          pdf.text(`${goal.name}: ${formatCurrency(goal.currentAmount, settings.currency)}/${formatCurrency(goal.targetAmount, settings.currency)} (${percentage.toFixed(0)}%)`, 25, yPos);
          yPos += 7;
        });
      }

      // Recent Transactions
      yPos += 10;
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = 20;
      }

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Recent Expenses', 20, yPos);

      yPos += 10;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      const recentExpenses = expenses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      recentExpenses.forEach(expense => {
        if (yPos > pageHeight - 20) {
          pdf.addPage();
          yPos = 20;
        }
        const dateStr = format(parseISO(expense.date), 'MMM dd, yyyy');
        pdf.text(`${dateStr} - ${expense.category}: ${formatCurrency(expense.amount, settings.currency)} - ${expense.description}`, 25, yPos);
        yPos += 6;
      });

      // Footer
      const pageCount = pdf.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'italic');
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text('Generated by Expense Tracker App', pageWidth / 2, pageHeight - 5, { align: 'center' });
      }

      // Save PDF
      pdf.save(`expense-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      setExportComplete(true);
      setTimeout(() => {
        setExportComplete(false);
      }, 3000);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = (type: 'expenses' | 'income' | 'all') => {
    let csvContent = '';
    
    if (type === 'expenses' || type === 'all') {
      csvContent += 'Type,Date,Category,Description,Amount,Currency\n';
      expenses.forEach(expense => {
        csvContent += `Expense,${expense.date},${expense.category},"${expense.description}",${expense.amount},${settings.currency}\n`;
      });
      
      if (type === 'all') {
        csvContent += '\n';
      }
    }
    
    if (type === 'income' || type === 'all') {
      if (type !== 'all') {
        csvContent += 'Type,Date,Source,Description,Amount,Currency\n';
      }
      incomes.forEach(income => {
        csvContent += `Income,${income.date},${income.source},"${income.description}",${income.amount},${settings.currency}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-br from-blue-600 via-purple-500 to-pink-500 text-white">
        <div className="flex items-center gap-3">
          <FileDown className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">دەرهێنان و هەناردە</h2>
            <p className="text-white/90 text-sm mt-1">
              دەرهێنانی ڕاپۆرت بە PDF یان CSV
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {exportComplete && (
        <div className="card bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <p className="font-semibold">فایلەکە بە سەرکەوتوویی دەرهێنرا!</p>
          </div>
        </div>
      )}

      {/* PDF Export */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-bold">دەرهێنان بۆ PDF</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          ڕاپۆرتێکی تەواو لەگەڵ چارت و ئاماری وردەکاری دروست بکە
        </p>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ڕاپۆرتەکە ئەمانە لەخۆ دەگرێت:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• کورتەی مانگانە (داهات، خەرجی، پاشەکەوت)</li>
              <li>• زۆرترین کاتەگۆری خەرجی</li>
              <li>• دۆخی بودجە</li>
              <li>• کورتەی قەرز</li>
              <li>• پێشکەوتنی ئامانجەکان</li>
              <li>• 10 مامەڵەی کۆتایی</li>
            </ul>
          </div>

          <button
            onClick={generatePDF}
            disabled={isExporting}
            className={`w-full py-4 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all ${
              isExporting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:scale-105'
            }`}
          >
            {isExporting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                دەرهێنانی PDF...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                دەرهێنانی ڕاپۆرتی تەواو
              </>
            )}
          </button>
        </div>
      </div>

      {/* CSV Export */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <BarChart2 className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-bold">دەرهێنان بۆ CSV</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          دەرهێنانی زانیاری بۆ Excel یان Google Sheets
        </p>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => exportToCSV('expenses')}
            className="py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-red-500 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            دەرهێنانی خەرجیەکان
          </button>

          <button
            onClick={() => exportToCSV('income')}
            className="py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            دەرهێنانی داهاتەکان
          </button>

          <button
            onClick={() => exportToCSV('all')}
            className="py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            دەرهێنانی هەموو زانیاریەکان
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="card bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-2 border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-3 mb-3">
          <Wallet className="w-6 h-6 text-indigo-600" />
          <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-400">
            ئامارەکان
          </h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600">{expenses.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">خەرجی</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{incomes.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">داهات</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{budgets.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">بودجە</p>
          </div>
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{goals.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">ئامانج</p>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-2 border-yellow-200 dark:border-yellow-800">
        <div className="flex gap-3">
          <span className="text-2xl">📊</span>
          <div>
            <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-1">
              تێبینی
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• فایلی PDF ڕاپۆرتێکی تەواوە بە چارت و ئاماری وردەکاری</li>
              <li>• فایلی CSV دەتوانی لە Excel یان Google Sheets بیکەیتەوە</li>
              <li>• هەموو فایلەکان ئۆتۆماتیک دادەبەزێن</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
