import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  updateProfile,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';
import { useLanguage } from './LanguageContext';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const clearError = () => setError(null);

  const handleAuthError = (error: AuthError) => {
    console.error('Auth error:', error);
    
    // Translate common Firebase auth errors
    switch (error.code) {
      case 'auth/user-not-found':
        setError(t('auth.error.userNotFound') || 'User not found');
        break;
      case 'auth/wrong-password':
        setError(t('auth.error.wrongPassword') || 'Incorrect password');
        break;
      case 'auth/email-already-in-use':
        setError(t('auth.error.emailInUse') || 'Email already in use');
        break;
      case 'auth/weak-password':
        setError(t('auth.error.weakPassword') || 'Password should be at least 6 characters');
        break;
      case 'auth/invalid-email':
        setError(t('auth.error.invalidEmail') || 'Invalid email address');
        break;
      case 'auth/too-many-requests':
        setError(t('auth.error.tooManyRequests') || 'Too many failed attempts. Try again later.');
        break;
      case 'auth/network-request-failed':
        setError(t('auth.error.networkError') || 'Network error. Please check your connection.');
        break;
      case 'auth/popup-closed-by-user':
        setError(t('auth.error.popupClosed') || 'Sign-in popup was closed');
        break;
      default:
        setError(error.message);
    }
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name if provided
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      
      // Send verification email
      await sendEmailVerification(result.user);
    } catch (error) {
      handleAuthError(error as AuthError);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      handleAuthError(error as AuthError);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      handleAuthError(error as AuthError);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      handleAuthError(error as AuthError);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    try {
      setError(null);
      if (currentUser) {
        await sendEmailVerification(currentUser);
      }
    } catch (error) {
      handleAuthError(error as AuthError);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    signup,
    loginWithGoogle,
    logout,
    sendVerificationEmail,
    error,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
