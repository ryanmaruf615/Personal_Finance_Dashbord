import { formatCurrency } from '../../utils/formatCurrency';
import { CHART_COLORS } from '../../utils/chartColors';

const Skeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
    <div className="h-5 w-32 bg-gray-200 rounded mb-6" />
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i}>
          <div className="flex justify-between mb-1">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

const TopCategories = ({ data, loading }) => {
  if (loading) return <Skeleton />;

  const categories = data || [];
  const maxAmount = categories.length > 0 ? Math.max(...categories.map((c) => c.amount)) : 1;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">Top Categories</h3>

      {categories.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400">No data this month</div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, i) => {
            const barWidth = (cat.amount / maxAmount) * 100;
            const color = CHART_COLORS[i % CHART_COLORS.length];

            return (
              <div key={cat.categoryId}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                    <span className="text-sm font-medium text-gray-900">{cat.categoryName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(cat.amount)}</span>
                    <span className="text-xs text-gray-400 w-12 text-right">
                      {cat.transactionCount} txn{cat.transactionCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${barWidth}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopCategories;
