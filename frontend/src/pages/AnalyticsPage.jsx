import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { getCurrentYearMonth } from '../utils/formatDate';
import MonthSelector from '../components/budgets/MonthSelector';
import MonthlyTrendChart from '../components/analytics/MonthlyTrendChart';
import CategoryPieChart from '../components/analytics/CategoryPieChart';
import DailyLineChart from '../components/analytics/DailyLineChart';
import TopCategories from '../components/analytics/TopCategories';
import MonthComparison from '../components/analytics/MonthComparison';

const AnalyticsPage = () => {
  const [yearMonth, setYearMonth] = useState(getCurrentYearMonth());
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [dailySpending, setDailySpending] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, breakdown, daily, top] = await Promise.all([
        analyticsApi.getMonthlySummary(12),
        analyticsApi.getCategoryBreakdown(yearMonth),
        analyticsApi.getDailySpending(yearMonth),
        analyticsApi.getTopCategories(yearMonth, 5),
      ]);
      setMonthlySummary(summary);
      setCategoryBreakdown(breakdown);
      setDailySpending(daily);
      setTopCategories(top);
    } catch {
      // Silently fail — individual charts show empty states
    } finally {
      setLoading(false);
    }
  }, [yearMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed insights into your spending</p>
        </div>
        <MonthSelector yearMonth={yearMonth} onChange={setYearMonth} />
      </div>

      {/* Row 1: Monthly Trend — Full Width */}
      <MonthlyTrendChart data={monthlySummary} loading={loading} />

      {/* Row 2: Pie Chart + Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={categoryBreakdown} loading={loading} />
        <TopCategories data={topCategories} loading={loading} />
      </div>

      {/* Row 3: Daily Spending — Full Width */}
      <DailyLineChart data={dailySpending} loading={loading} />

      {/* Row 4: Month Comparison */}
      <MonthComparison currentMonth={yearMonth} loading={loading} />
    </div>
  );
};

export default AnalyticsPage;
