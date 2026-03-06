import React, { useState } from 'react';
import {
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Typography,
  Paper,
  alpha,
  styled,
} from '@mui/material';
import {
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useFormContext } from './FormValidation';

const StyledRadio = styled(Radio)(({ theme, error, touched }) => ({
  '&.Mui-checked': {
    color: error && touched ? theme.palette.error.main : theme.palette.primary.main,
  },
}));

const CardOption = styled(Paper)(({ theme, selected, error }) => ({
  padding: theme.spacing(2),
  border: `2px solid ${
    selected
      ? error
        ? theme.palette.error.main
        : theme.palette.primary.main
      : theme.palette.divider
  }`,
  borderRadius: theme.spacing(1),
  cursor: 'pointer',
  transition: theme.transitions.create(['border-color', 'box-shadow']),
  '&:hover': {
    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
    boxShadow: theme.shadows[2],
  },
}));

const FormRadio = ({
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

  // Options structure
  optionLabel = 'label',
  optionValue = 'value',
  optionDescription = 'description',
  optionDisabled = 'disabled',

  // Layout
  row = false,
  variant = 'standard', // 'standard' | 'card'

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
  const fieldValue = formContext?.values?.[name] ?? value ?? '';
  const fieldError = formContext?.errors?.[name] ?? error ?? localError;
  const fieldTouched = formContext?.touched?.[name] ?? touched ?? isTouched;

  const validateField = (val) => {
    // Required validation
    if (required && !val) {
      return customErrorMessages.required || `Please select an option`;
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

  const getOptionLabel = (option) => {
    if (typeof option === 'string') return option;
    return option[optionLabel] || '';
  };

  const getOptionValue = (option) => {
    if (typeof option === 'string') return option;
    return option[optionValue] || option;
  };

  const getOptionDescription = (option) => {
    if (typeof option === 'object') return option[optionDescription];
    return null;
  };

  const isOptionDisabled = (option) => {
    if (typeof option === 'object') return option[optionDisabled] || false;
    return false;
  };

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

      <RadioGroup
        name={name}
        value={fieldValue}
        onChange={handleChange}
        onBlur={handleBlur}
        row={row}
        sx={{ mt: 1 }}
      >
        {options.map((option) => {
          const optionVal = getOptionValue(option);
          const optionLabel = getOptionLabel(option);
          const optionDesc = getOptionDescription(option);
          const optionDisabled = isOptionDisabled(option);
          const isSelected = fieldValue === optionVal;

          if (variant === 'card') {
            return (
              <CardOption
                key={optionVal}
                selected={isSelected}
                error={!!fieldError && fieldTouched}
                onClick={() =>
                  !disabled && !optionDisabled && handleChange({ target: { value: optionVal } })
                }
                sx={{
                  mb: 1,
                  opacity: optionDisabled ? 0.5 : 1,
                  cursor: optionDisabled ? 'not-allowed' : 'pointer',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <StyledRadio
                    checked={isSelected}
                    value={optionVal}
                    disabled={disabled || optionDisabled}
                    error={!!fieldError && fieldTouched ? 1 : 0}
                    touched={fieldTouched ? 1 : 0}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2">{optionLabel}</Typography>
                    {optionDesc && (
                      <Typography variant="body2" color="text.secondary">
                        {optionDesc}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardOption>
            );
          }

          return (
            <FormControlLabel
              key={optionVal}
              value={optionVal}
              control={
                <StyledRadio
                  error={!!fieldError && fieldTouched ? 1 : 0}
                  touched={fieldTouched ? 1 : 0}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">{optionLabel}</Typography>
                  {optionDesc && (
                    <Typography variant="caption" color="text.secondary">
                      {optionDesc}
                    </Typography>
                  )}
                </Box>
              }
              disabled={disabled || optionDisabled}
            />
          );
        })}
      </RadioGroup>

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

export default FormRadio;
