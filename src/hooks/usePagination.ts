import { useState, useCallback, useEffect, useRef } from 'react';
import type { AxiosResponse } from 'axios';

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface PaginatedResponse<T> {
  status: boolean | string;
  data: T[];
  meta?: PaginationMeta;
}

export interface UsePaginationOptions<T, F = Record<string, any>> {
  initialPage?: number;
  initialFilters?: F;
  fetchFn: (params: F & { page: number }) => Promise<AxiosResponse<PaginatedResponse<T>>>;
  transformData?: (data: any[]) => T[];
  autoFetch?: boolean;
}

export interface UsePaginationReturn<T, F> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  loading: boolean;
  error: string | null;
  filters: F;
  setPage: (page: number) => void;
  setFilters: (filters: F | ((prev: F) => F)) => void;
  handlePageChange: (event: React.ChangeEvent<unknown>, newPage: number) => void;
  handleFilterChange: <K extends keyof F>(field: K, value: F[K]) => void;
  refresh: () => Promise<void>;
  reset: () => void;
}

export function usePagination<T, F extends Record<string, any> = Record<string, any>>(
  options: UsePaginationOptions<T, F>
): UsePaginationReturn<T, F> {
  const { 
    initialPage = 1, 
    initialFilters = {} as F,
    fetchFn,
    transformData,
    autoFetch = true
  } = options;
  
  const [data, setData] = useState<T[]>([]);
  const [page, setPageState] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<F>(initialFilters);
  
  const isFirstRender = useRef(true);
  const prevPageRef = useRef(page);
  const prevFiltersRef = useRef(filters);

  const fetchData = useCallback(async (pageNum: number = page, currentFilters: F = filters) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn({ ...currentFilters, page: pageNum });
      const responseData = res.data.data || [];
      const processedData = transformData ? transformData(responseData) : responseData;
      setData(processedData);
      
      if (res.data.meta) {
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalItems(res.data.meta.totalItems || 0);
      }
    } catch (e: any) {
      console.error('Error fetching data:', e);
      setError(e.response?.data?.message || 'Error al cargar los datos');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, transformData, page, filters]);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setFilters = useCallback((newFilters: F | ((prev: F) => F)) => {
    setFiltersState(newFilters);
    setPageState(1); // Reset to page 1 when filters change
  }, []);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  }, [setPage]);

  const handleFilterChange = useCallback(<K extends keyof F>(field: K, value: F[K]) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, [setFilters]);

  const refresh = useCallback(async () => {
    await fetchData(page, filters);
  }, [fetchData, page, filters]);

  const reset = useCallback(() => {
    setData([]);
    setPageState(initialPage);
    setTotalPages(1);
    setTotalItems(0);
    setError(null);
    setFiltersState(initialFilters);
  }, [initialPage, initialFilters]);

  // Auto-fetch on mount and when page/filters change
  useEffect(() => {
    if (!autoFetch && isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    const pageChanged = prevPageRef.current !== page;
    const filtersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters);
    
    if (isFirstRender.current || pageChanged || filtersChanged) {
      fetchData(page, filters);
      isFirstRender.current = false;
      prevPageRef.current = page;
      prevFiltersRef.current = filters;
    }
  }, [page, filters, fetchData, autoFetch]);

  return {
    data,
    page,
    totalPages,
    totalItems,
    loading,
    error,
    filters,
    setPage,
    setFilters,
    handlePageChange,
    handleFilterChange,
    refresh,
    reset
  };
}

// Legacy helper for manual usage
export function processPaginatedResponse<T>(
  response: PaginatedResponse<T>,
  setData: (data: T[]) => void,
  setMeta: (meta: PaginationMeta) => void
): T[] {
  const items = response.data || [];
  setData(items);
  
  if (response.meta) {
    setMeta(response.meta);
  } else {
    setMeta({
      currentPage: 1,
      totalPages: 1,
      totalItems: items.length
    });
  }
  
  return items;
}
