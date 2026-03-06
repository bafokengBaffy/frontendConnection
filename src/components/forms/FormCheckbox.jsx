import React, { useState } from 'react';
import {
  FormControlLabel,
  Checkbox,
  FormControl,
  FormHelperText,
  FormGroup,
  FormLabel,
  Box,
  Typography,
  alpha,
  styled,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useFormContext } from './FormValidation';

const StyledCheckbox = styled(Checkbox)(({ theme, error, touched }) => ({
  '&.Mui-checked': {
    color: error && touched ? theme.palette.error.main : theme.palette.primary.main,
  },
  '&.Mui-disabled': {
    opacity: 0.6,
  },
}));

const FormCheckbox = ({
  // Core props
  name,
  label,

  // Form integration
  checked,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,

  // Checkbox specific
  indeterminate = false,
  color = 'primary',
  size = 'medium',

  // Group support
  group = false,
  options = [],

  // Layout
  row = false,

  // Helper text
  helperText,
  description,

  // Validation
  validate,
  validators = [],
  customErrorMessages = {},

  // Events
  onValueChange,
  onValidation,

  ...props
}) => {
  const [localError, setLocalError] = useState('');
  const [isTouched, setIsTouched] = useState(touched || false);

  // Get form context
  const formContext = useFormContext();

  // Use form context values
  const fieldValue = formContext?.values?.[name] ?? checked ?? (group ? [] : false);
  const fieldError = formContext?.errors?.[name] ?? error ?? localError;
  const fieldTouched = formContext?.touched?.[name] ?? touched ?? isTouched;

  const validateField = (val) => {
    if (required) {
      if (group && (!val || val.length === 0)) {
        return customErrorMessages.required || `Please select at least one option`;
      }
      if (!group && val !== true) {
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
    const newValue = event.target.checked;

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

  const handleGroupChange = (optionValue) => (event) => {
    const newValue = event.target.checked
      ? [...(fieldValue || []), optionValue]
      : (fieldValue || []).filter((v) => v !== optionValue);

    // Validate
    const validationError = validateField(newValue);
    setLocalError(validationError);

    // Update form context
    if (formContext) {
      formContext.setFieldValue(name, newValue);
      formContext.setFieldError(name, validationError);
    }

    // Call external handlers
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

  // Single checkbox
  if (!group) {
    return (
      <FormControl error={!!fieldError && fieldTouched} disabled={disabled} required={required}>
        <FormControlLabel
          control={
            <StyledCheckbox
              name={name}
              checked={fieldValue}
              onChange={handleChange}
              onBlur={handleBlur}
              indeterminate={indeterminate}
              color={color}
              size={size}
              disabled={disabled}
              error={!!fieldError && fieldTouched ? 1 : 0}
              touched={fieldTouched ? 1 : 0}
              {...props}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">{label}</Typography>
              {description && (
                <InfoIcon
                  fontSize="small"
                  color="action"
                  sx={{ opacity: 0.7 }}
                  title={description}
                />
              )}
            </Box>
          }
        />

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
  }

  // Checkbox group
  return (
    <FormControl
      component="fieldset"
      error={!!fieldError && fieldTouched}
      disabled={disabled}
      required={required}
    >
      <FormLabel component="legend">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {label}
          {description && (
            <InfoIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} title={description} />
          )}
        </Box>
      </FormLabel>

      <FormGroup row={row}>
        {options.map((option) => {
          const optionValue = typeof option === 'string' ? option : option.value;
          const optionLabel = typeof option === 'string' ? option : option.label;
          const optionDisabled = option.disabled || false;

          return (
            <FormControlLabel
              key={optionValue}
              control={
                <Checkbox
                  checked={(fieldValue || []).includes(optionValue)}
                  onChange={handleGroupChange(optionValue)}
                  onBlur={handleBlur}
                  disabled={disabled || optionDisabled}
                  color={color}
                  size={size}
                />
              }
              label={optionLabel}
            />
          );
        })}
      </FormGroup>

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

export default FormCheckbox;
