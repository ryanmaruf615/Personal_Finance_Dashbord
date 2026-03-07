import { useState, useEffect } from 'react';
import { Modal, Button } from '../shared';
import { accountApi } from '../../api/accountApi';
import toast from 'react-hot-toast';

const ACCOUNT_TYPES = [
  { value: 'CHECKING', label: 'Checking' },
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
];

const CURRENCIES = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CHF', label: 'CHF' },
  { value: 'PLN', label: 'PLN (zł)' },
];

const AccountForm = ({ isOpen, onClose, account, onSuccess }) => {
  const isEdit = account && account.id;

  const [form, setForm] = useState({
    name: '',
    type: 'CHECKING',
    currency: 'EUR',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setForm({
        name: account.name || '',
        type: account.type || 'CHECKING',
        currency: account.currency || 'EUR',
      });
    } else {
      setForm({ name: '', type: 'CHECKING', currency: 'EUR' });
    }
    setErrors({});
  }, [isEdit, account, isOpen]);

  const update = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => { const c = { ...p }; delete c[field]; return c; });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Account name is required';
    else if (form.name.trim().length < 2) e.name = 'At least 2 characters';
    if (!form.type) e.type = 'Select account type';
    if (!form.currency) e.currency = 'Select currency';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        currency: form.currency,
      };

      if (isEdit) {
        await accountApi.update(account.id, payload);
        toast.success('Account updated');
      } else {
        await accountApi.create(payload);
        toast.success('Account created');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit Account' : 'Add Account'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
          <input
            type="text"
            placeholder="e.g. Main Checking"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputClass('name')}
            disabled={submitting}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
          <select
            value={form.type}
            onChange={(e) => update('type', e.target.value)}
            className={inputClass('type')}
            disabled={submitting}
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={form.currency}
            onChange={(e) => update('currency', e.target.value)}
            className={inputClass('currency')}
            disabled={submitting || isEdit}
          >
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          {isEdit && <p className="mt-1 text-xs text-gray-400">Currency cannot be changed after creation</p>}
          {errors.currency && <p className="mt-1 text-xs text-red-500">{errors.currency}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={submitting} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting} className="flex-1">
            {isEdit ? 'Update' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AccountForm;
