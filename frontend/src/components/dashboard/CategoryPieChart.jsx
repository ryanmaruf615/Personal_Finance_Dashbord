import { formatCurrency } from '../../utils/formatCurrency';
import { CHART_COLORS } from '../../utils/chartColors';

const SkeletonPie = () => (
  <div className="animate-pulse">
    <div className="h-4 w-40 bg-gray-200 rounded mb-4" />
    <div className="flex items-center gap-6">
      <div className="w-36 h-36 bg-gray-200 rounded-full" />
      <div className="space-y-3 flex-1">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-full" />
        ))}
      </div>
    </div>
  </div>
);

const CategoryPieChart = ({ categoryBreakdown, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SkeletonPie />
      </div>
    );
  }

  const data = categoryBreakdown || [];
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  // Build CSS conic gradient
  let gradientParts = [];
  let cumulative = 0;
  data.forEach((item, i) => {
    const start = cumulative;
    cumulative += item.percentage;
    gradientParts.push(`${item.color || CHART_COLORS[i]} ${start}% ${cumulative}%`);
  });
  const gradient = gradientParts.length > 0
    ? `conic-gradient(${gradientParts.join(', ')})`
    : 'conic-gradient(#e5e7eb 0% 100%)';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">Spending by Category</h3>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          No expenses this month
        </div>
      ) : (
        <div className="flex items-center gap-6">
          {/* Pie chart */}
          <div className="relative flex-shrink-0">
            <div
              className="w-36 h-36 rounded-full"
              style={{ background: gradient }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-sm font-bold text-gray-900">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-2 min-w-0">
            {data.slice(0, 5).map((item, i) => (
              <div key={item.categoryId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: item.color || CHART_COLORS[i] }}
                  />
                  <span className="text-gray-600 truncate">{item.categoryName}</span>
                </div>
                <span className="text-gray-900 font-medium ml-2 flex-shrink-0">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPieChart;
