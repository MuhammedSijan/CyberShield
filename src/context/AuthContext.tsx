import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender?: string;
  age?: number;
}

interface AuthContextType {
  user: User | null;
  guestMode: boolean;
  sessionStartTime: number | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  signup: (details: Omit<User, 'email'> & { email: string; phone: string; gender: string; age: number }) => Promise<void>;
  googleLogin: () => Promise<void>;
  continueAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Load auth state from localStorage (or sessionStorage) on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('cs_user');
    const savedGuest = localStorage.getItem('cs_guest') === 'true';
    const savedTime = localStorage.getItem('cs_start_time');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setSessionStartTime(savedTime ? parseInt(savedTime) : Date.now());
    } else if (savedGuest) {
      setGuestMode(true);
      setSessionStartTime(savedTime ? parseInt(savedTime) : Date.now());
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    if (!password) {
      throw new Error("Password is required");
    }
    // Mock authentication check
    const mockUser: User = {
      firstName: 'Cyber',
      lastName: 'Sentinel',
      email: email,
      phone: '+1 (555) 019-2831',
      gender: 'Other',
      age: 28
    };

    setUser(mockUser);
    setGuestMode(false);
    const now = Date.now();
    setSessionStartTime(now);

    if (rememberMe) {
      localStorage.setItem('cs_user', JSON.stringify(mockUser));
      localStorage.setItem('cs_start_time', now.toString());
    } else {
      sessionStorage.setItem('cs_user', JSON.stringify(mockUser));
      sessionStorage.setItem('cs_start_time', now.toString());
    }
    localStorage.removeItem('cs_guest');
  };

  const signup = async (details: Omit<User, 'email'> & { email: string; phone: string; gender: string; age: number }) => {
    const newUser: User = {
      firstName: details.firstName,
      lastName: details.lastName,
      email: details.email,
      phone: details.phone,
      gender: details.gender,
      age: details.age
    };

    setUser(newUser);
    setGuestMode(false);
    const now = Date.now();
    setSessionStartTime(now);

    localStorage.setItem('cs_user', JSON.stringify(newUser));
    localStorage.setItem('cs_start_time', now.toString());
    localStorage.removeItem('cs_guest');
  };

  const googleLogin = async () => {
    const googleUser: User = {
      firstName: 'Google',
      lastName: 'Tester',
      email: 'user@gmail.com',
      phone: '+1 (555) 000-1111',
      gender: 'Prefer not to say',
      age: 25
    };

    setUser(googleUser);
    setGuestMode(false);
    const now = Date.now();
    setSessionStartTime(now);

    localStorage.setItem('cs_user', JSON.stringify(googleUser));
    localStorage.setItem('cs_start_time', now.toString());
    localStorage.removeItem('cs_guest');
  };

  const continueAsGuest = () => {
    setUser(null);
    setGuestMode(true);
    const now = Date.now();
    setSessionStartTime(now);

    localStorage.setItem('cs_guest', 'true');
    localStorage.setItem('cs_start_time', now.toString());
    localStorage.removeItem('cs_user');
  };

  const logout = () => {
    setUser(null);
    setGuestMode(false);
    setSessionStartTime(null);
    localStorage.removeItem('cs_user');
    localStorage.removeItem('cs_guest');
    localStorage.removeItem('cs_start_time');
    sessionStorage.removeItem('cs_user');
    sessionStorage.removeItem('cs_start_time');
  };

  const isAuthenticated = user !== null || guestMode;

  return (
    <AuthContext.Provider value={{
      user,
      guestMode,
      sessionStartTime,
      isAuthenticated,
      login,
      signup,
      googleLogin,
      continueAsGuest,
      logout
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
