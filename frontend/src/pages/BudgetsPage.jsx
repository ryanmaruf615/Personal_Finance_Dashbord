import { useState, useCallback } from 'react';
import { useBudgets } from '../hooks/useBudgets';
import MonthSelector from '../components/budgets/MonthSelector';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetForm from '../components/budgets/BudgetForm';
import { EmptyState, ConfirmDialog } from '../components/shared';
import { budgetApi } from '../api/budgetApi';
import { formatCurrency } from '../utils/formatCurrency';
import { getCurrentYearMonth } from '../utils/formatDate';
import toast from 'react-hot-toast';

const BudgetsPage = () => {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const { budgetStatus, loading, refresh } = useBudgets(yearMonth);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingBudget, setDeletingBudget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─── Summary ──────────────────────────────────────────────────────
  const totalBudgeted = budgetStatus.reduce((s, b) => s + b.amountLimit, 0);
  const totalSpent = budgetStatus.reduce((s, b) => s + b.amountSpent, 0);
  const totalRemaining = totalBudgeted - totalSpent;

  // ─── Month change ─────────────────────────────────────────────────
  const handleMonthChange = useCallback((m) => {
    setYearMonth(m);
  }, []);

  // ─── Add ──────────────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    setEditingBudget(null);
    setFormOpen(true);
  }, []);

  // ─── Edit ─────────────────────────────────────────────────────────
  const handleEdit = useCallback((budget) => {
    setEditingBudget(budget);
    setFormOpen(true);
  }, []);

  // ─── Delete ───────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((budget) => {
    setDeletingBudget(budget);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingBudget) return;
    setDeleteLoading(true);
    try {
      await budgetApi.delete(deletingBudget.budgetId);
      toast.success('Budget removed');
      setDeletingBudget(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  }, [deletingBudget, refresh]);

  const handleFormSuccess = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-sm text-gray-500 mt-1">Track your monthly spending limits</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthSelector yearMonth={yearMonth} onChange={handleMonthChange} />
          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Set Budget
          </button>
        </div>
      </div>

      {/* Summary Row */}
      {!loading && budgetStatus.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Budgeted</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatCurrency(totalBudgeted)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Spent</p>
            <p className={`text-xl font-bold mt-1 ${totalSpent > totalBudgeted ? 'text-red-600' : 'text-gray-900'}`}>
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Remaining</p>
            <p className={`text-xl font-bold mt-1 ${totalRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {formatCurrency(totalRemaining)}
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <BudgetCard.Skeleton key={i} />)}
        </div>
      )}

      {/* Empty State */}
      {!loading && budgetStatus.length === 0 && (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3v-6m-3 6v-1m0-4V8m12 4a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="No budgets set"
          description="Set spending limits for your categories to stay on track."
          actionLabel="Set Budget"
          onAction={handleAdd}
        />
      )}

      {/* Budget Cards Grid */}
      {!loading && budgetStatus.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetStatus.map((budget) => (
            <BudgetCard
              key={budget.budgetId}
              budget={budget}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <BudgetForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        budget={editingBudget}
        yearMonth={yearMonth}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingBudget}
        onClose={() => setDeletingBudget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Remove Budget"
        message={
          deletingBudget
            ? `Remove the budget for "${deletingBudget.categoryName}"? This won't delete any transactions.`
            : ''
        }
        confirmLabel="Remove"
      />
    </div>
  );
};

export default BudgetsPage;
