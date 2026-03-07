import { useState, useEffect } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { getMonthOptions } from '../../utils/formatDate';

const Skeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
    <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="h-10 bg-gray-200 rounded-lg" />
      <div className="h-10 bg-gray-200 rounded-lg" />
    </div>
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}
    </div>
  </div>
);

const ChangeIndicator = ({ value, isPositiveGood = true }) => {
  if (value === 0 || value === null || value === undefined) {
    return <span className="text-xs text-gray-400">—</span>;
  }
  const isPositive = value > 0;
  const isGood = isPositiveGood ? isPositive : !isPositive;

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isGood ? 'text-emerald-600' : 'text-red-600'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={isPositive ? 'M7 11l5-5m0 0l5 5' : 'M17 13l-5 5m0 0l-5-5'} />
      </svg>
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

const MonthComparison = ({ currentMonth, loading: parentLoading }) => {
  const monthOptions = getMonthOptions(12);
  const [month1, setMonth1] = useState(monthOptions[1]?.value || '');
  const [month2, setMonth2] = useState(monthOptions[0]?.value || '');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!month1 || !month2 || month1 === month2) { setData(null); return; }
    const fetchComparison = async () => {
      setLoading(true);
      try {
        const result = await analyticsApi.getMonthComparison(month1, month2);
        setData(result);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [month1, month2]);

  if (parentLoading) return <Skeleton />;

  const selectClass = "px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">Month Comparison</h3>

      {/* Month Selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <select value={month1} onChange={(e) => setMonth1(e.target.value)} className={selectClass}>
            {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <select value={month2} onChange={(e) => setMonth2(e.target.value)} className={selectClass}>
            {monthOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}
        </div>
      )}

      {/* No data */}
      {!loading && !data && (
        <div className="text-center py-8 text-sm text-gray-400">
          Select two different months to compare
        </div>
      )}

      {/* Comparison Stats */}
      {!loading && data && (
        <div className="space-y-3">
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Income</span>
              <ChangeIndicator value={data.incomeChangePercent} isPositiveGood={true} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">{formatCurrency(data.month1?.income || 0)}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(data.month2?.income || 0)}</span>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Expenses</span>
              <ChangeIndicator value={data.expenseChangePercent} isPositiveGood={false} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">{formatCurrency(data.month1?.expenses || 0)}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(data.month2?.expenses || 0)}</span>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Net Savings</span>
              <span className={`text-xs font-medium ${(data.netChange || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {(data.netChange || 0) >= 0 ? '+' : ''}{formatCurrency(data.netChange || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">{formatCurrency(data.month1?.net || 0)}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(data.month2?.net || 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthComparison;
