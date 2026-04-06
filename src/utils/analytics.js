/**
 * Analytics utility for tracking events
 */

export const trackEvent = (eventName, eventData = {}) => {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}:`, eventData);
  }

  // In production, you would send to your analytics service
  // Example: Google Analytics, Mixpanel, etc.
  try {
    // Add your analytics service integration here
    // gtag('event', eventName, eventData);
    // or
    // mixpanel.track(eventName, eventData);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export const trackPageView = (page) => {
  trackEvent('page_view', { page });
};

export const trackUserAction = (action, details = {}) => {
  trackEvent('user_action', { action, ...details });
};
