import { useState, useCallback } from 'react';
import { useAccounts } from '../hooks/useAccounts';
import AccountCard from '../components/accounts/AccountCard';
import AccountForm from '../components/accounts/AccountForm';
import { EmptyState, ConfirmDialog } from '../components/shared';
import { accountApi } from '../api/accountApi';
import { formatCurrency } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const AccountsPage = () => {
  const { accounts, loading, refresh } = useAccounts();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [archivingAccount, setArchivingAccount] = useState(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  // ─── Totals ───────────────────────────────────────────────────────
  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance || 0), 0);

  // ─── Add ──────────────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    setEditingAccount(null);
    setFormOpen(true);
  }, []);

  // ─── Edit ─────────────────────────────────────────────────────────
  const handleEdit = useCallback((account) => {
    setEditingAccount(account);
    setFormOpen(true);
  }, []);

  // ─── Archive ──────────────────────────────────────────────────────
  const handleArchiveClick = useCallback((account) => {
    setArchivingAccount(account);
  }, []);

  const handleArchiveConfirm = useCallback(async () => {
    if (!archivingAccount) return;
    setArchiveLoading(true);
    try {
      await accountApi.delete(archivingAccount.id);
      toast.success(`"${archivingAccount.name}" archived`);
      setArchivingAccount(null);
      refresh();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to archive');
    } finally {
      setArchiveLoading(false);
    }
  }, [archivingAccount, refresh]);

  // ─── Form success ─────────────────────────────────────────────────
  const handleFormSuccess = useCallback(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-500 mt-1">
            {accounts.length > 0
              ? `${accounts.length} account${accounts.length !== 1 ? 's' : ''} · Total: ${formatCurrency(totalBalance)}`
              : 'Manage your financial accounts'}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Account
        </button>
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <AccountCard.Skeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && accounts.length === 0 && (
        <EmptyState
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
          title="No accounts yet"
          description="Create your first account to start tracking your finances."
          actionLabel="Add Account"
          onAction={handleAdd}
        />
      )}

      {/* Account Cards Grid */}
      {!loading && accounts.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onArchive={handleArchiveClick}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AccountForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        account={editingAccount}
        onSuccess={handleFormSuccess}
      />

      {/* Archive Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!archivingAccount}
        onClose={() => setArchivingAccount(null)}
        onConfirm={handleArchiveConfirm}
        loading={archiveLoading}
        title="Archive Account"
        message={
          archivingAccount
            ? `Are you sure you want to archive "${archivingAccount.name}"? You can still view archived accounts later.`
            : ''
        }
        confirmLabel="Archive"
      />
    </div>
  );
};

export default AccountsPage;
