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
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useFormContext } from './FormValidation';

const StyledTextField = styled(TextField)(({ theme, error, success, touched }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    backgroundColor: theme.palette.background.paper,
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
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: error && touched ? theme.palette.error.main : theme.palette.primary.main,
    },
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
}));

const FormInput = ({
  // Core props
  name,
  label,
  type = 'text',
  placeholder,

  // Form integration
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  readOnly = false,

  // Validation
  validate,
  validators = [],

  // UI variants
  variant = 'outlined',
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

  // Password specific
  showPasswordToggle = true,

  // Formatting
  format,
  parse,

  // Auto complete
  autoComplete,
  autoFocus = false,

  // Character count
  showCharCount = false,
  maxLength,

  // Helper text
  helperText,
  description,

  // Custom validation message
  customErrorMessages = {},

  // Field masking
  mask,
  maskChar = '_',

  // Dependencies
  dependsOn,

  // Events
  onValueChange,
  onValidation,

  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [isTouched, setIsTouched] = useState(touched || false);

  // Get form context if available
  const formContext = useFormContext();

  // Use form context values if provided
  const fieldValue = formContext?.values?.[name] ?? value ?? '';
  const fieldError = formContext?.errors?.[name] ?? error ?? localError;
  const fieldTouched = formContext?.touched?.[name] ?? touched ?? isTouched;

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validateField = (val) => {
    // Required validation
    if (required && (!val || val.toString().trim() === '')) {
      return customErrorMessages.required || `${label} is required`;
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

  const handleChange = (e) => {
    let newValue = e.target.value;

    // Apply parsing if provided
    if (parse) {
      newValue = parse(newValue);
    }

    // Apply masking if provided
    if (mask) {
      newValue = applyMask(newValue);
    }

    // Validate
    const validationError = validateField(newValue);
    setLocalError(validationError);

    // Update form context if available
    if (formContext) {
      formContext.setFieldValue(name, newValue);
      formContext.setFieldError(name, validationError);
    }

    // Call external handlers
    onChange?.(e);
    onValueChange?.(newValue);
    onValidation?.(validationError);
  };

  const handleBlur = (e) => {
    setIsTouched(true);

    if (formContext) {
      formContext.setFieldTouched(name, true);
    }

    onBlur?.(e);
  };

  const applyMask = (value) => {
    if (!mask) return value;

    let result = '';
    let valueIndex = 0;

    for (let i = 0; i < mask.length; i++) {
      if (valueIndex >= value.length) break;

      if (mask[i] === '9') {
        // Digit
        if (/\d/.test(value[valueIndex])) {
          result += value[valueIndex];
          valueIndex++;
        } else {
          result += maskChar;
          valueIndex++;
        }
      } else if (mask[i] === 'A') {
        // Letter
        if (/[a-zA-Z]/.test(value[valueIndex])) {
          result += value[valueIndex];
          valueIndex++;
        } else {
          result += maskChar;
          valueIndex++;
        }
      } else if (mask[i] === '*') {
        // Any character
        result += value[valueIndex];
        valueIndex++;
      } else {
        // Static character
        result += mask[i];
      }
    }

    return result;
  };

  const getInputType = () => {
    if (type === 'password' && showPassword) return 'text';
    return type;
  };

  const getEndAdornment = () => {
    const adornments = [];

    // Password toggle
    if (type === 'password' && showPasswordToggle) {
      adornments.push(
        <InputAdornment position="end" key="password">
          <IconButton size="small" onClick={handleTogglePassword} edge="end" tabIndex="-1">
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      );
    }

    // Validation icons
    if (fieldError && fieldTouched) {
      adornments.push(
        <InputAdornment position="end" key="error">
          <ErrorIcon color="error" fontSize="small" />
        </InputAdornment>
      );
    } else if (!fieldError && fieldValue && fieldTouched) {
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
    if (startIcon) {
      return <InputAdornment position="start">{startIcon}</InputAdornment>;
    }
    return startAdornment;
  };

  const charCount = fieldValue?.length || 0;
  const showHelperText =
    helperText || description || (showCharCount && maxLength) || (fieldError && fieldTouched);

  return (
    <FormControl
      fullWidth={fullWidth}
      error={!!fieldError && fieldTouched}
      disabled={disabled}
      size={size}
      variant={variant}
    >
      {variant === 'outlined' && label && (
        <InputLabel required={required} error={!!fieldError && fieldTouched}>
          {label}
        </InputLabel>
      )}

      <OutlinedInput
        name={name}
        type={getInputType()}
        value={fieldValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        multiline={multiline}
        rows={multiline ? rows : undefined}
        maxRows={maxRows}
        inputProps={{
          maxLength: showCharCount ? maxLength : undefined,
          'aria-label': label,
          'aria-describedby': description ? `${name}-description` : undefined,
        }}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        startAdornment={getStartAdornment()}
        endAdornment={getEndAdornment()}
        label={variant === 'outlined' ? label : undefined}
        {...props}
      />

      {/* Description */}
      {description && !fieldError && (
        <FormHelperText id={`${name}-description`}>
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

      {/* Character Count */}
      {showCharCount && maxLength && (
        <FormHelperText sx={{ textAlign: 'right' }}>
          {charCount} / {maxLength}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default FormInput;
