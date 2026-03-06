import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { CHART_COLORS } from '../../utils/chartColors';

const SkeletonPie = () => (
  <div className="animate-pulse flex flex-col sm:flex-row items-center gap-6">
    <div className="w-44 h-44 bg-gray-200 rounded-full flex-shrink-0" />
    <div className="space-y-3 flex-1 w-full">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded flex-1" />
        </div>
      ))}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-[#1E293B] text-white px-3 py-2 rounded-lg shadow-lg text-sm">
      <p className="font-medium">{d.categoryName}</p>
      <p className="text-gray-300 mt-0.5">
        {formatCurrency(d.amount)} · {d.percentage.toFixed(1)}%
      </p>
    </div>
  );
};

const SpendingChart = ({ categoryBreakdown, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-5 w-40 bg-gray-200 rounded mb-6 animate-pulse" />
        <SkeletonPie />
      </div>
    );
  }

  const data = (categoryBreakdown || []).map((item, i) => ({
    ...item,
    color: item.color || CHART_COLORS[i % CHART_COLORS.length],
  }));

  const total = data.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">Spending by Category</h3>

      {data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400">
          No expenses this month
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-48 h-48 flex-shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="amount"
                  stroke="none"
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex-1 space-y-2.5 w-full">
            {data.slice(0, 6).map((item) => (
              <div key={item.categoryId} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600 truncate">{item.categoryName}</span>
                </div>
                <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</span>
                  <span className="text-xs text-gray-400 w-10 text-right">{item.percentage.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingChart;
