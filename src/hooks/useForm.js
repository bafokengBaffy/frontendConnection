/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from 'react';

export const useForm = (initialValues = {}, validationSchema = {}, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);
  const [isValid, setIsValid] = useState(false);

  const formRef = useRef(null);
  const initialValuesRef = useRef(initialValues);

  // Validate a single field
  const validateField = useCallback(
    (name, value) => {
      if (!validationSchema[name]) return '';

      const fieldRules = validationSchema[name];
      let error = '';

      // Check if it's a function
      if (typeof fieldRules === 'function') {
        error = fieldRules(value, values);
      }
      // Check if it's a validation object
      else if (typeof fieldRules === 'object') {
        const { required, min, max, pattern, custom } = fieldRules;

        if (required && (!value || (typeof value === 'string' && !value.trim()))) {
          error = required === true ? 'This field is required' : required;
        } else if (value) {
          if (min && value.length < min) {
            error = typeof min === 'number' ? `Minimum ${min} characters` : min;
          } else if (max && value.length > max) {
            error = typeof max === 'number' ? `Maximum ${max} characters` : max;
          } else if (pattern && !pattern.regex.test(value)) {
            error = pattern.message || 'Invalid format';
          } else if (custom) {
            error = custom(value, values);
          }
        }
      }

      return error;
    },
    [validationSchema, values]
  );

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let formIsValid = true;

    Object.keys(validationSchema).forEach((fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        formIsValid = false;
      }
    });

    setErrors(newErrors);
    setIsValid(formIsValid);
    return { isValid: formIsValid, errors: newErrors };
  }, [validationSchema, values, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const fieldValue = type === 'checkbox' ? checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue,
      }));

      // Clear error when field changes
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    },
    [errors]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;

      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate field on blur
      const error = validateField(name, values[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [values, validateField]
  );

  // Set field value programmatically
  const setFieldValue = useCallback(
    (name, value) => {
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Validate after setting value
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [validateField]
  );

  // Set field error programmatically
  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  // Set field touched programmatically
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValuesRef.current);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(false);
  }, []);

  // Clear all form fields
  const clearForm = useCallback(() => {
    const emptyValues = {};
    Object.keys(values).forEach((key) => {
      emptyValues[key] = '';
    });
    setValues(emptyValues);
    setErrors({});
    setTouched({});
  }, [values]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      setSubmitCount((prev) => prev + 1);

      // Validate all fields before submission
      const { isValid, errors } = validateForm();

      if (!isValid) {
        // Mark all fields as touched to show errors
        const allTouched = {};
        Object.keys(values).forEach((key) => {
          allTouched[key] = true;
        });
        setTouched(allTouched);
        return;
      }

      setIsSubmitting(true);

      try {
        if (onSubmit) {
          await onSubmit(values, {
            setErrors,
            setSubmitting: setIsSubmitting,
            resetForm,
          });
        }
      } catch (error) {
        console.error('Form submission error:', error);

        // Handle server errors
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({
            form: error.message || 'An error occurred during submission',
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit, resetForm]
  );

  // Get field props
  const getFieldProps = useCallback(
    (name, customOnChange, customOnBlur) => ({
      name,
      value: values[name] || '',
      onChange: (e) => {
        handleChange(e);
        customOnChange?.(e);
      },
      onBlur: (e) => {
        handleBlur(e);
        customOnBlur?.(e);
      },
      error: errors[name],
      touched: touched[name],
    }),
    [values, errors, touched, handleChange, handleBlur]
  );

  // Get field state
  const getFieldState = useCallback(
    (name) => ({
      value: values[name],
      error: errors[name],
      touched: touched[name],
      isValid: !errors[name] && touched[name],
      isInvalid: !!errors[name] && touched[name],
    }),
    [values, errors, touched]
  );

  // Check if form has any errors
  const hasErrors = useCallback(() => {
    return Object.values(errors).some((error) => error);
  }, [errors]);

  // Check if form is dirty (has changes)
  const isDirty = useCallback(() => {
    return Object.keys(values).some((key) => values[key] !== initialValuesRef.current[key]);
  }, [values]);

  // Re-validate when validation schema changes
  useEffect(() => {
    validateForm();
  }, [validationSchema, validateForm]);

  // Auto-save functionality
  const useAutoSave = (delay = 1000, onSave) => {
    const timeoutRef = useRef();

    useEffect(() => {
      if (onSave && isDirty()) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          onSave(values);
        }, delay);
      }

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [values, delay, onSave, isDirty]);
  };

  return {
    // Values
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    isValid,

    // Methods
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    resetForm,
    clearForm,
    validateForm,
    validateField,
    getFieldProps,
    getFieldState,
    hasErrors,
    isDirty,
    useAutoSave,

    // Refs
    formRef,
  };
};

// Form field registration helper
export const useField = (name, form) => {
  return {
    ...form.getFieldProps(name),
    id: `field-${name}`,
    'aria-describedby': form.errors[name] ? `error-${name}` : undefined,
  };
};

// Form array field helper
export const useFieldArray = (name, form, initialValue = []) => {
  const [fields, setFields] = useState(form.values[name] || initialValue);

  useEffect(() => {
    form.setFieldValue(name, fields);
  }, [fields, form, name]);

  const push = (value) => {
    setFields((prev) => [...prev, value]);
  };

  const remove = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const insert = (index, value) => {
    setFields((prev) => [...prev.slice(0, index), value, ...prev.slice(index)]);
  };

  const swap = (indexA, indexB) => {
    setFields((prev) => {
      const newFields = [...prev];
      [newFields[indexA], newFields[indexB]] = [newFields[indexB], newFields[indexA]];
      return newFields;
    });
  };

  const move = (from, to) => {
    setFields((prev) => {
      const newFields = [...prev];
      const [removed] = newFields.splice(from, 1);
      newFields.splice(to, 0, removed);
      return newFields;
    });
  };

  const update = (index, value) => {
    setFields((prev) => {
      const newFields = [...prev];
      newFields[index] = value;
      return newFields;
    });
  };

  const replace = (index, value) => {
    setFields((prev) => {
      const newFields = [...prev];
      newFields[index] = value;
      return newFields;
    });
  };

  return {
    fields,
    push,
    remove,
    insert,
    swap,
    move,
    update,
    replace,
    length: fields.length,
    map: fields.map,
    forEach: fields.forEach,
  };
};

export default useForm;
