import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User } from '../types';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  currentUser: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  isVerified: boolean;
  error: string;
  success: string;
  firebaseError: string | null;
  setFirebaseError: React.Dispatch<React.SetStateAction<string | null>>;
  clearMessages: () => void;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string, phone: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendVerification: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshVerificationStatus: () => Promise<void>;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [firebaseError, setFirebaseError] = useState<string | null>((window as any).__firebaseError || null);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Helper to sync mock session to localStorage
  const saveMockSession = (fbUser: any, isVer: boolean, dbUser: User | null) => {
    localStorage.setItem('taqwa_mock_user', JSON.stringify({
      firebaseUser: fbUser,
      isVerified: isVer,
      currentUser: dbUser
    }));
  };

  // Sync Firebase authenticated user details with server USERS database
  const syncUserProfile = async (fbUser: FirebaseUser | { email: string; displayName?: string; phoneNumber?: string; photoURL?: string }, additional?: { name?: string; phone?: string }) => {
    // Direct Firestore Database Live Sync (Original Mode)
    if (isFirebaseConfigured && db) {
      try {
        const userId = (fbUser as any).uid || (fbUser as any).id;
        if (userId && fbUser.email) {
          const userDocRef = doc(db, 'users', userId);
          const userData: any = {
            uid: userId,
            email: fbUser.email,
          };
          const displayName = additional?.name || fbUser.displayName || fbUser.email?.split('@')[0];
          if (displayName) userData.displayName = displayName;
          const phoneNumber = additional?.phone || fbUser.phoneNumber;
          if (phoneNumber) userData.phoneNumber = phoneNumber;
          const photoURL = fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200';
          if (photoURL) userData.photoURL = photoURL;

          await setDoc(userDocRef, userData, { merge: true });
          console.log('Successfully synchronized profile with Firestore Original Mode:', userData);
        }
      } catch (firestoreErr) {
        console.error('Firestore user profile sync error:', firestoreErr);
      }
    }

    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: (fbUser as any).uid || (fbUser as any).id,
          email: fbUser.email,
          name: additional?.name || fbUser.displayName || fbUser.email?.split('@')[0],
          phone: additional?.phone || fbUser.phoneNumber || '',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          if (data.syncedToFirestore) {
            console.log('Option B: Successfully synchronized profile with Firestore server-side:', data.user.id);
          }
          setCurrentUser(data.user);
          return data.user;
        }
      }
    } catch (err) {
      console.error('Error syncing user with server database:', err);
    }

    // Network error or server-side sync failed -> Fallback to client-side initialized session
    // This protects user session from complete failure if the backend server is temporarily unreachable
    const isSuperAdmin = fbUser.email?.trim().toLowerCase() === 'taqwaenterpriseoffice@gmail.com';
    const fallbackUser: User = {
      id: (fbUser as any).uid || `u-fallback-${Date.now()}`,
      name: additional?.name || fbUser.displayName || fbUser.email?.split('@')[0] || 'Taqwa Customer',
      email: fbUser.email || '',
      phone: additional?.phone || fbUser.phoneNumber || '',
      role: isSuperAdmin ? 'Super Admin' : 'Customer',
      avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      status: 'Active',
      joinedAt: new Date().toISOString()
    };
    setCurrentUser(fallbackUser);
    return fallbackUser;
  };

  // Monitor auth state changes
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason && (
        reason.message?.includes('invalid-api-key') || 
        reason.code?.includes('invalid-api-key') || 
        reason.message?.includes('auth/invalid-api-key') ||
        (reason.toString && reason.toString().includes('auth/invalid-api-key'))
      )) {
        console.error('Captured unhandled firebase invalid-api-key rejection:', reason);
        setFirebaseError('invalid-api-key');
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      const message = event.message;
      if (message && (
        message.includes('invalid-api-key') || 
        message.includes('auth/invalid-api-key')
      )) {
        console.error('Captured unhandled firebase invalid-api-key error:', message);
        setFirebaseError('invalid-api-key');
        event.preventDefault();
      }
    };

    const handleCustomConfigError = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail === 'invalid-api-key') {
        setFirebaseError('invalid-api-key');
      }
    };

    window.addEventListener('unhandledrejection', handleRejection);
    window.addEventListener('error', handleError);
    window.addEventListener('firebase-config-error', handleCustomConfigError);

    // If an early error was captured before registration, apply it immediately
    if ((window as any).__firebaseError === 'invalid-api-key') {
      setFirebaseError('invalid-api-key');
    }

    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      window.removeEventListener('error', handleError);
      window.removeEventListener('firebase-config-error', handleCustomConfigError);
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || firebaseError === 'invalid-api-key') {
      // Demo fallback: Load mock user session
      const savedMockUser = localStorage.getItem('taqwa_mock_user');
      if (savedMockUser) {
        try {
          const parsed = JSON.parse(savedMockUser);
          setFirebaseUser(parsed.firebaseUser);
          setIsVerified(parsed.isVerified);
          setCurrentUser(parsed.currentUser);
        } catch (e) {
          console.error('Error parsing mock session', e);
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        setIsVerified(false);
      }
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};
    try {
      unsubscribe = onAuthStateChanged(
        auth, 
        async (user) => {
          setFirebaseUser(user);
          if (user) {
            // Email verification check (Google logins are pre-verified)
            const isUserVerified = user.emailVerified || user.providerData.some(p => p.providerId === 'google.com');
            setIsVerified(isUserVerified);

            // Sync profile with database
            await syncUserProfile(user);
          } else {
            setCurrentUser(null);
            setIsVerified(false);
          }
          setLoading(false);
        },
        (err: any) => {
          console.error('onAuthStateChanged error callback:', err);
          if (err.code?.includes('invalid-api-key') || err.message?.includes('invalid-api-key')) {
            setFirebaseError('invalid-api-key');
          }
          setLoading(false);
        }
      );
    } catch (e: any) {
      console.error('onAuthStateChanged initialization failed:', e);
      if (e.message?.includes('invalid-api-key') || e.code?.includes('invalid-api-key')) {
        setFirebaseError('invalid-api-key');
      }
      setLoading(false);
    }

    return () => unsubscribe();
  }, [firebaseError]);

  // Automatically check email verification status if they are logged in but not verified
  useEffect(() => {
    if (!firebaseUser || isVerified) return;

    // For live Firebase mode:
    if (isFirebaseConfigured && auth) {
      const interval = setInterval(async () => {
        try {
          await firebaseUser.reload();
          if (auth.currentUser?.emailVerified) {
            setIsVerified(true);
            await syncUserProfile(auth.currentUser);
            setSuccess('Email successfully verified! Welcome aboard.');
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Auto verification check reload issue:', err);
        }
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [firebaseUser, isVerified]);

  const loginWithEmail = async (email: string, password: string) => {
    setError('');
    setSuccess('');

    if (!isFirebaseConfigured) {
      // Demo / Fallback Mock authentication
      const normalizedEmail = email.trim().toLowerCase();
      const mockName = email.split('@')[0];
      const mockUserObj = {
        uid: `mock-${Date.now()}`,
        email: normalizedEmail,
        displayName: mockName,
        phoneNumber: '',
        emailVerified: true,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        providerData: []
      };

      // Simulated Verification check:
      // Require email verification unless it is the pre-configured admin or ends with taqwa.com
      const needsVerification = normalizedEmail !== 'taqwaenterpriseoffice@gmail.com' && !normalizedEmail.endsWith('taqwa.com');
      const isVer = !needsVerification;

      setFirebaseUser(mockUserObj as any);
      setIsVerified(isVer);

      const dbUser = await syncUserProfile(mockUserObj, { name: mockName, phone: '' });
      saveMockSession(mockUserObj, isVer, dbUser);
      setSuccess('Demo Mode: Logged in successfully!');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const isUserVerified = user.emailVerified || user.providerData.some(p => p.providerId === 'google.com');
      setIsVerified(isUserVerified);
      
      await syncUserProfile(user);
      setSuccess('Logged in successfully!');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message;
      if (err.code === 'auth/invalid-credential') {
        errMsg = 'ভুল ইমেইল বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।';
      } else if (err.code === 'auth/user-not-found') {
        errMsg = 'ব্যবহারকারী খুঁজে পাওয়া যায়নি। অনুগ্রহ করে নিবন্ধন করুন।';
      } else if (err.code === 'auth/wrong-password') {
        errMsg = 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'সঠিক ইমেইল ঠিকানা প্রদান করুন।';
      }
      setError(errMsg);
      throw err;
    }
  };

  const registerWithEmail = async (email: string, password: string, name: string, phone: string) => {
    setError('');
    setSuccess('');

    if (!isFirebaseConfigured) {
      // Demo / Fallback Mock register
      const normalizedEmail = email.trim().toLowerCase();
      const mockUserObj = {
        uid: `mock-${Date.now()}`,
        email: normalizedEmail,
        displayName: name,
        phoneNumber: phone,
        emailVerified: false,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        providerData: []
      };

      setFirebaseUser(mockUserObj as any);
      setIsVerified(false);

      const dbUser = await syncUserProfile(mockUserObj, { name, phone });
      saveMockSession(mockUserObj, false, dbUser);
      setSuccess('Demo Mode: Registration successful! Verification email has been sent.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update displayName on Firebase Auth profile
      await updateProfile(user, { displayName: name });
      
      // Send verification email
      await sendEmailVerification(user);
      
      setIsVerified(false);
      
      // Sync to database
      await syncUserProfile(user, { name, phone });
      setSuccess('Registration successful! Verification email has been sent.');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message;
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে।';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'পাসওয়ার্ডটি অত্যন্ত দুর্বল (কমপক্ষে ৬ ডিজিট)।';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'সঠিক ইমেইল ঠিকানা প্রদান করুন।';
      }
      setError(errMsg);
      throw err;
    }
  };

  const loginWithGoogle = async () => {
    setError('');
    setSuccess('');

    if (!isFirebaseConfigured) {
      // Demo / Fallback Mock Google Login
      const mockUserObj = {
        uid: `mock-google-${Date.now()}`,
        email: 'google-customer@gmail.com',
        displayName: 'Google Customer',
        phoneNumber: '',
        emailVerified: true,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        providerData: [{ providerId: 'google.com' }]
      };

      setFirebaseUser(mockUserObj as any);
      setIsVerified(true);

      const dbUser = await syncUserProfile(mockUserObj, { name: 'Google Customer', phone: '' });
      saveMockSession(mockUserObj, true, dbUser);
      setSuccess('Demo Mode: Logged in successfully with Google!');
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      // Prompt selection for nice user flow
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      setIsVerified(true); // Google logins are verified
      await syncUserProfile(user);
      setSuccess('Logged in successfully with Google!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed.');
      throw err;
    }
  };

  const logout = async () => {
    setError('');
    setSuccess('');

    if (!isFirebaseConfigured) {
      localStorage.removeItem('taqwa_mock_user');
      setFirebaseUser(null);
      setCurrentUser(null);
      setIsVerified(false);
      setSuccess('Demo Mode: Logged out safely.');
      return;
    }

    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsVerified(false);
      setSuccess('Logged out safely.');
    } catch (err: any) {
      console.error(err);
      setError('Error signing out.');
      throw err;
    }
  };

  const sendVerification = async () => {
    setError('');
    setSuccess('');

    if (!isFirebaseConfigured) {
      setSuccess('Demo Mode: Verification link successfully re-sent to ' + (firebaseUser?.email || 'your email') + '!');
      return;
    }

    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setSuccess('Verification email re-sent successfully!');
      } else {
        setError('No active user logged in.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not send verification email.');
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setError('');
    setSuccess('');

    if (!isFirebaseConfigured) {
      setSuccess('Demo Mode: Simulated password reset link sent to ' + email);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset link sent to your email.');
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message;
      if (err.code === 'auth/user-not-found') {
        errMsg = 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'সঠিক ইমেইল ঠিকানা প্রদান করুন।';
      }
      setError(errMsg);
      throw err;
    }
  };

  const refreshVerificationStatus = async () => {
    setError('');
    setSuccess('');

    if (!isFirebaseConfigured) {
      if (firebaseUser) {
        setIsVerified(true);
        const dbUser = await syncUserProfile(firebaseUser, { name: firebaseUser.displayName || '', phone: firebaseUser.phoneNumber || '' });
        saveMockSession(firebaseUser, true, dbUser);
        setSuccess('Demo Mode: Verified successfully!');
      }
      return;
    }

    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        const isUserVerified = auth.currentUser.emailVerified;
        setIsVerified(isUserVerified);
        if (isUserVerified) {
          await syncUserProfile(auth.currentUser);
          setSuccess('Verified successfully!');
        } else {
          setError('আউটলুক বা ইনবক্স চেক করুন, এখনও ভেরিফাই করা হয়নি।');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Error refreshing status.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        currentUser,
        loading,
        isLoggedIn: !!firebaseUser,
        isVerified,
        error,
        success,
        firebaseError,
        setFirebaseError,
        clearMessages,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        sendVerification,
        resetPassword,
        refreshVerificationStatus,
        setCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
