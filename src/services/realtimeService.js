// src/services/realtimeService.js
import { onSnapshot, query, collection, where, orderBy, doc } from 'firebase/firestore';

import { auth, db } from '../config/firebase';

export const realtimeService = {
  subscribeToUpdates(callback) {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user found for realtime updates');
      return () => {};
    }

    try {
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('companyId', '==', user.uid),
        orderBy('appliedAt', 'desc')
      );

      console.log('Setting up realtime subscription for company:', user.uid);

      const unsubscribe = onSnapshot(
        applicationsQuery,
        (snapshot) => {
          const updates = snapshot.docChanges();
          console.log('Realtime updates received:', updates.length);

          if (updates.length > 0) {
            const newApplications = updates
              .filter((change) => change.type === 'added' && change.doc.data().status === 'applied')
              .map((change) => ({
                id: change.doc.id,
                ...change.doc.data(),
                appliedAt: change.doc.data().appliedAt?.toDate() || new Date(),
              }));

            if (newApplications.length > 0) {
              console.log('New applications detected:', newApplications.length);
              callback(newApplications);
            }
          }
        },
        (error) => {
          console.error('Error in real-time subscription:', error);
          // Try to reconnect after error
          setTimeout(() => {
            console.log('Attempting to reconnect realtime service...');
            this.subscribeToUpdates(callback);
          }, 5000);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up real-time updates:', error);
      return () => {};
    }
  },

  subscribeToJobUpdates(callback) {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user found for job updates');
      return () => {};
    }

    try {
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('companyId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      console.log('Setting up job updates subscription for company:', user.uid);

      const unsubscribe = onSnapshot(
        jobsQuery,
        (snapshot) => {
          const updates = snapshot.docChanges();
          console.log('Job updates received:', updates.length);

          if (updates.length > 0) {
            const updatedJobs = updates.map((change) => ({
              type: change.type,
              id: change.doc.id,
              data: change.doc.data(),
              createdAt: change.doc.data().createdAt?.toDate() || new Date(),
            }));

            callback(updatedJobs);
          }
        },
        (error) => {
          console.error('Error in job updates subscription:', error);
          setTimeout(() => {
            console.log('Attempting to reconnect job updates service...');
            this.subscribeToJobUpdates(callback);
          }, 5000);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up job updates:', error);
      return () => {};
    }
  },

  subscribeToProfileViews(callback) {
    const user = auth.currentUser;
    if (!user) return () => {};

    try {
      const companyRef = doc(db, 'companies', user.uid);

      const unsubscribe = onSnapshot(
        companyRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            const companyData = docSnapshot.data();
            console.log('Company profile updated:', companyData.name);
            callback(companyData);
          }
        },
        (error) => {
          console.error('Error in profile view subscription:', error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up profile view updates:', error);
      return () => {};
    }
  },
};

// Utility function for safe date conversion
export const safeDateConvert = (firebaseDate) => {
  if (!firebaseDate) return null;
  if (firebaseDate.toDate && typeof firebaseDate.toDate === 'function') {
    return firebaseDate.toDate();
  }
  if (firebaseDate instanceof Date) {
    return firebaseDate;
  }
  if (typeof firebaseDate === 'string') {
    return new Date(firebaseDate);
  }
  return null;
};

// WebSocket/Server-Sent Events fallback for realtime updates
export const setupSSEConnection = (companyId) => {
  if (typeof EventSource !== 'undefined') {
    try {
      const eventSource = new EventSource(`/api/company/${companyId}/updates`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE update received:', data);
          // Handle different types of updates
          if (data.type === 'new_application') {
            // Trigger callback for new applications
            window.dispatchEvent(new CustomEvent('new-application', { detail: data }));
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        eventSource.close();
        // Attempt reconnection after delay
        setTimeout(() => setupSSEConnection(companyId), 5000);
      };

      return () => eventSource.close();
    } catch (error) {
      console.error('Error setting up SSE:', error);
    }
  }
  return () => {};
};

// Polling fallback for environments without realtime support
export const startPolling = (callback, interval = 30000) => {
  let pollingInterval;

  const poll = async () => {
    try {
      const updates = await checkForUpdates();
      if (updates && updates.length > 0) {
        callback(updates);
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  };

  pollingInterval = setInterval(poll, interval);

  // Initial poll
  poll();

  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };
};

// Mock function for checking updates (implement based on your backend)
const checkForUpdates = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return [];

    // This would be replaced with actual API call to your backend
    const response = await fetch(`/api/company/${user.uid}/updates`);
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error('Error checking for updates:', error);
    return [];
  }
};

export default realtimeService;
