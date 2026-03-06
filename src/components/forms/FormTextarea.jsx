import React, { useState, useRef, useEffect } from 'react';
import { TextField, FormHelperText, FormControl, alpha, styled, Box, Paper } from '@mui/material';
import {
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useFormContext } from './FormValidation';

const StyledTextarea = styled(TextField)(({ theme, error, touched, success }) => ({
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
}));

const Toolbar = styled(Paper)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
}));

const ToolbarButton = styled('button')(({ theme, active }) => ({
  padding: theme.spacing(0.75, 1.5),
  border: 'none',
  borderRadius: theme.spacing(0.5),
  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  color: active ? theme.palette.primary.main : theme.palette.text.secondary,
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 500,
  transition: theme.transitions.create(['background-color', 'color']),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.text.primary,
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}));

const FormTextarea = ({
  // Core props
  name,
  label,
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

  // Textarea specific
  rows = 4,
  minRows = 3,
  maxRows = 10,
  resize = 'vertical',

  // Character limit
  maxLength,
  showCharCount = true,
  charCountWarning = 50, // Show warning when X characters left

  // Validation
  validate,
  validators = [],

  // Features
  autoResize = true,
  showToolbar = false,
  toolbarOptions = ['bold', 'italic', 'underline', 'list', 'link'],
  spellCheck = true,

  // Helper text
  helperText,
  description,

  // Custom validation messages
  customErrorMessages = {},

  // Events
  onValueChange,
  onValidation,

  ...props
}) => {
  const [localError, setLocalError] = useState('');
  const [isTouched, setIsTouched] = useState(touched || false);
  const [selectionStart, setSelectionStart] = useState(0);
  const textareaRef = useRef(null);

  // Get form context
  const formContext = useFormContext();

  // Use form context values
  const fieldValue = formContext?.values?.[name] ?? value ?? '';
  const fieldError = formContext?.errors?.[name] ?? error ?? localError;
  const fieldTouched = formContext?.touched?.[name] ?? touched ?? isTouched;

  // Auto-resize effect
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current.querySelector('textarea');
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(
          Math.max(textarea.scrollHeight, minRows * 24),
          maxRows * 24
        )}px`;
      }
    }
  }, [fieldValue, autoResize, minRows, maxRows]);

  const validateField = (val) => {
    // Required validation
    if (required && (!val || val.trim() === '')) {
      return customErrorMessages.required || `${label} is required`;
    }

    // Min length validation
    if (props.minLength && val.length < props.minLength) {
      return (
        customErrorMessages.minLength || `${label} must be at least ${props.minLength} characters`
      );
    }

    // Max length validation
    if (maxLength && val.length > maxLength) {
      return customErrorMessages.maxLength || `${label} must not exceed ${maxLength} characters`;
    }

    // Pattern validation
    if (props.pattern && !new RegExp(props.pattern).test(val)) {
      return customErrorMessages.pattern || `${label} does not match the required pattern`;
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
    const newValue = e.target.value;

    // Validate
    const validationError = validateField(newValue);
    setLocalError(validationError);

    // Update form context
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

  const handleSelect = (e) => {
    setSelectionStart(e.target.selectionStart);
  };

  const insertText = (before, after = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current.querySelector('textarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = fieldValue.substring(start, end);

    const newValue =
      fieldValue.substring(0, start) + before + selectedText + after + fieldValue.substring(end);

    handleChange({ target: { value: newValue } });

    // Restore selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleToolbarAction = (action) => {
    switch (action) {
      case 'bold':
        insertText('**', '**');
        break;
      case 'italic':
        insertText('*', '*');
        break;
      case 'underline':
        insertText('<u>', '</u>');
        break;
      case 'list':
        insertText('- ');
        break;
      case 'link':
        insertText('[', '](url)');
        break;
      default:
        break;
    }
  };

  const charCount = fieldValue?.length || 0;
  const charsLeft = maxLength ? maxLength - charCount : null;
  const showWarning = charsLeft !== null && charsLeft <= charCountWarning;

  const showSuccess = !fieldError && charCount > 0 && fieldTouched;

  return (
    <FormControl fullWidth error={!!fieldError && fieldTouched} disabled={disabled}>
      {/* Toolbar */}
      {showToolbar && (
        <Toolbar elevation={0}>
          {toolbarOptions.includes('bold') && (
            <ToolbarButton
              type="button"
              onClick={() => handleToolbarAction('bold')}
              disabled={disabled}
            >
              B
            </ToolbarButton>
          )}
          {toolbarOptions.includes('italic') && (
            <ToolbarButton
              type="button"
              onClick={() => handleToolbarAction('italic')}
              disabled={disabled}
            >
              I
            </ToolbarButton>
          )}
          {toolbarOptions.includes('underline') && (
            <ToolbarButton
              type="button"
              onClick={() => handleToolbarAction('underline')}
              disabled={disabled}
            >
              U
            </ToolbarButton>
          )}
          {toolbarOptions.includes('list') && (
            <ToolbarButton
              type="button"
              onClick={() => handleToolbarAction('list')}
              disabled={disabled}
            >
              • List
            </ToolbarButton>
          )}
          {toolbarOptions.includes('link') && (
            <ToolbarButton
              type="button"
              onClick={() => handleToolbarAction('link')}
              disabled={disabled}
            >
              🔗 Link
            </ToolbarButton>
          )}
        </Toolbar>
      )}

      <StyledTextarea
        ref={textareaRef}
        name={name}
        label={label}
        placeholder={placeholder}
        value={fieldValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onSelect={handleSelect}
        disabled={disabled}
        InputProps={{
          readOnly,
          multiline: true,
          rows: autoResize ? undefined : rows,
          minRows: autoResize ? minRows : undefined,
          maxRows: autoResize ? maxRows : undefined,
          inputProps: {
            maxLength,
            spellCheck,
            'aria-label': label,
            'aria-describedby': description ? `${name}-description` : undefined,
          },
        }}
        error={!!fieldError && fieldTouched}
        success={showSuccess ? 1 : 0}
        touched={fieldTouched ? 1 : 0}
        fullWidth
        {...props}
      />

      {/* Status Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
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
        </Box>

        {/* Character Count */}
        {showCharCount && maxLength && (
          <FormHelperText
            error={showWarning}
            sx={{
              textAlign: 'right',
              color: showWarning ? 'warning.main' : 'text.secondary',
              fontWeight: showWarning ? 500 : 400,
            }}
          >
            {charCount} / {maxLength}
            {showWarning && ` (${charsLeft} left)`}
          </FormHelperText>
        )}
      </Box>
    </FormControl>
  );
};

export default FormTextarea;
