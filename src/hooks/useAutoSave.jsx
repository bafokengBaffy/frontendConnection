// src/hooks/useAutoSave.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for auto-saving profile data with debouncing
 */
export const useAutoSave = (initialData, options = {}) => {
  const {
    debounceTime = 2000,
    onSaveSuccess = () => {},
    onSaveError = () => {},
    saveThreshold = 3, // Minimum changes before auto-save
  } = options;

  const [data, setData] = useState(initialData);
  const [originalData, setOriginalData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveCount, setSaveCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success', 'error'

  const timerRef = useRef(null);
  const changesCountRef = useRef(0);
  const previousDataRef = useRef(initialData);

  // Check if data has meaningful changes
  const hasMeaningfulChanges = useCallback((newData, oldData) => {
    if (!newData || !oldData) return false;

    const ignoreFields = ['updatedAt', 'createdAt', 'profileCompletion'];

    for (let key in newData) {
      if (ignoreFields.includes(key)) continue;

      if (Array.isArray(newData[key])) {
        if (JSON.stringify(newData[key]) !== JSON.stringify(oldData[key])) {
          return true;
        }
      } else if (newData[key] !== oldData[key]) {
        return true;
      }
    }

    return false;
  }, []);

  // Save function
  const save = useCallback(
    async (force = false) => {
      if (!data || Object.keys(data).length === 0) {
        console.log('⏭️ No data to save');
        return;
      }

      if (!hasMeaningfulChanges(data, previousDataRef.current) && !force) {
        console.log('⏭️ No meaningful changes, skipping save');
        return;
      }

      // Don't auto-save if too few changes
      if (changesCountRef.current < saveThreshold && !force) {
        console.log(`⏭️ Only ${changesCountRef.current} changes, waiting for ${saveThreshold}`);
        return;
      }

      setIsSaving(true);
      setSaveStatus('saving');

      try {
        // Simulate save operation - in real app, call your save API here
        await new Promise((resolve) => setTimeout(resolve, 500));

        setLastSaved(new Date());
        setSaveCount((prev) => prev + 1);
        setHasUnsavedChanges(false);
        setSaveStatus('success');
        setOriginalData(data);
        previousDataRef.current = data;
        changesCountRef.current = 0;

        onSaveSuccess({ success: true, data });

        // Reset success status after 3 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      } catch (error) {
        console.error('❌ Auto-save error:', error);
        setSaveStatus('error');
        onSaveError(error);

        // Reset error status after 5 seconds
        setTimeout(() => {
          setSaveStatus('idle');
        }, 5000);
      } finally {
        setIsSaving(false);
      }
    },
    [data, onSaveSuccess, onSaveError, saveThreshold, hasMeaningfulChanges]
  );

  // Manual save function
  const manualSave = useCallback(async () => {
    return save(true);
  }, [save]);

  // Update data and trigger auto-save
  const updateData = useCallback(
    (updates) => {
      setData((prev) => {
        const newData = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };

        // Check for changes
        if (hasMeaningfulChanges(newData, previousDataRef.current)) {
          changesCountRef.current += 1;
          setHasUnsavedChanges(true);
        }

        return newData;
      });
    },
    [hasMeaningfulChanges]
  );

  // Reset data to original
  const resetData = useCallback(() => {
    setData(originalData);
    previousDataRef.current = originalData;
    changesCountRef.current = 0;
    setHasUnsavedChanges(false);
    setSaveStatus('idle');
  }, [originalData]);

  // Debounced auto-save effect
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (data && hasMeaningfulChanges(data, previousDataRef.current)) {
      timerRef.current = setTimeout(() => {
        save();
      }, debounceTime);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, debounceTime, save, hasMeaningfulChanges]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Initialize with current data
  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setOriginalData(initialData);
      previousDataRef.current = initialData;
    }
  }, [initialData]);

  return {
    data,
    updateData,
    isSaving,
    lastSaved,
    saveCount,
    hasUnsavedChanges,
    saveStatus,
    manualSave,
    resetData,
    setData,
  };
};

/**
 * Hook for form field auto-save
 */
export const useFieldAutoSave = (fieldName, initialValue, options = {}) => {
  const { debounceTime = 1500, onSave, validate } = options;

  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const handleChange = useCallback(
    (newValue) => {
      setValue(newValue);

      if (validate) {
        const validationError = validate(newValue);
        if (validationError) {
          setError(validationError);
          return;
        }
        setError(null);
      }

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(async () => {
        setIsSaving(true);
        try {
          if (onSave) {
            await onSave(newValue);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setIsSaving(false);
        }
      }, debounceTime);
    },
    [debounceTime, onSave, validate]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    value,
    setValue: handleChange,
    isSaving,
    error,
  };
};

export default useAutoSave;
