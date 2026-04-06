/* eslint-disable no-unused-vars */
// hooks/useFundingOpportunities.js
import { useState, useCallback } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';

import { db } from '../config/firebase';

export const useFundingOpportunities = (userId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFilteredOpportunities = useCallback(async (filters) => {
    setLoading(true);
    try {
      const constraints = [where('status', '==', 'active')];

      if (filters.type && filters.type !== 'all') {
        constraints.push(where('type', '==', filters.type));
      }

      if (filters.category && filters.category !== 'all') {
        constraints.push(where('category', '==', filters.category));
      }

      const q = query(collection(db, 'fundingOpportunities'), ...constraints);
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveOpportunity = useCallback(
    async (opportunityId) => {
      if (!userId) throw new Error('User not authenticated');

      try {
        await addDoc(collection(db, 'users', userId, 'savedOpportunities'), {
          opportunityId,
          savedAt: Timestamp.now(),
        });
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [userId]
  );

  const unsaveOpportunity = useCallback(
    async (opportunityId) => {
      if (!userId) throw new Error('User not authenticated');

      try {
        const q = query(
          collection(db, 'users', userId, 'savedOpportunities'),
          where('opportunityId', '==', opportunityId)
        );
        const snapshot = await getDocs(q);

        const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));

        await Promise.all(deletePromises);
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [userId]
  );

  return {
    getFilteredOpportunities,
    saveOpportunity,
    unsaveOpportunity,
    loading,
    error,
  };
};
