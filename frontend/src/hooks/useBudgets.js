import { useState, useEffect, useCallback } from 'react';
import { budgetApi } from '../api/budgetApi';
import { getCurrentYearMonth } from '../utils/formatDate';

export const useBudgets = (yearMonth = null) => {
  const [budgets, setBudgets] = useState([]);
  const [budgetStatus, setBudgetStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentMonth = yearMonth || getCurrentYearMonth();

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [allBudgets, status] = await Promise.all([
        budgetApi.getAll(currentMonth),
        budgetApi.getStatus(currentMonth),
      ]);
      setBudgets(allBudgets);
      setBudgetStatus(status);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const alertBudgets = budgetStatus.filter((b) => b.percentage >= 80);
  const overBudgets = budgetStatus.filter((b) => b.overBudget);

  return {
    budgets,
    budgetStatus,
    alertBudgets,
    overBudgets,
    loading,
    error,
    refresh: fetchAll,
  };
};
