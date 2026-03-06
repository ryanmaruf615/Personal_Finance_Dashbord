import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

const SkeletonRow = () => (
  <div className="flex items-center justify-between py-3 animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-gray-200 rounded-lg" />
      <div>
        <div className="h-4 w-28 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="h-4 w-16 bg-gray-200 rounded" />
  </div>
);

const ICON_MAP = {
  utensils: 'M3 3h18v18H3z',
  car: 'M5 17h14M5 17a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  briefcase: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2',
};

const RecentTransactions = ({ transactions, loading }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Recent Transactions</h3>
        <a href="/transactions" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          View all
        </a>
      </div>

      {loading ? (
        <div className="divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm text-gray-500">No transactions yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'INCOME' ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={tx.type === 'INCOME' ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {tx.description || tx.categoryName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {tx.categoryName} · {formatDate(tx.transactionDate, 'dd MMM')}
                  </p>
                </div>
              </div>
              <span className={`text-sm font-semibold flex-shrink-0 ml-3 ${
                tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
