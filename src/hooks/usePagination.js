/* eslint-disable no-undef */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useMemo } from 'react';

export const usePagination = ({
  data = [],
  itemsPerPage = 10,
  initialPage = 1,
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  totalItems,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [totalCount, setTotalCount] = useState(totalItems || data.length);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / rowsPerPage);
  }, [totalCount, rowsPerPage]);

  // Get current page data
  const currentData = useMemo(() => {
    if (data.length === 0) return [];

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, page, rowsPerPage]);

  // Get pagination range
  const pageRange = useMemo(() => {
    const range = [];
    const delta = 2; // Number of pages to show on each side of current page

    let start = Math.max(1, page - delta);
    let end = Math.min(totalPages, page + delta);

    if (page - delta <= 1) {
      end = Math.min(totalPages, 1 + delta * 2);
    }

    if (page + delta >= totalPages) {
      start = Math.max(1, totalPages - delta * 2);
    }

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    return range;
  }, [page, totalPages]);

  // Check if there are next/previous pages
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  // Check if first/last pages
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  // Go to specific page
  const goToPage = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setPage(newPage);
        onPageChange?.(newPage);
      }
    },
    [totalPages, onPageChange]
  );

  // Go to next page
  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
      onPageChange?.(page + 1);
    }
  }, [hasNextPage, onPageChange]);

  // Go to previous page
  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage((prev) => prev - 1);
      onPageChange?.(page - 1);
    }
  }, [hasPreviousPage, onPageChange]);

  // Go to first page
  const firstPage = useCallback(() => {
    if (!isFirstPage) {
      setPage(1);
      onPageChange?.(1);
    }
  }, [isFirstPage, onPageChange]);

  // Go to last page
  const lastPage = useCallback(() => {
    if (!isLastPage) {
      setPage(totalPages);
      onPageChange?.(totalPages);
    }
  }, [isLastPage, totalPages, onPageChange]);

  // Change rows per page
  const changeRowsPerPage = useCallback(
    (newRowsPerPage) => {
      setRowsPerPage(newRowsPerPage);
      setPage(1); // Reset to first page when changing items per page
      onRowsPerPageChange?.(newRowsPerPage);
    },
    [onRowsPerPageChange]
  );

  // Update total count when data changes
  useEffect(() => {
    if (!totalItems) {
      setTotalCount(data.length);
    }
  }, [data, totalItems]);

  // Get pagination info
  const paginationInfo = useMemo(() => {
    const start = (page - 1) * rowsPerPage + 1;
    const end = Math.min(page * rowsPerPage, totalCount);

    return {
      start,
      end,
      total: totalCount,
      page,
      rowsPerPage,
      totalPages,
    };
  }, [page, rowsPerPage, totalCount, totalPages]);

  // Get page numbers for rendering
  const getPageNumbers = useCallback(
    (siblingCount = 1, boundaryCount = 1) => {
      const pageNumbers = [];

      if (totalPages <= 7) {
        // Show all pages if total pages is small
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Show pages with ellipsis
        const leftBoundary = boundaryCount;
        const rightBoundary = totalPages - boundaryCount + 1;

        const leftSibling = Math.max(page - siblingCount, leftBoundary + 1);
        const rightSibling = Math.min(page + siblingCount, rightBoundary - 1);

        const showLeftEllipsis = leftSibling > leftBoundary + 1;
        const showRightEllipsis = rightSibling < rightBoundary - 1;

        // Add first pages
        for (let i = 1; i <= leftBoundary; i++) {
          pageNumbers.push(i);
        }

        // Add left ellipsis
        if (showLeftEllipsis) {
          pageNumbers.push('ellipsis');
        }

        // Add middle pages
        for (let i = leftSibling; i <= rightSibling; i++) {
          pageNumbers.push(i);
        }

        // Add right ellipsis
        if (showRightEllipsis) {
          pageNumbers.push('ellipsis');
        }

        // Add last pages
        for (let i = rightBoundary; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      }

      return pageNumbers;
    },
    [page, totalPages]
  );

  // Reset to first page when data changes significantly
  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  return {
    // Data
    currentData,
    page,
    rowsPerPage,
    totalPages,
    totalCount,

    // State
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,

    // Navigation
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,

    // Settings
    changeRowsPerPage,
    resetPagination,

    // Info
    paginationInfo,
    pageRange,
    getPageNumbers,

    // Options
    rowsPerPageOptions,
  };
};

// Hook for server-side pagination
export const useServerPagination = ({
  fetchData,
  initialPage = 1,
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50, 100],
  debounceDelay = 300,
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const debouncedFilters = useDebounce(filters, debounceDelay);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchData({
        page,
        limit: rowsPerPage,
        filters: debouncedFilters,
        sortBy,
        sortOrder,
      });

      setData(result.data || result);
      setTotalCount(result.total || result.data?.length || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchData, page, rowsPerPage, debouncedFilters, sortBy, sortOrder]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(1); // Reset to first page
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleSortChange = useCallback(
    (field) => {
      setSortOrder((prev) => {
        if (sortBy === field) {
          return prev === 'asc' ? 'desc' : 'asc';
        }
        return 'asc';
      });
      setSortBy(field);
      setPage(1); // Reset to first page when sort changes
    },
    [sortBy]
  );

  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    page,
    rowsPerPage,
    totalCount,
    totalPages: Math.ceil(totalCount / rowsPerPage),
    filters,
    sortBy,
    sortOrder,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange,
    onFilterChange: handleFilterChange,
    onSortChange: handleSortChange,
    refresh,
    rowsPerPageOptions,
  };
};

// Hook for cursor-based pagination
export const useCursorPagination = ({
  fetchData,
  initialCursor = null,
  limit = 10,
  direction = 'next', // 'next' | 'prev'
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cursors, setCursors] = useState({
    next: null,
    prev: null,
    current: initialCursor,
  });
  const [hasMore, setHasMore] = useState(true);

  const loadPage = useCallback(
    async (cursor = null, dir = direction) => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchData({
          cursor,
          limit,
          direction: dir,
        });

        if (dir === 'next') {
          setData((prev) => [...prev, ...(result.data || result)]);
        } else {
          setData(result.data || result);
        }

        setCursors({
          next: result.nextCursor,
          prev: result.prevCursor,
          current: cursor,
        });

        setHasMore(!!result.nextCursor);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [fetchData, limit, direction]
  );

  const loadNext = useCallback(() => {
    if (cursors.next && !loading) {
      loadPage(cursors.next, 'next');
    }
  }, [cursors.next, loading, loadPage]);

  const loadPrev = useCallback(() => {
    if (cursors.prev && !loading) {
      loadPage(cursors.prev, 'prev');
    }
  }, [cursors.prev, loading, loadPage]);

  const refresh = useCallback(() => {
    loadPage(null, direction);
  }, [loadPage, direction]);

  return {
    data,
    loading,
    error,
    cursors,
    hasMore,
    loadNext,
    loadPrev,
    refresh,
  };
};

export default usePagination;
