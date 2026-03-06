import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { getCurrentYearMonth } from '../utils/formatDate';

export const useAnalytics = (yearMonth = null) => {
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [dailySpending, setDailySpending] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentMonth = yearMonth || getCurrentYearMonth();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, breakdown, daily, top] = await Promise.all([
        analyticsApi.getMonthlySummary(6),
        analyticsApi.getCategoryBreakdown(currentMonth),
        analyticsApi.getDailySpending(currentMonth),
        analyticsApi.getTopCategories(currentMonth, 5),
      ]);
      setMonthlySummary(summary);
      setCategoryBreakdown(breakdown);
      setDailySpending(daily);
      setTopCategories(top);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Calculate current month totals from summary
  const currentMonthData = monthlySummary.find((m) => m.month === currentMonth) || {
    income: 0,
    expenses: 0,
    net: 0,
  };

  return {
    monthlySummary,
    categoryBreakdown,
    dailySpending,
    topCategories,
    currentMonthData,
    loading,
    error,
    refresh: fetchAll,
  };
};
