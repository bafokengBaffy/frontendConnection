import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
  styled,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const PageButton = styled(IconButton)(({ theme, active }) => ({
  width: 40,
  height: 40,
  borderRadius: theme.spacing(1),
  backgroundColor: active ? theme.palette.primary.main : 'transparent',
  color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.04),
  },
}));

const Pagination = ({
  // Core props
  page = 1,
  count,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,

  // Options
  showFirstButton = true,
  showLastButton = true,
  showPageSize = true,
  showPageInfo = true,
  siblingCount = 1,
  boundaryCount = 1,

  // Page size options
  rowsPerPageOptions = [5, 10, 25, 50, 100],

  // Customization
  variant = 'outlined', // 'outlined' | 'text' | 'contained'
  shape = 'rounded', // 'rounded' | 'circular'
  size = 'medium', // 'small' | 'medium' | 'large'
  disabled = false,
  hidePrevNext = false,

  // Callbacks
  onNext,
  onPrevious,
  onFirst,
  onLast,

  // Styling
  className,
  ...props
}) => {
  const theme = useTheme();

  const totalPages = Math.ceil(count / rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    onPageChange?.(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    onRowsPerPageChange?.(event.target.value);
    onPageChange?.(1); // Reset to first page
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPages = totalPages;

    // Simple pagination for small number of pages
    if (maxPages <= 7) {
      for (let i = 1; i <= maxPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    // Complex pagination with ellipsis
    const leftSiblingIndex = Math.max(page - siblingCount, 1);
    const rightSiblingIndex = Math.min(page + siblingCount, maxPages);

    const showLeftEllipsis = leftSiblingIndex > 2;
    const showRightEllipsis = rightSiblingIndex < maxPages - 2;

    if (!showLeftEllipsis && showRightEllipsis) {
      // No left ellipsis, but right ellipsis
      const leftRange = Array.from({ length: 3 }, (_, i) => i + 1);
      pageNumbers.push(...leftRange, 'ellipsis', maxPages);
    } else if (showLeftEllipsis && !showRightEllipsis) {
      // Left ellipsis, no right ellipsis
      const rightRange = Array.from({ length: 3 }, (_, i) => maxPages - 2 + i);
      pageNumbers.push(1, 'ellipsis', ...rightRange);
    } else if (showLeftEllipsis && showRightEllipsis) {
      // Both ellipsis
      pageNumbers.push(
        1,
        'ellipsis',
        ...Array.from(
          { length: leftSiblingIndex + siblingCount + 1 - leftSiblingIndex },
          (_, i) => leftSiblingIndex + i
        ),
        'ellipsis',
        maxPages
      );
    }

    return pageNumbers;
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 48;
      default:
        return 40;
    }
  };

  const renderPageButton = (pageNumber, index) => {
    if (pageNumber === 'ellipsis') {
      return (
        <IconButton
          key={`ellipsis-${index}`}
          disabled
          sx={{ width: getButtonSize(), height: getButtonSize() }}
        >
          <MoreHorizIcon />
        </IconButton>
      );
    }

    return (
      <PageButton
        key={pageNumber}
        size={size}
        onClick={() => handlePageChange(pageNumber)}
        disabled={disabled}
        active={page === pageNumber ? 1 : 0}
        sx={{
          width: getButtonSize(),
          height: getButtonSize(),
          borderRadius: shape === 'circular' ? '50%' : theme.spacing(1),
          ...(variant === 'outlined' &&
            page !== pageNumber && {
              border: `1px solid ${theme.palette.divider}`,
            }),
        }}
      >
        {pageNumber}
      </PageButton>
    );
  };

  return (
    <PaginationContainer className={className} {...props}>
      {/* Page Info */}
      {showPageInfo && (
        <Typography variant="body2" color="text.secondary">
          Showing {(page - 1) * rowsPerPage + 1} - {Math.min(page * rowsPerPage, count)} of {count}{' '}
          results
        </Typography>
      )}

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {showFirstButton && !hidePrevNext && (
          <IconButton
            size={size}
            onClick={() => {
              handlePageChange(1);
              onFirst?.();
            }}
            disabled={disabled || page === 1}
            sx={{ width: getButtonSize(), height: getButtonSize() }}
          >
            <FirstPageIcon />
          </IconButton>
        )}

        {!hidePrevNext && (
          <IconButton
            size={size}
            onClick={() => {
              handlePageChange(page - 1);
              onPrevious?.();
            }}
            disabled={disabled || page === 1}
            sx={{ width: getButtonSize(), height: getButtonSize() }}
          >
            <ChevronLeftIcon />
          </IconButton>
        )}

        {getPageNumbers().map((pageNum, index) => renderPageButton(pageNum, index))}

        {!hidePrevNext && (
          <IconButton
            size={size}
            onClick={() => {
              handlePageChange(page + 1);
              onNext?.();
            }}
            disabled={disabled || page === totalPages}
            sx={{ width: getButtonSize(), height: getButtonSize() }}
          >
            <ChevronRightIcon />
          </IconButton>
        )}

        {showLastButton && !hidePrevNext && (
          <IconButton
            size={size}
            onClick={() => {
              handlePageChange(totalPages);
              onLast?.();
            }}
            disabled={disabled || page === totalPages}
            sx={{ width: getButtonSize(), height: getButtonSize() }}
          >
            <LastPageIcon />
          </IconButton>
        )}
      </Box>

      {/* Page Size Selector */}
      {showPageSize && (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="rows-per-page-label">Rows per page</InputLabel>
          <Select
            labelId="rows-per-page-label"
            value={rowsPerPage}
            label="Rows per page"
            onChange={handleRowsPerPageChange}
            disabled={disabled}
          >
            {rowsPerPageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </PaginationContainer>
  );
};

export default Pagination;
