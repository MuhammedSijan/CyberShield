import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebase';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  deleteDoc,
  collection,
  getDocs
} from 'firebase/firestore';

export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  photoURL?: string;
  provider: string;
  createdAt: string;
  lastLogin: string;
  securityScore: number;
  totalScans: number;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    animations: boolean;
    backgroundEffects: boolean;
    particles: boolean;
    reducedMotion: boolean;
    rememberLogin: boolean;
    [key: string]: any;
  };
}

interface AuthContextType {
  user: User | null;
  guestMode: boolean;
  sessionStartTime: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signup: (details: Omit<User, 'email' | 'uid' | 'createdAt' | 'lastLogin' | 'securityScore' | 'totalScans' | 'preferences' | 'provider'> & { email: string; phone: string; gender: string; age: number; password?: string }) => Promise<void>;
  googleLogin: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Monitor auth state changes and sync with Firestore
  useEffect(() => {
    let unsubscribeSnap: () => void = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous snapshot listener if it exists
      unsubscribeSnap();

      if (!firebaseUser) {
        setUser(null);
        setGuestMode(false);
        setSessionStartTime(null);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid);

      // Subscribe to real-time updates of the user's Firestore document
      unsubscribeSnap = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as User;

          // Sync settings from Firestore preferences to localStorage and document classList
          if (data.preferences) {
            const prefs = data.preferences;
            if (prefs.theme) {
              localStorage.setItem('theme', prefs.theme);
              const root = document.documentElement;
              if (prefs.theme === 'dark') {
                root.classList.add('dark');
                root.classList.remove('light');
              } else if (prefs.theme === 'light') {
                root.classList.add('light');
                root.classList.remove('dark');
              } else {
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (systemDark) {
                  root.classList.add('dark');
                  root.classList.remove('light');
                } else {
                  root.classList.add('light');
                  root.classList.remove('dark');
                }
              }
            }
            if (prefs.animations !== undefined) localStorage.setItem('cfg_anim', prefs.animations.toString());
            if (prefs.reducedMotion !== undefined) localStorage.setItem('cfg_motion', prefs.reducedMotion.toString());
            if (prefs.particles !== undefined) localStorage.setItem('cfg_bg_particle', prefs.particles.toString());
            if (prefs.backgroundEffects !== undefined) localStorage.setItem('cfg_bg_grid', prefs.backgroundEffects.toString());
            if (prefs.rememberLogin !== undefined) localStorage.setItem('cfg_remember_login', prefs.rememberLogin.toString());

            // Fire settings update trigger so visual canvases reload
            window.dispatchEvent(new Event('settings-update'));
          }

          if (firebaseUser.isAnonymous) {
            setUser(null);
            setGuestMode(true);
          } else {
            setUser({
              uid: firebaseUser.uid,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email || firebaseUser.email || '',
              phone: data.phone || '',
              age: data.age,
              gender: data.gender,
              photoURL: data.photoURL || firebaseUser.photoURL || '',
              provider: data.provider || 'password',
              createdAt: data.createdAt || '',
              lastLogin: data.lastLogin || '',
              securityScore: data.securityScore ?? 100,
              totalScans: data.totalScans ?? 0,
              preferences: data.preferences || ({} as any)
            });
            setGuestMode(false);
          }
        } else {
          // Document does not exist yet (creating profile in progress or deleted)
          if (firebaseUser.isAnonymous) {
            setUser(null);
            setGuestMode(true);
          } else {
            setUser({
              uid: firebaseUser.uid,
              firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              email: firebaseUser.email || '',
              provider: firebaseUser.providerData[0]?.providerId || 'password',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              securityScore: 100,
              totalScans: 0,
              preferences: {
                theme: 'dark',
                animations: true,
                backgroundEffects: true,
                particles: true,
                reducedMotion: false,
                rememberLogin: true
              }
            });
            setGuestMode(false);
          }
        }

        // Session Time restore/setup
        const savedTime = localStorage.getItem('cs_start_time') || sessionStorage.getItem('cs_start_time');
        const now = Date.now();
        if (savedTime) {
          setSessionStartTime(parseInt(savedTime));
        } else {
          setSessionStartTime(now);
          if (localStorage.getItem('cfg_remember_login') !== 'false') {
            localStorage.setItem('cs_start_time', now.toString());
          } else {
            sessionStorage.setItem('cs_start_time', now.toString());
          }
        }

        setLoading(false);
      }, (error) => {
        console.error("Firestore onSnapshot error:", error);
        setLoading(false);
      });
    }, (error) => {
      console.error("onAuthStateChanged error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSnap();
    };
  }, []);

  const getFriendlyErrorMessage = (error: any): string => {
    if (error && error.code) {
      switch (error.code) {
        case 'auth/weak-password':
          return 'The password is too weak. Please use at least 6 characters.';
        case 'auth/email-already-in-use':
          return 'This email address is already registered. Please sign in instead.';
        case 'auth/wrong-password':
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          return 'Invalid email or password combination. Please try again.';
        case 'auth/popup-blocked':
          return 'Google Sign In popup was blocked by your browser. Please allow popups for this site.';
        case 'auth/network-request-failed':
          return 'A network error occurred. Please check your internet connection.';
        case 'auth/user-disabled':
          return 'This user account has been disabled. Please contact support.';
        case 'auth/too-many-requests':
          return 'Too many login attempts. Please try again later.';
        case 'firestore/permission-denied':
          return 'Database permission denied. Please verify your credentials.';
        default:
          return error.message || 'An unexpected authentication error occurred.';
      }
    }
    return error?.message || 'An unexpected error occurred.';
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    if (!password) {
      throw new Error("Password is required");
    }
    try {
      // Set remember me persistence rules
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const now = Date.now();
      setSessionStartTime(now);
      if (rememberMe) {
        localStorage.setItem('cs_start_time', now.toString());
      } else {
        sessionStorage.setItem('cs_start_time', now.toString());
      }

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(userDocRef, {
        lastLogin: new Date().toISOString()
      }).catch((err) => console.error("Failed to update lastLogin:", err));
    } catch (err: any) {
      throw new Error(getFriendlyErrorMessage(err));
    }
  };

  const signup = async (details: Omit<User, 'email' | 'uid' | 'createdAt' | 'lastLogin' | 'securityScore' | 'totalScans' | 'preferences' | 'provider'> & { email: string; phone: string; gender: string; age: number; password?: string }) => {
    if (!details.password) {
      throw new Error("Password is required for registration");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, details.email, details.password);
      const firebaseUser = userCredential.user;

      const now = Date.now();
      setSessionStartTime(now);
      localStorage.setItem('cs_start_time', now.toString());

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const nowISO = new Date().toISOString();
      const newUserDoc = {
        uid: firebaseUser.uid,
        firstName: details.firstName,
        lastName: details.lastName,
        email: details.email,
        phone: details.phone || '',
        age: details.age || null,
        gender: details.gender || 'Prefer not to say',
        photoURL: '',
        provider: 'password',
        createdAt: nowISO,
        lastLogin: nowISO,
        securityScore: 100,
        totalScans: 0,
        preferences: {
          theme: 'dark' as const,
          animations: true,
          backgroundEffects: true,
          particles: true,
          reducedMotion: false,
          rememberLogin: true
        }
      };
      await setDoc(userDocRef, newUserDoc);
    } catch (err: any) {
      throw new Error(getFriendlyErrorMessage(err));
    }
  };

  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      const nowISO = new Date().toISOString();

      const now = Date.now();
      setSessionStartTime(now);
      localStorage.setItem('cs_start_time', now.toString());

      if (!userDocSnap.exists()) {
        const displayName = firebaseUser.displayName || 'Google User';
        const [firstName, ...lastNameParts] = displayName.split(' ');
        const lastName = lastNameParts.join(' ');

        const newUserDoc = {
          uid: firebaseUser.uid,
          firstName: firstName || 'Google',
          lastName: lastName || 'User',
          email: firebaseUser.email || '',
          phone: firebaseUser.phoneNumber || '',
          age: 25,
          gender: 'Prefer not to say',
          photoURL: firebaseUser.photoURL || '',
          provider: 'google.com',
          createdAt: nowISO,
          lastLogin: nowISO,
          securityScore: 100,
          totalScans: 0,
          preferences: {
            theme: 'dark' as const,
            animations: true,
            backgroundEffects: true,
            particles: true,
            reducedMotion: false,
            rememberLogin: true
          }
        };
        await setDoc(userDocRef, newUserDoc);
      } else {
        await updateDoc(userDocRef, {
          lastLogin: nowISO
        });
      }
    } catch (err: any) {
      throw new Error(getFriendlyErrorMessage(err));
    }
  };

  const continueAsGuest = async () => {
    try {
      const result = await signInAnonymously(auth);
      const firebaseUser = result.user;

      const now = Date.now();
      setSessionStartTime(now);
      localStorage.setItem('cs_start_time', now.toString());

      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const nowISO = new Date().toISOString();
      const newUserDoc = {
        uid: firebaseUser.uid,
        firstName: 'Guest',
        lastName: 'User',
        email: '',
        phone: '',
        age: null as any,
        gender: 'Prefer not to say',
        photoURL: '',
        provider: 'anonymous',
        createdAt: nowISO,
        lastLogin: nowISO,
        securityScore: 100,
        totalScans: 0,
        preferences: {
          theme: 'dark' as const,
          animations: true,
          backgroundEffects: true,
          particles: true,
          reducedMotion: false,
          rememberLogin: true
        }
      };
      await setDoc(userDocRef, newUserDoc);
    } catch (err: any) {
      throw new Error(getFriendlyErrorMessage(err));
    }
  };

  const logout = async () => {
    const currentUser = auth.currentUser;
    // Wipe anonymous data before deleting user sessions
    if (currentUser && currentUser.isAnonymous) {
      try {
        const uid = currentUser.uid;
        const historyColRef = collection(db, 'users', uid, 'history');
        const snapshot = await getDocs(historyColRef);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        await deleteDoc(doc(db, 'users', uid));
        await currentUser.delete();
      } catch (e) {
        console.error("Failed to clean up guest session data:", e);
      }
    }

    await signOut(auth);
    setUser(null);
    setGuestMode(false);
    setSessionStartTime(null);
    localStorage.removeItem('cs_user');
    localStorage.removeItem('cs_guest');
    localStorage.removeItem('cs_start_time');
    sessionStorage.removeItem('cs_user');
    sessionStorage.removeItem('cs_start_time');
  };

  const sendPasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      throw new Error(getFriendlyErrorMessage(err));
    }
  };

  const isAuthenticated = user !== null || guestMode;

  return (
    <AuthContext.Provider value={{
      user,
      guestMode,
      sessionStartTime,
      isAuthenticated,
      loading,
      login,
      signup,
      googleLogin,
      continueAsGuest,
      logout,
      sendPasswordReset
    }}>
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
