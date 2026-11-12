import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Download,
  RotateCcw,
  Pencil,
  Trash2,
  ArrowUpDown,
  X,
  AlertCircle,
} from 'lucide-react';
import { EXPENSE_CATEGORIES, useFinance } from '../context/FinanceContext';
import { ExpenseCategory, Transaction } from '../types/finance';
import {
  exportTransactionsToCSV,
  formatCurrency,
  formatDateShort,
} from '../utils/formatters';
import { CategoryIcon } from '../components/CategoryIcon';

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export const ExpensesPage: React.FC = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    resetDemoData,
    currency,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useFinance();

  // Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState('2026-11-11');
  const [description, setDescription] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete Confirmation Modal State
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const openAddModal = () => {
    setEditingTx(null);
    setTitle('');
    setAmount('');
    setCategory('Food');
    setDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setTitle(tx.title);
    setAmount(String(tx.amount));
    setCategory(tx.category);
    setDate(tx.date);
    setDescription(tx.description);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 2) {
      errors.title = 'Please enter an expense title (at least 2 characters).';
    }
    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = 'Please enter a valid positive amount greater than 0.';
    }
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.date = 'Please select a valid transaction date.';
    }
    if (!description.trim()) {
      errors.description = 'Please provide a brief description for this expense.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      title: title.trim(),
      amount: Number(Number(amount).toFixed(2)),
      category,
      date,
      description: description.trim(),
    };

    if (editingTx) {
      await updateTransaction(editingTx.id, payload);
    } else {
      await addTransaction(payload);
    }
    setIsModalOpen(false);
  };

  const filteredAndSortedTransactions = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();

    return transactions
      .filter((tx) => {
        if (selectedCategory !== 'All' && tx.category !== selectedCategory) {
          return false;
        }
        if (startDate && tx.date < startDate) {
          return false;
        }
        if (endDate && tx.date > endDate) {
          return false;
        }
        if (q) {
          const matchesTitle = tx.title.toLowerCase().includes(q);
          const matchesDesc = tx.description.toLowerCase().includes(q);
          const matchesCat = tx.category.toLowerCase().includes(q);
          const matchesId = tx.id.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCat && !matchesId) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          const cmp = a.date.localeCompare(b.date);
          return sortOrder === 'asc' ? cmp : -cmp;
        } else {
          const cmp = a.amount - b.amount;
          return sortOrder === 'asc' ? cmp : -cmp;
        }
      });
  }, [transactions, selectedCategory, startDate, endDate, globalSearchQuery, sortField, sortOrder]);

  const filteredTotalAmount = useMemo(() => {
    return filteredAndSortedTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [filteredAndSortedTransactions]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setGlobalSearchQuery('');
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:px-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Transaction Ledger & Expense Controls
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing {filteredAndSortedTransactions.length} of {transactions.length} transactions ·
            Filtered Subtotal:{' '}
            <span className="font-mono-tabular font-semibold text-slate-800 dark:text-slate-200">
              {formatCurrency(filteredTotalAmount, currency)}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() =>
              exportTransactionsToCSV(
                filteredAndSortedTransactions,
                currency,
                'spendwise-expenses.csv'
              )
            }
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <RotateCcw size={14} />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus size={15} />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Search, Filter & Sort Controls Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:px-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
          {/* Search Input */}
          <div className="lg:col-span-4">
            <label
              htmlFor="expense-search"
              className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
            >
              Search Transactions
            </label>
            <div className="relative">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                id="expense-search"
                type="search"
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                placeholder="Search by title, description, or ID..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-3">
            <label
              htmlFor="category-filter"
              className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
            >
              Filter by Category
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory | 'All')}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Categories (8)</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div className="lg:col-span-2">
            <label
              htmlFor="date-start"
              className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
            >
              From Date
            </label>
            <input
              id="date-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-2 text-xs font-mono-tabular rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Date To */}
          <div className="lg:col-span-2">
            <label
              htmlFor="date-end"
              className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1"
            >
              To Date
            </label>
            <input
              id="date-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-2 text-xs font-mono-tabular rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Clear Filters Button */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="w-full px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Sort Controls Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Sort Ledger By:</span>
            <button
              type="button"
              onClick={() => toggleSort('date')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sortField === 'date'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>Date ({sortField === 'date' ? (sortOrder === 'desc' ? 'Newest' : 'Oldest') : 'Sort'})</span>
              <ArrowUpDown size={13} />
            </button>

            <button
              type="button"
              onClick={() => toggleSort('amount')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                sortField === 'amount'
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>
                Amount ({sortField === 'amount' ? (sortOrder === 'desc' ? 'Highest' : 'Lowest') : 'Sort'})
              </span>
              <ArrowUpDown size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Expense List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3.5 px-6">Expense Title & Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
              {filteredAndSortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 px-6 text-center">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      No matching expenses found
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Try clearing your search or category filter, or add a new expense entry.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2.5">
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                      >
                        Reset Filters
                      </button>
                      <button
                        type="button"
                        onClick={openAddModal}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white"
                      >
                        Add Expense
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndSortedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <CategoryIcon category={tx.category} />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {tx.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                            {tx.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {tx.category}
                    </td>
                    <td className="py-3.5 px-4 font-mono-tabular text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDateShort(tx.date)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono-tabular font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="py-3.5 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(tx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          aria-label={`Edit ${tx.title}`}
                          title="Edit expense"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTx(tx)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          aria-label={`Delete ${tx.title}`}
                          title="Delete expense"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Validated Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="expense-modal-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3
                id="expense-modal-title"
                className="font-display font-bold text-base text-slate-900 dark:text-white"
              >
                {editingTx ? 'Edit Expense Entry' : 'Add New Expense'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} noValidate className="p-6 space-y-4">
              {/* Expense Title */}
              <div>
                <label
                  htmlFor="exp-title"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Expense Title *
                </label>
                <input
                  id="exp-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Trader Joe's Grocery Run"
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
                />
                {formErrors.title && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{formErrors.title}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Amount */}
                <div>
                  <label
                    htmlFor="exp-amount"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Amount (USD Base) *
                  </label>
                  <input
                    id="exp-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2 text-sm font-mono-tabular rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
                  />
                  {formErrors.amount && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{formErrors.amount}</span>
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="exp-category"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Category *
                  </label>
                  <select
                    id="exp-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="exp-date"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Date *
                </label>
                <input
                  id="exp-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-mono-tabular rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none"
                />
                {formErrors.date && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{formErrors.date}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="exp-description"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Description *
                </label>
                <textarea
                  id="exp-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide notes or merchant context for this transaction..."
                  className="w-full px-3.5 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-blue-600 focus:outline-none resize-none"
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{formErrors.description}</span>
                  </p>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
                >
                  {editingTx ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Confirmation Dialog */}
      {deletingTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <h3
              id="delete-modal-title"
              className="font-display font-bold text-base text-slate-900 dark:text-white"
            >
              Delete Expense Entry?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Are you sure you want to permanently remove{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                &ldquo;{deletingTx.title}&rdquo;
              </span>{' '}
              ({formatCurrency(deletingTx.amount, currency)}) from your ledger?
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteTransaction(deletingTx.id);
                  setDeletingTx(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Confirmation Dialog */}
      {confirmResetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-xl">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Restore Default Demo Transactions?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              This will reset all local expense modifications and budget allocations back to the
              initial sample dataset.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setConfirmResetOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Restore Defaults
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
