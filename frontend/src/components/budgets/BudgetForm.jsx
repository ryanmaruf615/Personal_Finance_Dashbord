import { useState, useEffect } from 'react';
import { Modal, Button } from '../shared';
import { useCategories } from '../../hooks/useCategories';
import { budgetApi } from '../../api/budgetApi';
import toast from 'react-hot-toast';

const BudgetForm = ({ isOpen, onClose, budget, yearMonth, onSuccess }) => {
  const isEdit = budget && budget.budgetId;
  const { categories } = useCategories();

  const [form, setForm] = useState({
    categoryId: '',
    amountLimit: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setForm({
        categoryId: budget.categoryId || '',
        amountLimit: budget.amountLimit || '',
      });
    } else {
      setForm({ categoryId: '', amountLimit: '' });
    }
    setErrors({});
  }, [isEdit, budget, isOpen]);

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => { const c = { ...p }; delete c[field]; return c; });
  };

  const validate = () => {
    const e = {};
    if (!form.categoryId) e.categoryId = 'Select a category';
    if (!form.amountLimit || parseFloat(form.amountLimit) <= 0) e.amountLimit = 'Enter a valid amount';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await budgetApi.createOrUpdate({
        categoryId: Number(form.categoryId),
        amountLimit: parseFloat(form.amountLimit),
        yearMonth: yearMonth,
      });
      toast.success(isEdit ? 'Budget updated' : 'Budget created');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Budget' : 'Set Budget'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
            className={inputClass('categoryId')}
            disabled={submitting || isEdit}
          >
            <option value="">Select category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {isEdit && <p className="mt-1 text-xs text-gray-400">Category cannot be changed. Delete and create a new one instead.</p>}
          {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        {/* Amount Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={form.amountLimit}
              onChange={(e) => update('amountLimit', e.target.value)}
              className={`${inputClass('amountLimit')} pl-7`}
              disabled={submitting}
            />
          </div>
          {errors.amountLimit && <p className="mt-1 text-xs text-red-500">{errors.amountLimit}</p>}
        </div>

        {/* Month display */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500">Budget period</p>
          <p className="text-sm font-medium text-gray-900">{yearMonth}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting} className="flex-1">
            {isEdit ? 'Update' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BudgetForm;
