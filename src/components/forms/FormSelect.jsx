import React, { useState } from 'react';
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
  FormHelperText,
  alpha,
  styled,
  Avatar,
  Divider,
  ListSubheader,
  CircularProgress,
} from '@mui/material';
import {
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useFormContext } from './FormValidation';

const StyledSelect = styled(Select)(({ theme, error, touched, success }) => ({
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
  ...(error &&
    touched && {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
      },
    }),
  ...(success &&
    touched && {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.success.main,
      },
    }),
}));

const FormSelect = ({
  // Core props
  name,
  label,
  options = [],

  // Form integration
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,

  // Selection mode
  multiple = false,
  selectAll = false,

  // Options structure
  optionLabel = 'label',
  optionValue = 'value',
  optionGroup = 'group',
  optionDisabled = 'disabled',
  optionAvatar = 'avatar',
  optionDescription = 'description',

  // Placeholder
  placeholder = 'Select...',

  // Search
  searchable = false,
  onSearch,
  searchPlaceholder = 'Search...',

  // Loading state
  loading = false,
  loadingMessage = 'Loading options...',

  // Empty state
  emptyMessage = 'No options available',

  // Creatable
  creatable = false,
  onCreateOption,
  createOptionLabel = 'Create',

  // Virtualization
  virtualized = false,
  itemHeight = 36,
  maxItems = 10,

  // Helper text
  helperText,
  description,

  // Custom validation
  validate,
  validators = [],
  customErrorMessages = {},

  // Custom renderers
  renderOption,
  renderValue,

  // Events
  onValueChange,
  onValidation,
  onOpen,
  onClose,

  // Dependencies
  dependsOn,

  // Styling
  size = 'medium',
  fullWidth = true,
  variant = 'outlined',

  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localError, setLocalError] = useState('');
  const [isTouched, setIsTouched] = useState(touched || false);

  // Get form context
  const formContext = useFormContext();

  // Use form context values
  const fieldValue = formContext?.values?.[name] ?? value ?? (multiple ? [] : '');
  const fieldError = formContext?.errors?.[name] ?? error ?? localError;
  const fieldTouched = formContext?.touched?.[name] ?? touched ?? isTouched;

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

  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options;

    return options.filter((option) => {
      const label = getOptionLabel(option).toLowerCase();
      return label.includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm]);

  const groupedOptions = React.useMemo(() => {
    if (!filteredOptions.some((opt) => opt[optionGroup])) return null;

    const groups = {};
    filteredOptions.forEach((option) => {
      const group = getOptionGroup(option) || 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(option);
    });
    return groups;
  }, [filteredOptions, optionGroup]);

  const validateField = (val) => {
    // Required validation
    if (required) {
      if (multiple && (!val || val.length === 0)) {
        return customErrorMessages.required || `${label} is required`;
      }
      if (!multiple && !val) {
        return customErrorMessages.required || `${label} is required`;
      }
    }

    // Custom validators
    for (const validator of validators) {
      const error = validator(val);
      if (error) return error;
    }

    // Custom validate function
    if (validate) {
      const error = validate(val);
      if (error) return error;
    }

    return '';
  };

  const handleChange = (event) => {
    const newValue = event.target.value;

    // Handle select all
    if (multiple && selectAll && newValue.includes('select-all')) {
      if (fieldValue.length === filteredOptions.length) {
        // Deselect all
        const newVal = [];
        setLocalError(validateField(newVal));
        formContext?.setFieldValue(name, newVal);
        onValueChange?.(newVal);
      } else {
        // Select all
        const allValues = filteredOptions.map((opt) => getOptionValue(opt));
        setLocalError(validateField(allValues));
        formContext?.setFieldValue(name, allValues);
        onValueChange?.(allValues);
      }
      return;
    }

    // Validate
    const validationError = validateField(newValue);
    setLocalError(validationError);

    // Update form context
    if (formContext) {
      formContext.setFieldValue(name, newValue);
      formContext.setFieldError(name, validationError);
    }

    // Call external handlers
    onChange?.(event);
    onValueChange?.(newValue);
    onValidation?.(validationError);
  };

  const handleBlur = () => {
    setIsTouched(true);

    if (formContext) {
      formContext.setFieldTouched(name, true);
    }

    onBlur?.();
  };

  const handleOpen = () => {
    setOpen(true);
    onOpen?.();
  };

  const handleClose = () => {
    setOpen(false);
    setSearchTerm('');
    onClose?.();
  };

  const handleClear = () => {
    const newValue = multiple ? [] : '';
    handleChange({ target: { value: newValue } });
  };

  const renderSelectedValue = (selected) => {
    if (renderValue) {
      return renderValue(selected);
    }

    if (multiple && Array.isArray(selected) && selected.length > 0) {
      const selectedOptions = options.filter((opt) => selected.includes(getOptionValue(opt)));

      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selectedOptions.map((option) => (
            <Chip
              key={getOptionValue(option)}
              label={getOptionLabel(option)}
              size="small"
              avatar={option[optionAvatar] ? <Avatar src={option[optionAvatar]} /> : undefined}
              onDelete={(e) => {
                e.stopPropagation();
                const newValue = selected.filter((v) => v !== getOptionValue(option));
                handleChange({ target: { value: newValue } });
              }}
              deleteIcon={<ClearIcon />}
            />
          ))}
        </Box>
      );
    }

    if (!multiple && selected) {
      const option = options.find((opt) => getOptionValue(opt) === selected);
      return getOptionLabel(option) || placeholder;
    }

    return <Typography color="text.secondary">{placeholder}</Typography>;
  };

  const renderMenuItem = (option) => {
    const label = getOptionLabel(option);
    const val = getOptionValue(option);
    const disabled = isOptionDisabled(option);
    const avatar = option[optionAvatar];
    const description = option[optionDescription];
    const selected = multiple ? (fieldValue || []).includes(val) : fieldValue === val;

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
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
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

        {selected && !multiple && (
          <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1 }} />
        )}
      </MenuItem>
    );
  };

  const renderOptions = () => {
    if (loading) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {loadingMessage}
          </Typography>
        </Box>
      );
    }

    if (filteredOptions.length === 0) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
          {creatable && searchTerm && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                No matches found for "{searchTerm}"
              </Typography>
              <Chip
                label={`${createOptionLabel} "${searchTerm}"`}
                onClick={() => onCreateOption?.(searchTerm)}
                color="primary"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </Box>
      );
    }

    // Add select all option for multiple selection
    if (multiple && selectAll && filteredOptions.length > 0) {
      const allSelected = filteredOptions.every((opt) => fieldValue?.includes(getOptionValue(opt)));

      return (
        <>
          <MenuItem value="select-all" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Checkbox
              checked={allSelected}
              indeterminate={!allSelected && fieldValue?.length > 0}
              size="small"
              sx={{ mr: 1 }}
            />
            <ListItemText primary="Select All" />
          </MenuItem>
          {filteredOptions.map(renderMenuItem)}
        </>
      );
    }

    // Grouped options
    if (groupedOptions) {
      return Object.entries(groupedOptions).map(([group, groupOptions]) => [
        <ListSubheader key={group} sx={{ bgcolor: 'background.paper' }}>
          {group}
        </ListSubheader>,
        ...groupOptions.map(renderMenuItem),
      ]);
    }

    // Regular options
    return filteredOptions.map(renderMenuItem);
  };

  const hasValue = multiple ? fieldValue?.length > 0 : !!fieldValue;
  const showSuccess = !fieldError && hasValue && fieldTouched;

  return (
    <FormControl
      fullWidth={fullWidth}
      error={!!fieldError && fieldTouched}
      disabled={disabled}
      size={size}
      variant={variant}
    >
      <InputLabel required={required} error={!!fieldError && fieldTouched}>
        {label}
      </InputLabel>

      <StyledSelect
        name={name}
        multiple={multiple}
        value={fieldValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onOpen={handleOpen}
        onClose={handleClose}
        open={open}
        label={label}
        input={<OutlinedInput label={label} />}
        renderValue={renderSelectedValue}
        displayEmpty
        error={!!fieldError && fieldTouched}
        touched={fieldTouched ? 1 : 0}
        success={showSuccess ? 1 : 0}
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
        startAdornment={
          hasValue && (
            <InputAdornment position="start">
              {showSuccess ? (
                <CheckCircleIcon color="success" fontSize="small" />
              ) : (
                <InfoIcon color="action" fontSize="small" />
              )}
            </InputAdornment>
          )
        }
        endAdornment={
          hasValue &&
          !disabled && (
            <InputAdornment position="end" sx={{ mr: 2 }}>
              <IconButton size="small" onClick={handleClear} edge="end">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }
        IconComponent={ExpandMoreIcon}
        {...props}
      >
        {/* Search Input */}
        {searchable && (
          <Box sx={{ p: 1, position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 1 }}>
            <OutlinedInput
              size="small"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                e.stopPropagation();
                setSearchTerm(e.target.value);
                onSearch?.(e.target.value);
              }}
              fullWidth
              onClick={(e) => e.stopPropagation()}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              }
              endAdornment={
                searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }
            />
          </Box>
        )}

        {/* Options */}
        {renderOptions()}
      </StyledSelect>

      {/* Description */}
      {description && !fieldError && (
        <FormHelperText>
          <InfoIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
          {description}
        </FormHelperText>
      )}

      {/* Error Message */}
      {fieldError && fieldTouched && (
        <FormHelperText error>
          <ErrorIcon fontSize="small" sx={{ mr: 0.5 }} />
          {fieldError}
        </FormHelperText>
      )}

      {/* Helper Text */}
      {helperText && !fieldError && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default FormSelect;
