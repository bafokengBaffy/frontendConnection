import { useEffect, useCallback } from 'react';

export const useProfileAnalytics = (profileData, userId) => {
  const trackProfileView = useCallback(() => {
    if (profileData && userId) {
      // Send analytics event
      window.gtag?.('event', 'profile_view', {
        user_id: userId,
        profile_completion: profileData.profileCompletion || 0,
        skills_count: profileData.skills?.length || 0,
        has_resume: !!profileData.resumeUrl,
        has_photo: !!profileData.profilePhoto,
      });
    }
  }, [profileData, userId]);

  const trackProfileUpdate = useCallback(
    (field, value) => {
      if (userId) {
        window.gtag?.('event', 'profile_update', {
          user_id: userId,
          field: field,
          value_type: typeof value,
          has_value: !!value,
        });
      }
    },
    [userId]
  );

  useEffect(() => {
    trackProfileView();
  }, [trackProfileView]);

  return { trackProfileUpdate };
};
