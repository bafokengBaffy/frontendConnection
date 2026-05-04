/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
/**
 * Admin User Setup Utility
 *
 * WARNING: This should only be used during initial setup or in development
 * In production, admin users should be created through secure backend processes
 */

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import { auth, db } from './firebase';

// Import environment variables
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

// Validate environment variables
const validateEnvVars = () => {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.warn('⚠️  Admin credentials not found in environment variables');
    return false;
  }

  // Basic email validation
  const emailRegex = /^[^.@]+@[^.@]+\.[^.@]+$/;
  if (!emailRegex.test(ADMIN_EMAIL)) {
    console.error('❌ Invalid admin email format');
    return false;
  }

  // Password strength validation
  if (ADMIN_PASSWORD.length < 8) {
    console.error('❌ Admin password must be at least 8 characters');
    return false;
  }

  return true;
};

// Generate secure random password (fallback)
const generateSecurePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  array.forEach((b) => {
    password += chars.charAt(b % chars.length);
  });
  return password;
};

// Admin configuration - fallback to env vars if provided, otherwise use secure defaults
const getAdminConfig = () => {
  const isProduction = import.meta.env.VITE_APP_ENVIRONMENT === 'production';

  if (isProduction && !validateEnvVars()) {
    throw new Error('Admin credentials required for production setup');
  }

  return {
    email: ADMIN_EMAIL || 'admin@careerconnect.com',
    password: ADMIN_PASSWORD || generateSecurePassword(),
    name: 'System Administrator',
    userType: 'admin',
    role: 'admin',
    permissions: ['all'],
  };
};

// Check if admin already exists
const checkAdminExists = async (email) => {
  try {
    // In a real production system, this should check a secure backend
    // For Firebase-only setup, we'll check if we can create the user
    return false; // Always try to create for this implementation
  } catch (error) {
    console.error('Error checking admin existence:', error);
    return false;
  }
};

// Create admin user in Firebase Auth
const createAuthAdmin = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Admin user created in Firebase Auth');
    return userCredential.user;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin user already exists in Firebase Auth');
      return null; // User exists, return null to continue with Firestore setup
    } else if (error.code === 'auth/operation-not-allowed') {
      console.error('❌ Email/password accounts are not enabled. Enable them in Firebase Console');
      throw error;
    } else if (error.code === 'auth/invalid-email') {
      console.error('❌ Invalid email address');
      throw error;
    } else if (error.code === 'auth/weak-password') {
      console.error('❌ Password is too weak');
      throw error;
    } else {
      console.error('❌ Firebase Auth error:', error.code, error.message);
      throw error;
    }
  }
};

// Create admin profile in Firestore
const createFirestoreAdmin = async (userId, email, name) => {
  try {
    const userRef = doc(db, 'users', userId || 'temp-admin-id');

    const adminProfile = {
      uid: userId || 'temp-admin-id',
      email: email.toLowerCase(),
      displayName: name,
      userType: 'admin',
      role: 'admin',
      isAdmin: true,
      isSuperAdmin: true,
      permissions: [
        'manage_users',
        'manage_companies',
        'manage_jobs',
        'manage_applications',
        'view_analytics',
        'system_settings',
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      profileCompletion: 100,
      emailVerified: true,
      status: 'active',
      lastLogin: null,
      loginCount: 0,
      securityLevel: 'high',
      twoFactorEnabled: false,
      metadata: {
        createdBy: 'system',
        creationMethod: 'auto-setup',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      },
    };

    await setDoc(userRef, adminProfile, { merge: true });

    // Also create in admin-specific collection for faster queries
    const adminRef = doc(db, 'admins', userId || 'temp-admin-id');
    const adminData = {
      userId: userId || 'temp-admin-id',
      email: email.toLowerCase(),
      displayName: name,
      createdAt: new Date().toISOString(),
      lastActive: null,
      permissions: adminProfile.permissions,
      isActive: true,
    };

    await setDoc(adminRef, adminData, { merge: true });

    console.log('✅ Admin profile created in Firestore');
    return adminProfile;
  } catch (error) {
    console.error('❌ Firestore error:', error);
    throw error;
  }
};

// Verify admin setup
const verifyAdminSetup = async (email) => {
  try {
    // Check if admin exists in Firestore
    const adminQuery = await getDoc(doc(db, 'users', 'temp-admin-id'));
    return adminQuery.exists();
  } catch (error) {
    console.error('Verification error:', error);
    return false;
  }
};

// Main initialization function
export const initializeAdminUser = async () => {
  // Check if we're in production and if admin setup is allowed
  const isProduction = import.meta.env.VITE_APP_ENVIRONMENT === 'production';
  const allowAdminSetup = import.meta.env.VITE_ENABLE_ADMIN_SETUP === 'true';

  if (isProduction && !allowAdminSetup) {
    console.warn('⚠️  Admin auto-setup disabled in production');
    return {
      success: false,
      message: 'Admin auto-setup is disabled in production environment',
      action: 'Please create admin user manually through secure backend',
    };
  }

  try {
    console.log('🛠️ Starting admin initialization...');

    const adminConfig = getAdminConfig();

    // Log environment info (without sensitive data)
    console.log('Environment:', import.meta.env.VITE_APP_ENVIRONMENT || 'development');
    console.log('App Version:', import.meta.env.VITE_APP_VERSION || 'unknown');

    // Create admin in Firebase Auth
    const authUser = await createAuthAdmin(adminConfig.email, adminConfig.password);

    // Skip if user already exists
    if (authUser === null) {
      console.log('ℹ️  Admin user already exists, skipping creation');
      return {
        success: true,
        message: 'Admin user already exists',
        data: {
          email: adminConfig.email,
          userId: null,
          profileCreated: false,
        },
      };
    }

    // Create admin profile in Firestore
    const adminProfile = await createFirestoreAdmin(
      authUser?.uid,
      adminConfig.email,
      adminConfig.name
    );

    // Verify setup
    const isVerified = await verifyAdminSetup(adminConfig.email);

    if (isVerified) {
      console.log('✅ Admin initialization completed successfully');

      // In development, log the credentials (never do this in production!)
      if (!isProduction) {
        console.log('📋 Admin Credentials (Development Only):');
        console.log('📧 Email:', adminConfig.email);
        console.log('🔑 Password:', adminConfig.password);
        console.log('⚠️  Change these credentials immediately in production!');
      }

      return {
        success: true,
        message: 'Admin user initialized successfully',
        data: {
          email: adminConfig.email,
          userId: authUser?.uid || 'temp-admin-id',
          profileCreated: true,
        },
        warning: isProduction
          ? null
          : 'Development credentials shown above - change for production!',
      };
    } else {
      return {
        success: false,
        message: 'Admin initialization completed but verification failed',
        error: 'Verification failed',
      };
    }
  } catch (error) {
    console.error('❌ Admin initialization failed:', error);

    return {
      success: false,
      message: 'Failed to initialize admin user',
      error: error.message,
      code: error.code,
      action: 'Please check Firebase configuration and permissions',
    };
  }
};

// Optional: Function to check if admin exists and is properly configured
export const checkAdminStatus = async () => {
  try {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    if (!adminEmail) return { exists: false, reason: 'No admin email configured' };

    // This would typically check with your backend
    // For Firebase-only, we return minimal info
    return {
      exists: true,
      configured: true,
      email: adminEmail,
      warning: 'Admin check limited in frontend-only setup',
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
    };
  }
};

// Export for manual triggering if needed
export default {
  initializeAdminUser,
  checkAdminStatus,
  validateEnvVars,
};
