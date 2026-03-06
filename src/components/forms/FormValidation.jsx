import React, { createContext, useContext, useState, useCallback } from 'react';

// Create form context
const FormContext = createContext(null);

// Custom hook to use form context
export const useFormContext = () => {
  const context = useContext(FormContext);
  return context;
};

// Form validation provider
export const FormProvider = ({
  children,
  initialValues = {},
  validationSchema,
  onSubmit,
  ...props
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched((prev) => ({
      ...prev,
      [name]: isTouched,
    }));
  }, []);

  const validateField = useCallback(
    (name, value) => {
      if (validationSchema && validationSchema[name]) {
        const error = validationSchema[name](value, values);
        setFieldError(name, error);
        return error;
      }
      return null;
    },
    [validationSchema, values, setFieldError]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    if (validationSchema) {
      Object.keys(validationSchema).forEach((fieldName) => {
        const error = validationSchema[fieldName](values[fieldName], values);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return { isValid, errors: newErrors };
  }, [validationSchema, values]);

  const handleSubmit = useCallback(
    async (e) => {
      if (e) {
        e.preventDefault();
      }

      setSubmitCount((prev) => prev + 1);

      const { isValid, errors } = validateForm();

      if (!isValid) {
        // Mark all fields as touched
        const allTouched = {};
        Object.keys(values).forEach((key) => {
          allTouched[key] = true;
        });
        setTouched(allTouched);
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit?.(values, { setErrors, setSubmitting: setIsSubmitting });
      } catch (error) {
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ form: error.message });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const contextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} noValidate {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

// Validation rule builder
export class ValidationRules {
  constructor(value, fieldName, allValues) {
    this.value = value;
    this.fieldName = fieldName;
    this.allValues = allValues;
    this.errors = [];
  }

  required(message = 'This field is required') {
    if (!this.value || (typeof this.value === 'string' && !this.value.trim())) {
      this.errors.push(message);
    }
    return this;
  }

  min(length, message) {
    if (this.value && this.value.length < length) {
      this.errors.push(message || `Minimum ${length} characters required`);
    }
    return this;
  }

  max(length, message) {
    if (this.value && this.value.length > length) {
      this.errors.push(message || `Maximum ${length} characters allowed`);
    }
    return this;
  }

  email(message = 'Invalid email address') {
    if (this.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.value)) {
        this.errors.push(message);
      }
    }
    return this;
  }

  url(message = 'Invalid URL') {
    if (this.value) {
      try {
        new URL(this.value);
      } catch {
        this.errors.push(message);
      }
    }
    return this;
  }

  pattern(regex, message = 'Invalid format') {
    if (this.value && !regex.test(this.value)) {
      this.errors.push(message);
    }
    return this;
  }

  matches(field, message) {
    if (this.value !== this.allValues[field]) {
      this.errors.push(message || `Does not match ${field}`);
    }
    return this;
  }

  minValue(min, message) {
    if (this.value && this.value < min) {
      this.errors.push(message || `Minimum value is ${min}`);
    }
    return this;
  }

  maxValue(max, message) {
    if (this.value && this.value > max) {
      this.errors.push(message || `Maximum value is ${max}`);
    }
    return this;
  }

  custom(validator, message) {
    if (!validator(this.value, this.allValues)) {
      this.errors.push(message);
    }
    return this;
  }

  get() {
    return this.errors[0] || null;
  }
}

// Validation schema creator
export const createValidationSchema = (rules) => {
  const schema = {};

  Object.keys(rules).forEach((fieldName) => {
    schema[fieldName] = (value, allValues) => {
      const validator = new ValidationRules(value, fieldName, allValues);
      return rules[fieldName](validator).get();
    };
  });

  return schema;
};

// Form component wrapper
export const Form = ({ children, initialValues, validationSchema, onSubmit, ...props }) => {
  return (
    <FormProvider
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
      {...props}
    >
      {children}
    </FormProvider>
  );
};

// Form field wrapper for custom components
export const FormField = ({ name, component: Component, validate, ...props }) => {
  const formContext = useFormContext();

  if (!formContext) {
    console.warn('FormField must be used within a Form component');
    return <Component name={name} {...props} />;
  }

  const { values, errors, touched, setFieldValue, setFieldTouched } = formContext;

  return (
    <Component
      name={name}
      value={values[name]}
      error={errors[name]}
      touched={touched[name]}
      onChange={(e) => {
        const value = e.target?.value !== undefined ? e.target.value : e;
        setFieldValue(name, value);
      }}
      onBlur={() => setFieldTouched(name, true)}
      validate={validate}
      {...props}
    />
  );
};

// Submit button wrapper
export const SubmitButton = ({ children, component: Component, ...props }) => {
  const formContext = useFormContext();

  if (!formContext) {
    return (
      <Component type="submit" {...props}>
        {children}
      </Component>
    );
  }

  const { isSubmitting } = formContext;

  return (
    <Component type="submit" loading={isSubmitting} disabled={isSubmitting} {...props}>
      {children}
    </Component>
  );
};

export default Form;
