import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Divider,
  alpha,
  styled,
  useTheme,
  Badge,
  Slide,
  Grow,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  History as HistoryIcon,
  TrendingUp as TrendingIcon,
  Close as CloseIcon,
  Tune as TuneIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import Button from './Button';

const SearchContainer = styled(Paper)(({ theme, expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '2px 4px',
  borderRadius: expanded ? theme.spacing(2) : theme.spacing(4),
  transition: theme.transitions.create(['border-radius', 'box-shadow']),
  boxShadow: expanded ? theme.shadows[8] : theme.shadows[1],
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
  '&:focus-within': {
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 0),
    fontSize: '0.95rem',
  },
}));

const RecentSearchItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  margin: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.04),
  },
}));

const SearchBar = ({
  // Core props
  value = '',
  onChange,
  onSearch,
  onClear,
  placeholder = 'Search...',

  // Features
  autoFocus = false,
  disabled = false,
  fullWidth = false,
  debounceMs = 300,

  // Filters
  filters = [],
  onFilterChange,

  // Suggestions
  suggestions = [],
  onSuggestionClick,

  // Recent searches
  recentSearches = [],
  maxRecent = 5,
  saveRecent = true,

  // History
  showHistory = false,
  onHistoryClick,

  // Trending
  trending = [],

  // Styling
  size = 'medium', // 'small' | 'medium' | 'large'
  variant = 'outlined', // 'outlined' | 'filled' | 'standard'
  rounded = true,

  // Advanced
  advancedFilters,
  onAdvancedFilters,

  // Callbacks
  onSubmit,
  onFocus,
  onBlur,

  ...props
}) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (onSearch) {
      debounceTimer.current = setTimeout(() => {
        onSearch(inputValue);
      }, debounceMs);
    }

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, onSearch, debounceMs]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(e);
    setShowSuggestions(true);
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.({ target: { value: '' } });
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(inputValue);
    } else if (onSearch) {
      onSearch(inputValue);
    }

    // Save to recent searches
    if (saveRecent && inputValue.trim()) {
      // Implementation would depend on how you store recent searches
    }

    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onSuggestionClick?.(suggestion);
    setShowSuggestions(false);
  };

  const handleFilterClick = (filter) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter((f) => f !== filter)
      : [...activeFilters, filter];

    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleAdvancedFilters = (event) => {
    setAnchorEl(event.currentTarget);
    setShowFilters(true);
  };

  const getInputPadding = () => {
    switch (size) {
      case 'small':
        return '8px 12px';
      case 'large':
        return '16px 20px';
      default:
        return '12px 16px';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 'small';
      case 'large':
        return 'large';
      default:
        return 'medium';
    }
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto', position: 'relative' }}>
      <form onSubmit={handleSubmit}>
        <SearchContainer
          elevation={isFocused ? 8 : 1}
          expanded={isFocused ? 1 : 0}
          sx={{
            border: variant === 'outlined' ? `1px solid ${theme.palette.divider}` : 'none',
            bgcolor:
              variant === 'filled' ? alpha(theme.palette.common.black, 0.04) : 'background.paper',
          }}
        >
          <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" disabled={disabled}>
            <SearchIcon fontSize={getIconSize()} />
          </IconButton>

          <StyledInputBase
            inputRef={inputRef}
            sx={{ ml: 1, flex: 1, py: size === 'small' ? 0.5 : 1 }}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            onFocus={(e) => {
              setIsFocused(true);
              setShowSuggestions(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setTimeout(() => {
                setIsFocused(false);
                setShowSuggestions(false);
              }, 200);
              onBlur?.(e);
            }}
            disabled={disabled}
            autoFocus={autoFocus}
            inputProps={{ 'aria-label': 'search' }}
          />

          {inputValue && (
            <IconButton sx={{ p: '10px' }} onClick={handleClear} aria-label="clear">
              <ClearIcon fontSize={getIconSize()} />
            </IconButton>
          )}

          {filters.length > 0 && (
            <Badge
              color="primary"
              badgeContent={activeFilters.length}
              invisible={activeFilters.length === 0}
            >
              <IconButton sx={{ p: '10px' }} onClick={handleAdvancedFilters} aria-label="filters">
                <TuneIcon fontSize={getIconSize()} />
              </IconButton>
            </Badge>
          )}
        </SearchContainer>
      </form>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {activeFilters.map((filter) => {
            const filterDef = filters.find((f) => f.id === filter);
            return (
              <Chip
                key={filter}
                label={filterDef?.label || filter}
                onDelete={() => handleFilterClick(filter)}
                size="small"
                color="primary"
                variant="outlined"
              />
            );
          })}
          {activeFilters.length > 0 && (
            <Chip
              label="Clear all"
              size="small"
              onClick={() => {
                setActiveFilters([]);
                onFilterChange?.([]);
              }}
            />
          )}
        </Box>
      )}

      {/* Suggestions Popover */}
      <Grow
        in={
          showSuggestions &&
          (suggestions.length > 0 || recentSearches.length > 0 || trending.length > 0)
        }
      >
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: 1,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: theme.zIndex.modal,
            borderRadius: 2,
            boxShadow: theme.shadows[8],
          }}
        >
          {/* Recent Searches */}
          {showHistory && recentSearches.length > 0 && (
            <>
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Recent Searches
                </Typography>
              </Box>
              <List dense>
                {recentSearches.slice(0, maxRecent).map((search, index) => (
                  <RecentSearchItem
                    key={index}
                    button
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <ListItemIcon>
                      <HistoryIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText primary={search} />
                    <IconButton size="small" edge="end">
                      <ArrowForwardIcon fontSize="small" />
                    </IconButton>
                  </RecentSearchItem>
                ))}
              </List>
              <Divider />
            </>
          )}

          {/* Trending Searches */}
          {trending.length > 0 && (
            <>
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trending
                </Typography>
              </Box>
              <List dense>
                {trending.map((item, index) => (
                  <RecentSearchItem key={index} button onClick={() => handleSuggestionClick(item)}>
                    <ListItemIcon>
                      <TrendingIcon fontSize="small" color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </RecentSearchItem>
                ))}
              </List>
              <Divider />
            </>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <>
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Suggestions
                </Typography>
              </Box>
              <List dense>
                {suggestions.map((suggestion, index) => (
                  <RecentSearchItem
                    key={index}
                    button
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <ListItemText primary={suggestion} />
                  </RecentSearchItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      </Grow>

      {/* Advanced Filters Popover */}
      <Popover
        open={showFilters}
        anchorEl={anchorEl}
        onClose={() => setShowFilters(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6">Filters</Typography>
            <IconButton size="small" onClick={() => setShowFilters(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {filters.map((filter) => (
            <FormControlLabel
              key={filter.id}
              control={
                <Checkbox
                  checked={activeFilters.includes(filter.id)}
                  onChange={() => handleFilterClick(filter.id)}
                />
              }
              label={filter.label}
              sx={{ display: 'block', mb: 1 }}
            />
          ))}

          {advancedFilters && (
            <>
              <Divider sx={{ my: 2 }} />
              {advancedFilters}
            </>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button
              size="small"
              onClick={() => {
                setActiveFilters([]);
                onFilterChange?.([]);
              }}
            >
              Clear
            </Button>
            <Button size="small" variant="contained" onClick={() => setShowFilters(false)}>
              Apply
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default SearchBar;
