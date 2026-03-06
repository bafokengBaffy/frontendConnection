import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { logger } from '../utils/logger';
import { debounce } from '../utils/helpers';

// Create context
const SettingsContext = createContext();

// Available settings sections
export const SETTINGS_SECTIONS = {
  PROFILE: 'profile',
  NOTIFICATIONS: 'notifications',
  PRIVACY: 'privacy',
  SECURITY: 'security',
  PREFERENCES: 'preferences',
  LANGUAGE: 'language',
  ACCESSIBILITY: 'accessibility',
  BILLING: 'billing',
  INTEGRATIONS: 'integrations',
  API: 'api',
};

// Available languages
export const LANGUAGES = {
  EN: 'en',
  FR: 'fr',
  ES: 'es',
  DE: 'de',
  ZH: 'zh',
  AR: 'ar',
  PT: 'pt',
  RU: 'ru',
  JA: 'ja',
  KO: 'ko',
};

// Notification channels
export const NOTIFICATION_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  IN_APP: 'in_app',
  WHATSAPP: 'whatsapp',
};

// Privacy levels
export const PRIVACY_LEVELS = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  FRIENDS_ONLY: 'friends_only',
  MENTORS_ONLY: 'mentors_only',
  INSTITUTE_ONLY: 'institute_only',
};

// Initial state
const initialState = {
  profile: {
    visibility: PRIVACY_LEVELS.PUBLIC,
    showEmail: false,
    showPhone: false,
    showLocation: true,
    showEducation: true,
    showExperience: true,
  },
  notifications: {
    email: {
      marketing: true,
      updates: true,
      security: true,
      applications: true,
      messages: true,
    },
    push: {
      enabled: true,
      applications: true,
      messages: true,
      reminders: true,
      promotions: false,
    },
    sms: {
      enabled: false,
      security: true,
      applications: false,
    },
    inApp: {
      enabled: true,
      sound: true,
      desktop: true,
    },
  },
  privacy: {
    profileVisibility: PRIVACY_LEVELS.PUBLIC,
    searchable: true,
    allowMessaging: true,
    allowMentions: true,
    showOnlineStatus: true,
    showLastSeen: true,
    dataCollection: true,
    analytics: true,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    loginAlerts: true,
    deviceManagement: true,
    trustedDevices: [],
  },
  preferences: {
    language: LANGUAGES.EN,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    firstDayOfWeek: 'monday',
    currency: 'USD',
    measurementUnit: 'metric',
  },
  accessibility: {
    screenReader: false,
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    fontFamily: 'default',
    lineHeight: 'normal',
  },
  billing: {
    currency: 'USD',
    taxRate: 0,
    invoiceEmail: '',
    paymentMethods: [],
    autoRenew: true,
  },
  integrations: {
    google: { connected: false },
    linkedin: { connected: false },
    github: { connected: false },
    slack: { connected: false },
    calendar: { connected: false },
  },
  api: {
    apiKey: null,
    webhooks: [],
    rateLimit: 1000,
    ipWhitelist: [],
  },
};

// Context provider component
export const SettingsProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    try {
      // Load saved settings from localStorage
      const savedSettings = localStorage.getItem('user_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return { ...initialState, ...parsed };
      }
    } catch (error) {
      logger.error('Failed to load settings:', error);
    }
    return initialState;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [errors, setErrors] = useState({});

  // Auto-save settings with debounce
  const saveSettings = useCallback(
    debounce(async (settings) => {
      setIsSaving(true);
      try {
        // Save to localStorage
        localStorage.setItem('user_settings', JSON.stringify(settings));

        // Save to server if user is authenticated
        // await api.saveUserSettings(settings);

        setLastSaved(new Date());
        setErrors({});
      } catch (error) {
        logger.error('Failed to save settings:', error);
        setErrors({ save: 'Failed to save settings' });
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  // Auto-save on state change
  useEffect(() => {
    saveSettings(state);
  }, [state, saveSettings]);

  // Update settings
  const updateSettings = useCallback((section, updates) => {
    setState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...updates,
      },
    }));
  }, []);

  // Update profile settings
  const updateProfile = useCallback(
    (updates) => {
      updateSettings('profile', updates);
    },
    [updateSettings]
  );

  // Update notification settings
  const updateNotifications = useCallback((channel, updates) => {
    setState((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [channel]: {
          ...prev.notifications[channel],
          ...updates,
        },
      },
    }));
  }, []);

  // Update privacy settings
  const updatePrivacy = useCallback(
    (updates) => {
      updateSettings('privacy', updates);
    },
    [updateSettings]
  );

  // Update security settings
  const updateSecurity = useCallback(
    (updates) => {
      updateSettings('security', updates);
    },
    [updateSettings]
  );

  // Update preferences
  const updatePreferences = useCallback(
    (updates) => {
      updateSettings('preferences', updates);
    },
    [updateSettings]
  );

  // Update accessibility settings
  const updateAccessibility = useCallback(
    (updates) => {
      updateSettings('accessibility', updates);
    },
    [updateSettings]
  );

  // Update billing settings
  const updateBilling = useCallback(
    (updates) => {
      updateSettings('billing', updates);
    },
    [updateSettings]
  );

  // Update integrations
  const updateIntegrations = useCallback((service, updates) => {
    setState((prev) => ({
      ...prev,
      integrations: {
        ...prev.integrations,
        [service]: {
          ...prev.integrations[service],
          ...updates,
        },
      },
    }));
  }, []);

  // Update API settings
  const updateApi = useCallback(
    (updates) => {
      updateSettings('api', updates);
    },
    [updateSettings]
  );

  // Reset section to defaults
  const resetSection = useCallback((section) => {
    setState((prev) => ({
      ...prev,
      [section]: initialState[section],
    }));
  }, []);

  // Reset all settings
  const resetAll = useCallback(() => {
    setState(initialState);
  }, []);

  // Get notification preferences for a channel
  const getNotificationPreferences = useCallback(
    (channel) => {
      return state.notifications[channel] || {};
    },
    [state.notifications]
  );

  // Check if notification is enabled
  const isNotificationEnabled = useCallback(
    (channel, type) => {
      return state.notifications[channel]?.[type] || false;
    },
    [state.notifications]
  );

  // Get privacy setting
  const getPrivacySetting = useCallback(
    (key) => {
      return state.privacy[key];
    },
    [state.privacy]
  );

  // Get profile visibility
  const getProfileVisibility = useCallback(() => {
    return state.profile.visibility;
  }, [state.profile]);

  // Format date according to preferences
  const formatDate = useCallback(
    (date) => {
      if (!date) return '';

      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      };

      if (state.preferences.dateFormat === 'DD/MM/YYYY') {
        return new Date(date).toLocaleDateString('en-GB', options);
      } else if (state.preferences.dateFormat === 'YYYY-MM-DD') {
        return new Date(date).toISOString().split('T')[0];
      }
      return new Date(date).toLocaleDateString('en-US', options);
    },
    [state.preferences.dateFormat]
  );

  // Format time according to preferences
  const formatTime = useCallback(
    (time) => {
      if (!time) return '';

      const options = {
        hour: '2-digit',
        minute: '2-digit',
      };

      if (state.preferences.timeFormat === '24h') {
        options.hour12 = false;
      }

      return new Date(time).toLocaleTimeString('en-US', options);
    },
    [state.preferences.timeFormat]
  );

  // Get current language
  const currentLanguage = useMemo(() => {
    return state.preferences.language;
  }, [state.preferences.language]);

  // Check if two-factor auth is enabled
  const isTwoFactorEnabled = useCallback(() => {
    return state.security.twoFactorAuth;
  }, [state.security.twoFactorAuth]);

  const value = {
    // State
    settings: state,
    isSaving,
    lastSaved,
    errors,

    // Profile
    profile: state.profile,
    updateProfile,

    // Notifications
    notifications: state.notifications,
    updateNotifications,
    getNotificationPreferences,
    isNotificationEnabled,

    // Privacy
    privacy: state.privacy,
    updatePrivacy,
    getPrivacySetting,
    getProfileVisibility,

    // Security
    security: state.security,
    updateSecurity,
    isTwoFactorEnabled,

    // Preferences
    preferences: state.preferences,
    updatePreferences,
    currentLanguage,
    formatDate,
    formatTime,

    // Accessibility
    accessibility: state.accessibility,
    updateAccessibility,

    // Billing
    billing: state.billing,
    updateBilling,

    // Integrations
    integrations: state.integrations,
    updateIntegrations,

    // API
    api: state.api,
    updateApi,

    // Actions
    resetSection,
    resetAll,

    // Helpers
    isSections: SETTINGS_SECTIONS,
    languages: LANGUAGES,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// Custom hook to use settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Higher-order component
export const withSettings = (Component) => {
  return function WrappedComponent(props) {
    return (
      <SettingsContext.Consumer>
        {(settingsProps) => <Component {...props} settings={settingsProps} />}
      </SettingsContext.Consumer>
    );
  };
};
