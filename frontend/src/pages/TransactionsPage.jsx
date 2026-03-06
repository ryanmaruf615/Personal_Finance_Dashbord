import { useState, useCallback } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import TransactionFilters from '../components/transactions/TransactionFilters';
import TransactionList from '../components/transactions/TransactionList';
import { Pagination, EmptyState, ConfirmDialog } from '../components/shared';
import LoadingSpinner from '../components/LoadingSpinner';
import { transactionApi } from '../api/transactionApi';
import toast from 'react-hot-toast';

const DEFAULT_FILTERS = {
  type: '',
  categoryId: '',
  startDate: '',
  endDate: '',
  search: '',
  page: 0,
  size: 15,
  sort: 'transactionDate,desc',
};

const TransactionsPage = () => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingTx, setDeletingTx] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    transactions,
    page,
    totalPages,
    totalElements,
    size,
    loading,
    error,
    refresh,
    changePage,
  } = useTransactions(filters);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }, []);

  const handleEdit = useCallback((tx) => {
    setEditingTx(tx);
    // TODO: Open edit modal (next prompt)
    toast('Edit modal coming soon!', { icon: '🚧' });
  }, []);

  const handleDeleteClick = useCallback((tx) => {
    setDeletingTx(tx);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingTx) return;
    setDeleteLoading(true);
    try {
      await transactionApi.delete(deletingTx.id);
      toast.success('Transaction deleted');
      setDeletingTx(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteLoading(false);
    }
  }, [deletingTx, refresh]);

  const handleAddNew = useCallback(() => {
    setEditingTx({});
    // TODO: Open add modal (next prompt)
    toast('Add modal coming soon!', { icon: '🚧' });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalElements > 0
              ? `${totalElements} transaction${totalElements !== 1 ? 's' : ''} found`
              : 'Manage your transactions'}
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <TransactionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && transactions.length === 0 && (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          title="No transactions found"
          description={
            filters.search || filters.type || filters.categoryId || filters.startDate
              ? 'Try adjusting your filters to find what you are looking for.'
              : 'Get started by adding your first transaction.'
          }
          actionLabel={!filters.search && !filters.type ? 'Add Transaction' : 'Clear Filters'}
          onAction={!filters.search && !filters.type ? handleAddNew : handleClearFilters}
        />
      )}

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          size={size}
          onPageChange={handlePageChange}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Transaction"
        message={
          deletingTx
            ? `Are you sure you want to delete "${deletingTx.description || deletingTx.categoryName}"? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
      />
    </div>
  );
};

export default TransactionsPage;
