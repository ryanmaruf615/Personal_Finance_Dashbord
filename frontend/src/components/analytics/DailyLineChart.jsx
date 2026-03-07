import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1E293B] text-white px-3 py-2 rounded-lg shadow-lg text-sm">
      <p className="text-gray-300">{label}</p>
      <p className="font-medium mt-0.5">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

const Skeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
    <div className="h-5 w-36 bg-gray-200 rounded mb-6" />
    <div className="h-64 bg-gray-100 rounded" />
  </div>
);

const DailyLineChart = ({ data, loading }) => {
  if (loading) return <Skeleton />;

  const chartData = (data || []).map((d) => ({
    ...d,
    label: d.date ? d.date.split('-')[2] : '',
  }));

  const avg = chartData.length > 0
    ? chartData.reduce((s, d) => s + d.amount, 0) / chartData.length
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900">Daily Spending</h3>
        {avg > 0 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
            Avg: {formatCurrency(avg)}/day
          </span>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-400">No data for this month</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              dy={8}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            {avg > 0 && (
              <ReferenceLine
                y={avg}
                stroke="#F59E0B"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{ value: 'Avg', position: 'right', fill: '#F59E0B', fontSize: 11 }}
              />
            )}
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#6366F1"
              strokeWidth={2.5}
              fill="url(#spendingGradient)"
              dot={false}
              activeDot={{ r: 5, fill: '#6366F1', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DailyLineChart;
