import { formatCurrency } from '../../utils/formatCurrency';

const TYPE_CONFIG = {
  CHECKING: { label: 'Checking', color: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700' },
  SAVINGS: { label: 'Savings', color: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700' },
  CASH: { label: 'Cash', color: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700' },
  CREDIT_CARD: { label: 'Credit Card', color: 'bg-red-500', badge: 'bg-red-50 text-red-700' },
};

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
    <div className="h-1.5 bg-gray-200" />
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-32 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="h-8 w-28 bg-gray-200 rounded mb-1" />
      <div className="h-4 w-16 bg-gray-200 rounded" />
    </div>
  </div>
);

const AccountCard = ({ account, onEdit, onArchive }) => {
  const config = TYPE_CONFIG[account.type] || TYPE_CONFIG.CHECKING;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Colored stripe */}
      <div className={`h-1.5 ${config.color}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900 truncate">{account.name}</h3>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.badge}`}>
            {config.label}
          </span>
        </div>

        {/* Balance */}
        <p className="text-2xl font-bold text-gray-900 mb-0.5">
          {formatCurrency(account.balance, account.currency)}
        </p>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{account.currency}</p>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={() => onEdit(account)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={() => onArchive(account)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

AccountCard.Skeleton = SkeletonCard;

export default AccountCard;
