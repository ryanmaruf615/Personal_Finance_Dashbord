import { useState, useEffect, useCallback } from 'react';
import { accountApi } from '../api/accountApi';

export const useAccounts = (includeArchived = false) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await accountApi.getAll(includeArchived);
      setAccounts(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, [includeArchived]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { accounts, loading, error, refresh: fetch };
};
