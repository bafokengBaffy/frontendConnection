import React, { useState, useRef, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  FormHelperText,
  FormControl,
  alpha,
  styled,
  Box,
  Paper,
  ClickAwayListener,
  Popper,
  Button,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Clear as ClearIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { useFormContext } from './FormValidation';
import {
  format,
  parse,
  isValid,
  isWithinInterval,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
} from 'date-fns';

const StyledTextField = styled(TextField)(({ theme, error, touched, success }) => ({
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

const CalendarContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  width: 320,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[8],
  zIndex: theme.zIndex.modal,
}));

const CalendarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
}));

const WeekDays = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(0.5),
  marginBottom: theme.spacing(1),
  '& > div': {
    textAlign: 'center',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
}));

const DaysGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: theme.spacing(0.5),
}));

const DayButton = styled(Button)(({ theme, selected, currentMonth, disabled }) => ({
  minWidth: 36,
  height: 36,
  padding: 0,
  borderRadius: '50%',
  fontWeight: selected ? 600 : 400,
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: selected
    ? theme.palette.primary.contrastText
    : currentMonth
      ? theme.palette.text.primary
      : theme.palette.text.disabled,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : alpha(theme.palette.primary.main, 0.1),
  },
  '&.today': {
    border: `2px solid ${theme.palette.primary.main}`,
  },
  '&.disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
}));

const FormDatePicker = ({
  // Core props
  name,
  label,
  placeholder = 'Select date',

  // Form integration
  value,
  onChange,
  onBlur,
  error,
  touched,
  required = false,
  disabled = false,
  readOnly = false,

  // Date constraints
  minDate,
  maxDate,
  disablePast = false,
  disableFuture = false,
  disabledDates = [],

  // Format
  format = 'MM/dd/yyyy',
  displayFormat = 'MMM dd, yyyy',
  parseFormat = 'MM/dd/yyyy',

  // Features
  showTodayButton = true,
  clearable = true,
  closeOnSelect = true,

  // Validation
  validate,
  validators = [],
  customErrorMessages = {},

  // Helper text
  helperText,
  description,

  // Events
  onValueChange,
  onValidation,
  onOpen,
  onClose,

  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [localError, setLocalError] = useState('');
  const [isTouched, setIsTouched] = useState(touched || false);
  const [inputValue, setInputValue] = useState('');

  const anchorRef = useRef(null);
  const popperRef = useRef(null);

  // Get form context
  const formContext = useFormContext();

  // Use form context values
  const fieldValue = formContext?.values?.[name] ?? value ?? null;
  const fieldError = formContext?.errors?.[name] ?? error ?? localError;
  const fieldTouched = formContext?.touched?.[name] ?? touched ?? isTouched;

  // Update input value when field value changes
  useEffect(() => {
    if (fieldValue && isValid(new Date(fieldValue))) {
      setInputValue(format(new Date(fieldValue), format));
    } else {
      setInputValue('');
    }
  }, [fieldValue, format]);

  const validateField = (date) => {
    // Required validation
    if (required && !date) {
      return customErrorMessages.required || `${label} is required`;
    }

    // Invalid date
    if (date && !isValid(date)) {
      return customErrorMessages.invalid || 'Invalid date';
    }

    // Min date
    if (minDate && date && date < new Date(minDate)) {
      return (
        customErrorMessages.minDate ||
        `Date must be after ${format(new Date(minDate), displayFormat)}`
      );
    }

    // Max date
    if (maxDate && date && date > new Date(maxDate)) {
      return (
        customErrorMessages.maxDate ||
        `Date must be before ${format(new Date(maxDate), displayFormat)}`
      );
    }

    // Disable past
    if (disablePast && date && date < new Date()) {
      return customErrorMessages.past || 'Past dates are not allowed';
    }

    // Disable future
    if (disableFuture && date && date > new Date()) {
      return customErrorMessages.future || 'Future dates are not allowed';
    }

    // Disabled dates
    if (date && disabledDates.some((d) => isSameDay(new Date(d), date))) {
      return customErrorMessages.disabled || 'This date is not available';
    }

    // Custom validators
    for (const validator of validators) {
      const error = validator(date);
      if (error) return error;
    }

    // Custom validate function
    if (validate) {
      const error = validate(date);
      if (error) return error;
    }

    return '';
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);

    // Try to parse the input
    try {
      const parsedDate = parse(e.target.value, parseFormat, new Date());
      if (isValid(parsedDate)) {
        handleDateSelect(parsedDate);
      } else {
        // Clear validation if invalid
        setLocalError('');
        formContext?.setFieldError(name, '');
      }
    } catch (err) {
      // Ignore parse errors
    }
  };

  const handleDateSelect = (date) => {
    if (!date || !isValid(date)) return;

    // Check constraints
    const validationError = validateField(date);
    setLocalError(validationError);

    // Update form context
    if (formContext) {
      formContext.setFieldValue(name, date.toISOString());
      formContext.setFieldError(name, validationError);
    }

    // Call external handlers
    onValueChange?.(date);
    onValidation?.(validationError);

    // Close calendar
    if (closeOnSelect) {
      setOpen(false);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);

    if (formContext) {
      formContext.setFieldTouched(name, true);
    }

    onBlur?.();
  };

  const handleClear = () => {
    setInputValue('');
    handleDateSelect(null);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    handleDateSelect(today);
  };

  const isDateDisabled = (date) => {
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    if (disablePast && date < new Date()) return true;
    if (disableFuture && date > new Date()) return true;
    if (disabledDates.some((d) => isSameDay(new Date(d), date))) return true;
    return false;
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Add empty cells for days of the week before the first day
    const firstDayOfMonth = getDay(start);
    const emptyDays = Array(firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1).fill(null);

    return [...emptyDays, ...days];
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleOpen = () => {
    if (!disabled && !readOnly) {
      setOpen(true);
      onOpen?.();
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  const showSuccess = !fieldError && fieldValue && fieldTouched;

  return (
    <FormControl fullWidth error={!!fieldError && fieldTouched} disabled={disabled}>
      <StyledTextField
        ref={anchorRef}
        name={name}
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onClick={handleOpen}
        disabled={disabled}
        error={!!fieldError && fieldTouched}
        success={showSuccess ? 1 : 0}
        touched={fieldTouched ? 1 : 0}
        InputProps={{
          readOnly,
          startAdornment: (
            <InputAdornment position="start">
              <CalendarIcon color={fieldError && fieldTouched ? 'error' : 'action'} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {fieldValue && clearable && !disabled && (
                <IconButton size="small" onClick={handleClear} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              )}
            </InputAdornment>
          ),
        }}
        {...props}
      />

      {/* Calendar Popper */}
      <Popper
        ref={popperRef}
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
          {
            name: 'preventOverflow',
            options: {
              boundary: 'viewport',
            },
          },
        ]}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <CalendarContainer elevation={8}>
            {/* Header */}
            <CalendarHeader>
              <IconButton onClick={handlePreviousMonth} size="small">
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={600}>
                {format(currentMonth, 'MMMM yyyy')}
              </Typography>
              <IconButton onClick={handleNextMonth} size="small">
                <ChevronRightIcon />
              </IconButton>
            </CalendarHeader>

            {/* Week Days */}
            <WeekDays>
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </WeekDays>

            {/* Days Grid */}
            <DaysGrid>
              {getDaysInMonth().map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} />;
                }

                const isSelected = fieldValue && isSameDay(date, new Date(fieldValue));
                const isToday = isSameDay(date, new Date());
                const disabled = isDateDisabled(date);
                const currentMonth = date.getMonth() === currentMonth.getMonth();

                return (
                  <DayButton
                    key={date.toISOString()}
                    selected={isSelected}
                    currentMonth={currentMonth}
                    disabled={disabled}
                    className={`${isToday ? 'today' : ''} ${disabled ? 'disabled' : ''}`}
                    onClick={() => !disabled && handleDateSelect(date)}
                  >
                    {format(date, 'd')}
                  </DayButton>
                );
              })}
            </DaysGrid>

            {/* Footer */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              {showTodayButton && (
                <Button size="small" startIcon={<TodayIcon />} onClick={handleToday}>
                  Today
                </Button>
              )}
              <Button size="small" onClick={handleClose}>
                Close
              </Button>
            </Box>
          </CalendarContainer>
        </ClickAwayListener>
      </Popper>

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

export default FormDatePicker;
