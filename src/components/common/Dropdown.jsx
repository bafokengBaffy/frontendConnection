import React, { useState, useEffect, useRef } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Typography,
  Checkbox,
  ListItemText,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Divider,
  Button,
  TextField,
  alpha,
  styled,
  useTheme,
  FormHelperText,
  Avatar,
  ListItemIcon,
  ListSubheader,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { FixedSizeList as VirtualList } from 'react-window';

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.divider,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.text.primary,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderWidth: 2,
    borderColor: theme.palette.primary.main,
  },
}));

const Dropdown = ({
  // Core props
  options = [],
  value,
  onChange,
  label,
  placeholder = 'Select...',

  // Variants
  multiple = false,
  searchable = false,
  creatable = false,
  virtualized = false,

  // Options structure
  optionLabel = 'label',
  optionValue = 'value',
  optionGroup = 'group',
  optionDisabled = 'disabled',
  optionAvatar = 'avatar',
  optionDescription = 'description',

  // State
  loading = false,
  disabled = false,
  error = false,
  helperText,
  required = false,

  // Search
  onSearch,
  searchPlaceholder = 'Search...',
  noOptionsMessage = 'No options',
  loadingMessage = 'Loading...',

  // Creatable
  onCreateOption,
  createOptionLabel = 'Create',

  // Virtualization
  itemHeight = 36,
  maxItems = 10,

  // Styling
  size = 'medium',
  fullWidth = true,
  variant = 'outlined',
  renderOption,

  // Callbacks
  onOpen,
  onClose,

  ...props
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchTerm) {
      const filtered = options.filter((option) => {
        const label = getOptionLabel(option).toLowerCase();
        return label.includes(searchTerm.toLowerCase());
      });
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);

  const getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    return option[optionLabel] || '';
  };

  const getOptionValue = (option) => {
    if (typeof option === 'string') return option;
    return option[optionValue] || option;
  };

  const getOptionGroup = (option) => {
    return option[optionGroup];
  };

  const isOptionDisabled = (option) => {
    return option[optionDisabled] || false;
  };

  const handleOpen = () => {
    setOpen(true);
    onOpen?.();
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  const handleClose = () => {
    setOpen(false);
    setSearchTerm('');
    onClose?.();
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    onChange?.(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    onSearch?.(event.target.value);
  };

  const handleClear = () => {
    onChange?.(multiple ? [] : '');
  };

  const handleCreateOption = () => {
    if (searchTerm && onCreateOption) {
      onCreateOption(searchTerm);
      setSearchTerm('');
    }
  };

  const renderValue = (selected) => {
    if (multiple && Array.isArray(selected) && selected.length > 0) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selected.map((value) => {
            const option = options.find((opt) => getOptionValue(opt) === value);
            return (
              <Chip
                key={value}
                label={getOptionLabel(option)}
                size="small"
                onDelete={(e) => {
                  e.stopPropagation();
                  const newValue = selected.filter((v) => v !== value);
                  onChange?.(newValue);
                }}
                deleteIcon={<CloseIcon />}
              />
            );
          })}
        </Box>
      );
    }

    if (!multiple && selected) {
      const option = options.find((opt) => getOptionValue(opt) === selected);
      return getOptionLabel(option) || placeholder;
    }

    return <Typography color="text.secondary">{placeholder}</Typography>;
  };

  const renderMenuItem = (option, index) => {
    const label = getOptionLabel(option);
    const val = getOptionValue(option);
    const disabled = isOptionDisabled(option);
    const avatar = option[optionAvatar];
    const description = option[optionDescription];
    const selected = multiple ? (value || []).includes(val) : value === val;

    if (renderOption) {
      return renderOption(option, { selected, disabled });
    }

    return (
      <MenuItem
        key={val}
        value={val}
        disabled={disabled}
        sx={{
          minHeight: description ? 56 : 48,
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }}
      >
        {multiple && <Checkbox checked={selected} size="small" sx={{ mr: 1 }} />}

        {avatar && <Avatar src={avatar} sx={{ width: 24, height: 24, mr: 1.5 }} />}

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2">{label}</Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>

        {selected && !multiple && <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />}
      </MenuItem>
    );
  };

  const renderGroupedOptions = () => {
    const groups = {};
    filteredOptions.forEach((option) => {
      const group = getOptionGroup(option) || 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(option);
    });

    return Object.entries(groups).map(([group, groupOptions]) => [
      <ListSubheader key={group} sx={{ bgcolor: 'background.paper' }}>
        {group}
      </ListSubheader>,
      ...groupOptions.map((option, index) => renderMenuItem(option, index)),
    ]);
  };

  const renderVirtualizedOptions = () => {
    const Row = ({ index, style }) => {
      const option = filteredOptions[index];
      return <div style={style}>{renderMenuItem(option, index)}</div>;
    };

    return (
      <VirtualList
        height={Math.min(filteredOptions.length, maxItems) * itemHeight}
        itemCount={filteredOptions.length}
        itemSize={itemHeight}
        width="100%"
      >
        {Row}
      </VirtualList>
    );
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      disabled={disabled}
      required={required}
      size={size}
    >
      {label && <InputLabel>{label}</InputLabel>}

      <StyledSelect
        multiple={multiple}
        value={value || (multiple ? [] : '')}
        onChange={handleChange}
        onOpen={handleOpen}
        onClose={handleClose}
        open={open}
        label={label}
        input={<OutlinedInput label={label} />}
        renderValue={renderValue}
        displayEmpty
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 400,
              mt: 1,
              '& .MuiList-root': {
                py: 1,
              },
            },
          },
          anchorOrigin: {
            vertical: 'bottom',
            horizontal: 'left',
          },
          transformOrigin: {
            vertical: 'top',
            horizontal: 'left',
          },
        }}
        endAdornment={
          value && value.length > 0 ? (
            <InputAdornment position="end" sx={{ mr: 2 }}>
              <IconButton size="small" onClick={handleClear} edge="end">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }
        IconComponent={ExpandMoreIcon}
        {...props}
      >
        {/* Search Input */}
        {searchable && (
          <Box sx={{ p: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <TextField
              inputRef={searchInputRef}
              size="small"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              onClick={(e) => e.stopPropagation()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress size={32} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {loadingMessage}
            </Typography>
          </Box>
        )}

        {/* No Options */}
        {!loading && filteredOptions.length === 0 && (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {noOptionsMessage}
            </Typography>
            {creatable && searchTerm && (
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={handleCreateOption}
                sx={{ mt: 1 }}
              >
                {createOptionLabel} "{searchTerm}"
              </Button>
            )}
          </Box>
        )}

        {/* Options */}
        {!loading && filteredOptions.length > 0 && (
          <>
            {virtualized ? (
              renderVirtualizedOptions()
            ) : (
              <>
                {filteredOptions.some((opt) => opt[optionGroup])
                  ? renderGroupedOptions()
                  : filteredOptions.map((option, index) => renderMenuItem(option, index))}
              </>
            )}
          </>
        )}

        {/* Create Option */}
        {creatable &&
          searchTerm &&
          !filteredOptions.some(
            (opt) => getOptionLabel(opt).toLowerCase() === searchTerm.toLowerCase()
          ) && (
            <>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleCreateOption}>
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary={`${createOptionLabel} "${searchTerm}"`} />
              </MenuItem>
            </>
          )}
      </StyledSelect>

      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default Dropdown;
