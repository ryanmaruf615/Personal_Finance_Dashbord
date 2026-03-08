import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/authApi';
import { Button, ConfirmDialog } from '../components/shared';
import { formatDate } from '../utils/formatDate';
import toast from 'react-hot-toast';

const CURRENCIES = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CHF', label: 'CHF' },
  { value: 'PLN', label: 'PLN (zł)' },
];

const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({ firstName: '', lastName: '', preferredCurrency: 'EUR' });
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        preferredCurrency: user.preferredCurrency || 'EUR',
      });
    }
  }, [user]);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '??';

  // ─── Save Profile ─────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error('Name fields cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        preferredCurrency: form.preferredCurrency,
      });
      updateUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ─── Change Password ──────────────────────────────────────────────
  const handlePasswordChange = (e) => {
    e.preventDefault();
    const errors = {};
    if (!pwForm.current) errors.current = 'Enter current password';
    if (!pwForm.newPw) errors.newPw = 'Enter new password';
    else if (pwForm.newPw.length < 8) errors.newPw = 'Min 8 characters';
    if (pwForm.newPw !== pwForm.confirm) errors.confirm = 'Passwords do not match';
    setPwErrors(errors);
    if (Object.keys(errors).length > 0) return;

    toast('Password change coming soon!', { icon: '🚧' });
    setPwForm({ current: '', newPw: '', confirm: '' });
  };

  // ─── Delete Account ───────────────────────────────────────────────
  const handleDeleteConfirm = () => {
    setDeleteOpen(false);
    toast('Please contact support to delete your account.', { icon: '📧', duration: 5000 });
  };

  const inputClass = (hasError) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError ? 'border-red-300 bg-red-50' : 'border-gray-300'
    }`;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* ─── Card 1: Profile Info ────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Avatar + Meta */}
          <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  user?.role === 'ROLE_ADMIN'
                    ? 'bg-purple-50 text-purple-700'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {user?.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                </span>
                <span className="text-xs text-gray-400">
                  Member since {formatDate(user?.createdAt, 'MMM yyyy')}
                </span>
              </div>
            </div>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className={inputClass(false)}
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className={inputClass(false)}
                disabled={saving}
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Currency</label>
            <select
              value={form.preferredCurrency}
              onChange={(e) => setForm({ ...form, preferredCurrency: e.target.value })}
              className={inputClass(false)}
              disabled={saving}
            >
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* ─── Card 2: Change Password ────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={pwForm.current}
              onChange={(e) => { setPwForm({ ...pwForm, current: e.target.value }); setPwErrors({}); }}
              placeholder="Enter current password"
              className={inputClass(pwErrors.current)}
              disabled={pwSaving}
            />
            {pwErrors.current && <p className="mt-1 text-xs text-red-500">{pwErrors.current}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={pwForm.newPw}
              onChange={(e) => { setPwForm({ ...pwForm, newPw: e.target.value }); setPwErrors({}); }}
              placeholder="Min 8 characters"
              className={inputClass(pwErrors.newPw)}
              disabled={pwSaving}
            />
            {pwErrors.newPw && <p className="mt-1 text-xs text-red-500">{pwErrors.newPw}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={pwForm.confirm}
              onChange={(e) => { setPwForm({ ...pwForm, confirm: e.target.value }); setPwErrors({}); }}
              placeholder="Re-enter new password"
              className={inputClass(pwErrors.confirm)}
              disabled={pwSaving}
            />
            {pwErrors.confirm && <p className="mt-1 text-xs text-red-500">{pwErrors.confirm}</p>}
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" variant="secondary" loading={pwSaving}>
              Update Password
            </Button>
          </div>
        </form>
      </div>

      {/* ─── Card 3: Danger Zone ─────────────────────────────────── */}
      <div className="bg-white rounded-xl border-2 border-red-200 p-6">
        <h3 className="text-base font-semibold text-red-600 mb-2">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">
          Once you delete your account, there is no going back. All your data will be permanently removed.
        </p>
        <Button variant="danger" onClick={() => setDeleteOpen(true)}>
          Delete Account
        </Button>
      </div>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Account"
        message="Are you sure you want to delete your account? All transactions, budgets, and data will be permanently lost."
        confirmLabel="Delete My Account"
      />
    </div>
  );
};

export default ProfilePage;
