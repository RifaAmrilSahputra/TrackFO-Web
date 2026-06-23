import { useState, useCallback, useEffect } from 'react';
import { handleAPIError, logError } from '../utils/errorHandler';

/**
 * Custom Hook untuk API calls
 * Mengelola loading, error, dan data state
 */
export const useAPI = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFunction(...args);
        setData(response.data);
        return response.data;
      } catch (err) {
        const errorInfo = handleAPIError(err);
        setError(errorInfo);
        logError(err, 'useAPI');
        throw errorInfo;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

/**
 * Custom Hook untuk fetch data saat mount
 * Mirip useEffect tapi untuk API calls
 */
export const useFetch = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction();
      setData(response.data);
    } catch (err) {
      const errorInfo = handleAPIError(err);
      setError(errorInfo);
      logError(err, 'useFetch');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(fetchData, [fetchData]);

  return { data, loading, error, refetch };
};

/**
 * Custom Hook untuk mutation (Create, Update, Delete)
 */
export const useMutation = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const mutate = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        setIsSuccess(false);
        const response = await apiFunction(...args);
        setData(response.data);
        setIsSuccess(true);
        return response.data;
      } catch (err) {
        const errorInfo = handleAPIError(err);
        setError(errorInfo);
        setIsSuccess(false);
        logError(err, 'useMutation');
        throw errorInfo;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setIsSuccess(false);
  }, []);

  return { data, loading, error, isSuccess, mutate, reset };
};
