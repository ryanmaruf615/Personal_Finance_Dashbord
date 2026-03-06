import { formatCurrency } from '../../utils/formatCurrency';

const SkeletonAlert = () => (
  <div className="animate-pulse p-3 rounded-lg bg-gray-50">
    <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
    <div className="h-2 w-full bg-gray-200 rounded mb-1" />
    <div className="h-3 w-32 bg-gray-200 rounded" />
  </div>
);

const BudgetAlerts = ({ budgetStatus, loading }) => {
  const alerts = (budgetStatus || []).filter((b) => b.percentage >= 80);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Budget Alerts</h3>
        <a href="/budgets" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Manage
        </a>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <SkeletonAlert key={i} />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">All budgets on track!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((budget) => {
            const isOver = budget.overBudget;
            const barColor = isOver ? 'bg-red-500' : 'bg-amber-500';
            const bgColor = isOver ? 'bg-red-50' : 'bg-amber-50';
            const textColor = isOver ? 'text-red-700' : 'text-amber-700';
            const badgeColor = isOver ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700';

            return (
              <div key={budget.budgetId} className={`p-3 rounded-lg ${bgColor}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${textColor}`}>
                    {budget.categoryName}
                  </span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {budget.percentage.toFixed(0)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${barColor}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs">
                  <span className={textColor}>
                    {formatCurrency(budget.amountSpent)} spent
                  </span>
                  <span className={textColor}>
                    {formatCurrency(budget.amountLimit)} limit
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetAlerts;
