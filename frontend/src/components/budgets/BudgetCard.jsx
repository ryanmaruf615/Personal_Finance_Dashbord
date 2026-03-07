import { formatCurrency } from '../../utils/formatCurrency';

const SkeletonCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gray-200 rounded-lg" />
      <div>
        <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
        <div className="h-3 w-16 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="h-2.5 w-full bg-gray-200 rounded-full mb-3" />
    <div className="flex justify-between">
      <div className="h-3 w-20 bg-gray-200 rounded" />
      <div className="h-3 w-20 bg-gray-200 rounded" />
    </div>
  </div>
);

const ICON_PATHS = {
  utensils: 'M3 3h18v18H3z',
  car: 'M5 17h14v-5H5v5zm2-8h10V7H7v2z',
  home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  briefcase: 'M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2',
  film: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z',
  'heart-pulse': 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  'shopping-bag': 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  zap: 'M13 2L3 14h9l-1 10 10-12h-9l1-10z',
  'graduation-cap': 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
  plane: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8',
  gift: 'M20 12v10H4V12m16 0H4m16 0l-4-4m-8 4l4-4m-4 4V6a2 2 0 012-2h0a2 2 0 012 2v6m-4 0V6a2 2 0 00-2-2h0a2 2 0 00-2 2v6',
  'circle-dot': 'M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0m0-9a9 9 0 110 18 9 9 0 010-18z',
};

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const percentage = budget.percentage || 0;
  const isWarning = percentage >= 80 && percentage < 100;
  const isOver = percentage >= 100;

  const barColor = isOver ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500';
  const barBg = isOver ? 'bg-red-100' : isWarning ? 'bg-amber-100' : 'bg-gray-100';
  const badgeClass = isOver
    ? 'bg-red-50 text-red-700'
    : isWarning
    ? 'bg-amber-50 text-amber-700'
    : 'bg-emerald-50 text-emerald-700';

  const iconPath = ICON_PATHS[budget.categoryIcon] || ICON_PATHS['circle-dot'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOver ? 'bg-red-50' : isWarning ? 'bg-amber-50' : 'bg-blue-50'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${isOver ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{budget.categoryName}</h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeClass}`}>
              {percentage.toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className={`w-full h-2.5 ${barBg} rounded-full overflow-hidden mb-3`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Spent / Limit */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {formatCurrency(budget.amountSpent)} <span className="text-gray-400">spent</span>
        </span>
        <span className="text-gray-500">
          {formatCurrency(budget.amountLimit)} <span className="text-gray-400">limit</span>
        </span>
      </div>

      {/* Remaining */}
      <div className="mt-2 text-xs text-center">
        {isOver ? (
          <span className="text-red-600 font-medium">
            Over by {formatCurrency(Math.abs(budget.amountRemaining))}
          </span>
        ) : (
          <span className="text-gray-400">
            {formatCurrency(budget.amountRemaining)} remaining
          </span>
        )}
      </div>
    </div>
  );
};

BudgetCard.Skeleton = SkeletonCard;

export default BudgetCard;
