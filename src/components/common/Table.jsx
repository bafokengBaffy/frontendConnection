import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Checkbox,
  IconButton,
  Tooltip,
  Typography,
  Box,
  Chip,
  Avatar,
  LinearProgress,
  alpha,
  styled,
  useTheme,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  FilterList as FilterIcon,
  ViewColumn as ViewColumnIcon,
  GetApp as ExportIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Skeleton } from '@mui/material';
import Button from './Button';
import Dropdown from './Dropdown';
import SearchBar from './SearchBar';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.background.default,
    '& .MuiTableCell-head': {
      fontWeight: 600,
      color: theme.palette.text.primary,
    },
  },
  '& .MuiTableBody-root .MuiTableRow-root': {
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      cursor: 'pointer',
    },
    '&.selected': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
      },
    },
  },
}));

const TableToolbar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Table = ({
  // Data
  columns = [],
  data = [],

  // Features
  selectable = false,
  expandable = false,
  sortable = true,
  pagination = true,
  searchable = false,
  filterable = false,
  exportable = false,

  // State
  loading = false,
  selectedRows = [],
  onSelectionChange,
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  sortColumn,
  sortDirection = 'asc',
  onSort,
  onSearch,
  onRefresh,
  onExport,
  onRowClick,

  // Custom rendering
  emptyMessage = 'No data available',
  rowActions,
  bulkActions,

  // Styling
  stickyHeader = true,
  dense = false,
  maxHeight,

  ...props
}) => {
  const theme = useTheme();
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(rowsPerPage);
  const [internalSelected, setInternalSelected] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Use external state if provided, otherwise use internal
  const currentPage = onPageChange ? page : internalPage;
  const currentRowsPerPage = onRowsPerPageChange ? rowsPerPage : internalRowsPerPage;
  const currentSelected = onSelectionChange ? selectedRows : internalSelected;

  // Filter and sort data internally if not controlled
  const processedData = React.useMemo(() => {
    let processed = [...data];

    // Apply search
    if (searchQuery && !onSearch) {
      const searchableColumns = columns.filter((col) => col.searchable).map((col) => col.field);
      processed = processed.filter((row) =>
        searchableColumns.some((col) =>
          String(row[col]).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortColumn && !onSort) {
      processed.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        }
        return bStr.localeCompare(aStr);
      });
    }

    return processed;
  }, [data, searchQuery, sortColumn, sortDirection, columns, onSearch]);

  // Paginate data internally if not controlled
  const paginatedData = React.useMemo(() => {
    if (onPageChange) return processedData;

    const start = currentPage * currentRowsPerPage;
    const end = start + currentRowsPerPage;
    return processedData.slice(start, end);
  }, [processedData, currentPage, currentRowsPerPage, onPageChange]);

  const totalRows = totalCount || processedData.length;
  const displayedData = paginatedData;

  const handleSelectAll = (event) => {
    const newSelected = event.target.checked ? displayedData.map((row) => row.id) : [];

    if (onSelectionChange) {
      onSelectionChange(newSelected);
    } else {
      setInternalSelected(newSelected);
    }
  };

  const handleSelectRow = (id) => {
    const selectedIndex = currentSelected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...currentSelected, id];
    } else {
      newSelected = currentSelected.filter((item) => item !== id);
    }

    if (onSelectionChange) {
      onSelectionChange(newSelected);
    } else {
      setInternalSelected(newSelected);
    }
  };

  const handleSort = (column) => {
    if (!sortable || !column.sortable) return;

    const isAsc = sortColumn === column.field && sortDirection === 'asc';
    const newDirection = isAsc ? 'desc' : 'asc';

    if (onSort) {
      onSort(column.field, newDirection);
    } else {
      // Internal sorting state would need to be managed here
    }
  };

  const handleChangePage = (event, newPage) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    } else {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalPage(0);
    }
  };

  const toggleRowExpanded = (id) => {
    const newExpanded = new Set(expandedRows);
    if (expandedRows.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const renderCellValue = (row, column) => {
    const value = row[column.field];

    if (column.render) {
      return column.render(value, row);
    }

    switch (column.type) {
      case 'avatar':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={value} alt={row.name} />
            <Typography>{row.name}</Typography>
          </Box>
        );

      case 'chip':
        return (
          <Chip
            label={value}
            size="small"
            color={column.getColor?.(value) || 'default'}
            variant="outlined"
          />
        );

      case 'date':
        return new Date(value).toLocaleDateString();

      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(value);

      case 'percentage':
        return `${value}%`;

      case 'boolean':
        return value ? 'Yes' : 'No';

      default:
        return value;
    }
  };

  if (loading) {
    return (
      <Paper elevation={2}>
        <LinearProgress />
        <TableContainer sx={{ maxHeight }}>
          <MuiTable stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                {selectable && <TableCell padding="checkbox" />}
                {columns.map((column) => (
                  <TableCell key={column.field} style={{ width: column.width }}>
                    {column.headerName}
                  </TableCell>
                ))}
                {rowActions && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(currentRowsPerPage)].map((_, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Skeleton variant="rectangular" width={20} height={20} />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.field}>
                      <Skeleton variant="text" />
                    </TableCell>
                  ))}
                  {rowActions && (
                    <TableCell align="right">
                      <Skeleton variant="circular" width={32} height={32} />
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
      </Paper>
    );
  }

  return (
    <Paper elevation={2}>
      {/* Toolbar */}
      {(searchable || filterable || exportable || onRefresh) && (
        <TableToolbar>
          <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
            {searchable && (
              <SearchBar
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                size="small"
                sx={{ maxWidth: 300 }}
              />
            )}

            {filterable && (
              <Button variant="outlined" size="small" startIcon={<FilterIcon />}>
                Filter
              </Button>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            {exportable && (
              <Tooltip title="Export">
                <IconButton size="small" onClick={onExport}>
                  <ExportIcon />
                </IconButton>
              </Tooltip>
            )}

            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={onRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Columns">
              <IconButton size="small">
                <ViewColumnIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </TableToolbar>
      )}

      {/* Bulk Actions */}
      {currentSelected.length > 0 && bulkActions && (
        <Box
          sx={{
            p: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="body2">{currentSelected.length} selected</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>{bulkActions}</Box>
        </Box>
      )}

      {/* Table */}
      <StyledTableContainer sx={{ maxHeight }}>
        <MuiTable stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      currentSelected.length > 0 && currentSelected.length < displayedData.length
                    }
                    checked={
                      displayedData.length > 0 && currentSelected.length === displayedData.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}

              {expandable && <TableCell padding="checkbox" />}

              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  style={{ width: column.width, minWidth: column.minWidth }}
                  sortDirection={sortColumn === column.field ? sortDirection : false}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={sortColumn === column.field}
                      direction={sortColumn === column.field ? sortDirection : 'asc'}
                      onClick={() => handleSort(column)}
                    >
                      {column.headerName}
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}

              {rowActions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {displayedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (selectable ? 1 : 0) +
                    (expandable ? 1 : 0) +
                    (rowActions ? 1 : 0)
                  }
                  align="center"
                  sx={{ py: 8 }}
                >
                  <Typography color="text.secondary">{emptyMessage}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              displayedData.map((row, index) => (
                <React.Fragment key={row.id || index}>
                  <TableRow
                    hover
                    selected={currentSelected.includes(row.id)}
                    onClick={(e) => {
                      // Don't trigger if clicking on checkbox or actions
                      if (e.target.type !== 'checkbox' && !e.target.closest('button')) {
                        onRowClick?.(row);
                      }
                    }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={currentSelected.includes(row.id)}
                          onChange={() => handleSelectRow(row.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                    )}

                    {expandable && (
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRowExpanded(row.id);
                          }}
                        >
                          {expandedRows.has(row.id) ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                        </IconButton>
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell key={column.field} align={column.align || 'left'}>
                        {renderCellValue(row, column)}
                      </TableCell>
                    ))}

                    {rowActions && (
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {rowActions(row)}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>

                  {/* Expanded row content */}
                  {expandable && expandedRows.has(row.id) && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0) + 1}
                        sx={{ py: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}
                      >
                        {row.expandedContent}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </MuiTable>
      </StyledTableContainer>

      {/* Pagination */}
      {pagination && totalRows > 0 && (
        <TablePagination
          component="div"
          count={totalRows}
          page={currentPage}
          onPageChange={handleChangePage}
          rowsPerPage={currentRowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          labelRowsPerPage="Rows per page:"
          showFirstButton
          showLastButton
        />
      )}
    </Paper>
  );
};

export default Table;
