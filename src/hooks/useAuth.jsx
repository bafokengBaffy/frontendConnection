/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import { useToast } from '../components/ui/Toast';

import { useLocalStorage } from './useLocalStorage';

// Create auth context
export const AuthContext = createContext(null);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useLocalStorage('userProfile', null);
  const { error: showError, success: showSuccess } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
          phoneNumber: user.phoneNumber,
          providerData: user.providerData,
          metadata: {
            creationTime: user.metadata.creationTime,
            lastSignInTime: user.metadata.lastSignInTime,
          },
        };
        setUser(userData);
        setUserProfile(userData);
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [setUserProfile]);

  const signIn = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showSuccess('Successfully signed in!');
        return { user: userCredential.user, error: null };
      } catch (err) {
        let message = 'Failed to sign in';
        switch (err.code) {
          case 'auth/user-not-found':
            message = 'No account found with this email';
            break;
          case 'auth/wrong-password':
            message = 'Incorrect password';
            break;
          case 'auth/invalid-email':
            message = 'Invalid email address';
            break;
          case 'auth/user-disabled':
            message = 'This account has been disabled';
            break;
          case 'auth/too-many-requests':
            message = 'Too many failed attempts. Try again later';
            break;
          default:
            message = err.message;
        }
        setError(message);
        showError(message);
        return { user: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError]
  );

  const signUp = useCallback(
    async (email, password, displayName) => {
      setLoading(true);
      setError(null);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update profile with display name
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }

        // Send email verification
        await sendEmailVerification(userCredential.user);

        showSuccess('Account created successfully! Please verify your email.');
        return { user: userCredential.user, error: null };
      } catch (err) {
        let message = 'Failed to create account';
        switch (err.code) {
          case 'auth/email-already-in-use':
            message = 'Email already in use';
            break;
          case 'auth/invalid-email':
            message = 'Invalid email address';
            break;
          case 'auth/weak-password':
            message = 'Password is too weak';
            break;
          default:
            message = err.message;
        }
        setError(message);
        showError(message);
        return { user: null, error: message };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError]
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      showSuccess('Successfully signed out');
    } catch (err) {
      showError('Failed to sign out');
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      showSuccess('Successfully signed in with Google!');
      return { user: result.user, error: null };
    } catch (err) {
      let message = 'Failed to sign in with Google';
      if (err.code === 'auth/popup-closed-by-user') {
        message = 'Sign in popup was closed';
      }
      setError(message);
      showError(message);
      return { user: null, error: message };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const signInWithFacebook = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      showSuccess('Successfully signed in with Facebook!');
      return { user: result.user, error: null };
    } catch (err) {
      showError('Failed to sign in with Facebook');
      return { user: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const signInWithTwitter = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new TwitterAuthProvider();
      const result = await signInWithPopup(auth, provider);
      showSuccess('Successfully signed in with Twitter!');
      return { user: result.user, error: null };
    } catch (err) {
      showError('Failed to sign in with Twitter');
      return { user: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const signInWithGithub = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      showSuccess('Successfully signed in with Github!');
      return { user: result.user, error: null };
    } catch (err) {
      showError('Failed to sign in with Github');
      return { user: null, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  const resetPassword = useCallback(
    async (email) => {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        showSuccess('Password reset email sent!');
        return { success: true, error: null };
      } catch (err) {
        let message = 'Failed to send reset email';
        if (err.code === 'auth/user-not-found') {
          message = 'No account found with this email';
        }
        showError(message);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError]
  );

  const updateUserProfile = useCallback(
    async (profileData) => {
      if (!auth.currentUser) return { success: false, error: 'No user logged in' };

      try {
        await updateProfile(auth.currentUser, profileData);

        // Update local user state
        setUser((prev) => ({
          ...prev,
          ...profileData,
        }));

        setUserProfile((prev) => ({
          ...prev,
          ...profileData,
        }));

        showSuccess('Profile updated successfully');
        return { success: true, error: null };
      } catch (err) {
        showError('Failed to update profile');
        return { success: false, error: err.message };
      }
    },
    [setUserProfile, showSuccess, showError]
  );

  const sendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) return { success: false, error: 'No user logged in' };

    try {
      await sendEmailVerification(auth.currentUser);
      showSuccess('Verification email sent!');
      return { success: true, error: null };
    } catch (err) {
      showError('Failed to send verification email');
      return { success: false, error: err.message };
    }
  }, [showSuccess, showError]);

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return;

    try {
      await auth.currentUser.reload();
      const user = auth.currentUser;
      setUser({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        providerData: user.providerData,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime,
        },
      });
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, []);

  const hasRole = useCallback(
    (role) => {
      return user?.roles?.includes(role) || false;
    },
    [user]
  );

  const isAuthenticated = !!user;
  const isEmailVerified = user?.emailVerified || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        isEmailVerified,
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithFacebook,
        signInWithTwitter,
        signInWithGithub,
        resetPassword,
        updateUserProfile,
        sendVerificationEmail,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook for protected routes
export const useRequireAuth = (redirectTo = '/login') => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(redirectTo);
    }
  }, [user, loading, navigate, redirectTo]);

  return { user, loading };
};

// Hook for role-based access
export const useRequireRole = (role, redirectTo = '/dashboard') => {
  const { user, hasRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !hasRole(role))) {
      navigate(redirectTo);
    }
  }, [user, loading, hasRole, role, navigate, redirectTo]);

  return { user, loading, hasAccess: user && hasRole(role) };
};

export default useAuth;
