import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';
import { INCOME_COLOR, EXPENSE_COLOR } from '../../utils/chartColors';

const SkeletonBars = () => (
  <div className="animate-pulse">
    <div className="flex items-end gap-3 h-52">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex-1 flex gap-1 items-end">
          <div className="flex-1 bg-gray-200 rounded-t" style={{ height: `${40 + Math.random() * 50}%` }} />
          <div className="flex-1 bg-gray-100 rounded-t" style={{ height: `${30 + Math.random() * 40}%` }} />
        </div>
      ))}
    </div>
  </div>
);

const MONTH_SHORT = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatMonth = (ym) => {
  if (!ym) return '';
  const parts = ym.split('-');
  return MONTH_SHORT[parseInt(parts[1])] || ym;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E293B] text-white px-4 py-3 rounded-lg shadow-lg text-sm">
      <p className="font-medium text-gray-300 mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mt-1">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="font-medium">{formatCurrency(entry.value)}</span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-1.5 pt-1.5 border-t border-slate-600 flex items-center gap-2">
          <span className="text-gray-400">Net:</span>
          <span className={`font-medium ${payload[0].value - payload[1].value >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(payload[0].value - payload[1].value)}
          </span>
        </div>
      )}
    </div>
  );
};

const CustomLegend = () => (
  <div className="flex items-center justify-center gap-6 mt-2">
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded" style={{ backgroundColor: INCOME_COLOR }} />
      <span className="text-xs text-gray-500">Income</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded" style={{ backgroundColor: EXPENSE_COLOR }} />
      <span className="text-xs text-gray-500">Expenses</span>
    </div>
  </div>
);

const TrendChart = ({ monthlySummary, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-5 w-44 bg-gray-200 rounded mb-6 animate-pulse" />
        <SkeletonBars />
      </div>
    );
  }

  const data = (monthlySummary || []).map((m) => ({
    ...m,
    monthLabel: formatMonth(m.month),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">Income vs Expenses</h3>

      {data.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-gray-400">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} barGap={4} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend content={<CustomLegend />} />
            <Bar
              dataKey="income"
              name="Income"
              fill={INCOME_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill={EXPENSE_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default TrendChart;
