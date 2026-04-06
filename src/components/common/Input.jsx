/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  FormHelperText,
  FormControl,
  InputLabel,
  OutlinedInput,
  alpha,
  styled,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Search as SearchIcon,
  Clear as ClearIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const StyledTextField = styled(TextField)(({ theme, error, success }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.text.primary,
      },
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
        borderColor: theme.palette.primary.main,
      },
    },
    ...(error && {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.error.main,
      },
    }),
    ...(success && {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.success.main,
      },
    }),
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: error ? theme.palette.error.main : theme.palette.primary.main,
    },
  },
}));

const Input = React.forwardRef(
  (
    {
      // Core props
      label,
      type = 'text',
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      disabled = false,
      readOnly = false,
      required = false,
      error,
      success,
      helperText,

      // Size and styling
      size = 'medium',
      fullWidth = true,
      multiline = false,
      rows = 4,
      maxRows,

      // Icons and adornments
      startIcon,
      endIcon,
      startAdornment,
      endAdornment,

      // Validation
      min,
      max,
      minLength,
      maxLength,
      pattern,

      // Search specific
      search = false,
      onSearch,
      onClear,

      // Password specific
      showPasswordToggle = false,

      // Formatting
      format,
      onFormat,

      // Auto complete
      autoComplete,
      autoFocus = false,

      // Character count
      showCharCount = false,
      charCountMax,

      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState(false);

    const handleTogglePassword = () => {
      setShowPassword(!showPassword);
    };

    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        const event = {
          target: { value: '' },
        };
        onChange(event);
      }
    };

    const handleChange = (e) => {
      let newValue = e.target.value;

      // Apply formatting if provided
      if (format && onFormat) {
        newValue = onFormat(newValue);
        e.target.value = newValue;
      }

      onChange(e);

      // Trigger search on change if search mode
      if (search && onSearch) {
        onSearch(newValue);
      }
    };

    const handleKeyPress = (e) => {
      if (search && e.key === 'Enter' && onSearch) {
        onSearch(value);
      }
    };

    const getInputType = () => {
      if (type === 'password' && showPassword) return 'text';
      return type;
    };

    const getEndAdornment = () => {
      const adornments = [];

      // Search clear button
      if (search && value) {
        adornments.push(
          <InputAdornment position="end" key="clear">
            <IconButton size="small" onClick={handleClear} edge="end">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        );
      }

      // Password toggle
      if (type === 'password' && showPasswordToggle) {
        adornments.push(
          <InputAdornment position="end" key="password">
            <IconButton size="small" onClick={handleTogglePassword} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        );
      }

      // Validation icons
      if (error) {
        adornments.push(
          <InputAdornment position="end" key="error">
            <ErrorIcon color="error" fontSize="small" />
          </InputAdornment>
        );
      } else if (success && value) {
        adornments.push(
          <InputAdornment position="end" key="success">
            <CheckCircleIcon color="success" fontSize="small" />
          </InputAdornment>
        );
      }

      // Custom end icon
      if (endIcon && !adornments.length) {
        adornments.push(
          <InputAdornment position="end" key="endIcon">
            {endIcon}
          </InputAdornment>
        );
      }

      // Custom end adornment
      if (endAdornment) {
        adornments.push(endAdornment);
      }

      return adornments.length ? adornments : null;
    };

    const getStartAdornment = () => {
      if (search) {
        return (
          <InputAdornment position="start">
            <SearchIcon color="action" fontSize="small" />
          </InputAdornment>
        );
      }
      if (startIcon) {
        return <InputAdornment position="start">{startIcon}</InputAdornment>;
      }
      return startAdornment;
    };

    const charCount = value?.length || 0;
    const showHelperText = helperText || (showCharCount && charCountMax);

    return (
      <FormControl fullWidth={fullWidth} error={!!error} disabled={disabled} size={size}>
        {label && (
          <InputLabel required={required} focused={focused} error={!!error}>
            {label}
          </InputLabel>
        )}

        <OutlinedInput
          ref={ref}
          type={getInputType()}
          value={value || ''}
          onChange={handleChange}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          multiline={multiline}
          rows={multiline ? rows : undefined}
          maxRows={maxRows}
          inputProps={{
            min,
            max,
            minLength,
            maxLength: showCharCount ? charCountMax : maxLength,
            pattern,
          }}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          startAdornment={getStartAdornment()}
          endAdornment={getEndAdornment()}
          label={label}
          sx={{
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? 'error.main' : 'primary.main',
            },
          }}
          {...props}
        />

        {showHelperText && (
          <FormHelperText component="div">
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{helperText}</span>
              {showCharCount && charCountMax && (
                <span>
                  {charCount} / {charCountMax}
                </span>
              )}
            </Box>
          </FormHelperText>
        )}
      </FormControl>
    );
  }
);

Input.displayName = 'Input';

// Pre-configured input types
export const SearchInput = (props) => <Input search {...props} />;

export const PasswordInput = (props) => <Input type="password" showPasswordToggle {...props} />;

export const TextArea = (props) => <Input multiline rows={4} {...props} />;

export default Input;
