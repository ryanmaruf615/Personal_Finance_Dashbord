import { useState, useEffect } from 'react';
import { Modal, Button } from '../shared';
import { useAccounts } from '../../hooks/useAccounts';
import { useCategories } from '../../hooks/useCategories';
import { transactionApi } from '../../api/transactionApi';
import toast from 'react-hot-toast';

const TransactionForm = ({ isOpen, onClose, transaction, onSuccess }) => {
  const isEdit = transaction && transaction.id;
  const { accounts } = useAccounts();
  const { categories } = useCategories();

  const [form, setForm] = useState({
    type: 'EXPENSE',
    amount: '',
    categoryId: '',
    accountId: '',
    transactionDate: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (isEdit) {
      setForm({
        type: transaction.type || 'EXPENSE',
        amount: transaction.amount || '',
        categoryId: transaction.categoryId || '',
        accountId: transaction.accountId || '',
        transactionDate: transaction.transactionDate || new Date().toISOString().split('T')[0],
        description: transaction.description || '',
      });
    } else {
      setForm({
        type: 'EXPENSE',
        amount: '',
        categoryId: '',
        accountId: accounts.length > 0 ? accounts[0].id : '',
        transactionDate: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
    setErrors({});
  }, [isEdit, transaction, isOpen, accounts.length]);

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => {
      const c = { ...p };
      delete c[field];
      return c;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.amount || parseFloat(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.categoryId) e.categoryId = 'Select a category';
    if (!form.accountId) e.accountId = 'Select an account';
    if (!form.transactionDate) e.transactionDate = 'Select a date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        type: form.type,
        amount: Math.abs(parseFloat(form.amount)),
        categoryId: Number(form.categoryId),
        accountId: Number(form.accountId),
        transactionDate: form.transactionDate,
        description: form.description.trim() || null,
      };

      if (isEdit) {
        await transactionApi.update(transaction.id, payload);
        toast.success('Transaction updated');
      } else {
        await transactionApi.create(payload);
        toast.success('Transaction created');
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      errors[field] ? 'border-red-300 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Transaction' : 'Add Transaction'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => update('type', 'EXPENSE')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                form.type === 'EXPENSE'
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => update('type', 'INCOME')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                form.type === 'INCOME'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Income
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => update('amount', e.target.value)}
              className={`${inputClass('amount')} pl-7`}
              disabled={submitting}
            />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
        </div>

        {/* Category & Account row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              className={inputClass('categoryId')}
              disabled={submitting}
            >
              <option value="">Select...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
            <select
              value={form.accountId}
              onChange={(e) => update('accountId', e.target.value)}
              className={inputClass('accountId')}
              disabled={submitting}
            >
              <option value="">Select...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
            {errors.accountId && <p className="mt-1 text-xs text-red-500">{errors.accountId}</p>}
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={form.transactionDate}
            onChange={(e) => update('transactionDate', e.target.value)}
            className={inputClass('transactionDate')}
            disabled={submitting}
          />
          {errors.transactionDate && <p className="mt-1 text-xs text-red-500">{errors.transactionDate}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(optional)</span></label>
          <input
            type="text"
            placeholder="e.g. Grocery shopping at Lidl"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={submitting}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            className="flex-1"
          >
            {isEdit ? 'Update' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionForm;
