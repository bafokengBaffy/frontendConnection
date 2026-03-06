/* eslint-disable no-unused-vars */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const userService = {
  // Get all users with filters
  getAllUsers: async (filters = {}) => {
    try {
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy('createdAt', 'desc'));

      // Apply filters
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.userType) {
        q = query(q, where('userType', '==', filters.userType));
      }
      if (filters.search) {
        // This would need a better search implementation
        // For now, we'll filter client-side
      }

      const snapshot = await getDocs(q);
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
        updatedAt: doc.data().updatedAt?.toDate?.() || null,
        approvedAt: doc.data().approvedAt?.toDate?.() || null,
        rejectedAt: doc.data().rejectedAt?.toDate?.() || null,
        suspendedAt: doc.data().suspendedAt?.toDate?.() || null,
      }));

      // Apply search filter client-side if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return users.filter(
          (user) =>
            user.email?.toLowerCase().includes(searchTerm) ||
            user.displayName?.toLowerCase().includes(searchTerm) ||
            user.userType?.toLowerCase().includes(searchTerm)
        );
      }

      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const user = {
          id: userSnap.id,
          ...userSnap.data(),
          createdAt: userSnap.data().createdAt?.toDate?.() || null,
          updatedAt: userSnap.data().updatedAt?.toDate?.() || null,
          approvedAt: userSnap.data().approvedAt?.toDate?.() || null,
          rejectedAt: userSnap.data().rejectedAt?.toDate?.() || null,
          suspendedAt: userSnap.data().suspendedAt?.toDate?.() || null,
        };
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, updates) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return { success: true, message: 'User updated successfully' };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete user (soft delete)
  deleteUser: async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        status: 'deleted',
        isActive: false,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return { success: true, message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map((doc) => doc.data());

      const stats = {
        total: users.length,
        active: users.filter((u) => u.status === 'active').length,
        pending: users.filter((u) => u.status === 'pending').length,
        suspended: users.filter((u) => u.status === 'suspended').length,
        rejected: users.filter((u) => u.status === 'rejected').length,
        byType: users.reduce((acc, user) => {
          const type = user.userType || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
      };

      return stats;
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  },

  // Get pending users
  getPendingUsers: async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('status', '==', 'pending'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || null,
      }));
    } catch (error) {
      console.error('Error getting pending users:', error);
      throw error;
    }
  },

  // Create new user (admin only)
  createUser: async (userData) => {
    try {
      const usersRef = collection(db, 'users');
      const newUser = {
        ...userData,
        status: userData.status || 'active',
        isActive: userData.status !== 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: false,
      };

      const docRef = await addDoc(usersRef, newUser);
      return {
        success: true,
        message: 'User created successfully',
        userId: docRef.id,
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Bulk update users
  bulkUpdateUsers: async (userIds, updates) => {
    try {
      const updatePromises = userIds.map((userId) => {
        const userRef = doc(db, 'users', userId);
        return updateDoc(userRef, {
          ...updates,
          updatedAt: serverTimestamp(),
        });
      });

      await Promise.all(updatePromises);
      return { success: true, message: 'Users updated successfully' };
    } catch (error) {
      console.error('Error bulk updating users:', error);
      throw error;
    }
  },
};

export default userService;
