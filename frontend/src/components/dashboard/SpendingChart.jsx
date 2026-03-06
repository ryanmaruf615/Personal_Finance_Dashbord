import { formatCurrency } from '../../utils/formatCurrency';

const SkeletonChart = () => (
  <div className="animate-pulse">
    <div className="h-4 w-32 bg-gray-200 rounded mb-4" />
    <div className="flex items-end gap-2 h-48">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex-1 flex gap-1">
          <div className="flex-1 bg-gray-200 rounded-t" style={{ height: `${40 + Math.random() * 60}%` }} />
          <div className="flex-1 bg-gray-100 rounded-t" style={{ height: `${30 + Math.random() * 50}%` }} />
        </div>
      ))}
    </div>
  </div>
);

const SpendingChart = ({ monthlySummary, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SkeletonChart />
      </div>
    );
  }

  const data = monthlySummary || [];
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expenses)), 1);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900">Income vs Expenses</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500" />
            <span className="text-gray-500">Income</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-400" />
            <span className="text-gray-500">Expenses</span>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-gray-400">
          No data for this period
        </div>
      ) : (
        <div className="flex items-end gap-3 h-48">
          {data.map((month) => {
            const incomeH = (month.income / maxVal) * 100;
            const expenseH = (month.expenses / maxVal) * 100;
            const label = month.month.split('-')[1];
            const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            return (
              <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-1 w-full h-40">
                  <div
                    className="flex-1 bg-emerald-500 rounded-t transition-all hover:bg-emerald-600 cursor-pointer"
                    style={{ height: `${Math.max(incomeH, 2)}%` }}
                    title={`Income: ${formatCurrency(month.income)}`}
                  />
                  <div
                    className="flex-1 bg-red-400 rounded-t transition-all hover:bg-red-500 cursor-pointer"
                    style={{ height: `${Math.max(expenseH, 2)}%` }}
                    title={`Expenses: ${formatCurrency(month.expenses)}`}
                  />
                </div>
                <span className="text-xs text-gray-500">{monthNames[parseInt(label)]}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SpendingChart;
