import { useState, useEffect, useCallback } from 'react';
import { transactionApi } from '../api/transactionApi';

export const useTransactions = (filters = {}, autoFetch = true) => {
  const [data, setData] = useState({
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (overrideFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await transactionApi.getAll({ ...filters, ...overrideFilters });
      setData(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    if (autoFetch) fetch();
  }, [fetch, autoFetch]);

  const changePage = (page) => fetch({ ...filters, page });

  return {
    transactions: data.content,
    page: data.page,
    totalPages: data.totalPages,
    totalElements: data.totalElements,
    size: data.size,
    isFirst: data.first,
    isLast: data.last,
    loading,
    error,
    refresh: fetch,
    changePage,
  };
};
