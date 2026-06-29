'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios';

interface User {
  id: string;
  orgId: string | null;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
axios.defaults.baseURL = API_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('termly_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const refreshUser = async () => {
    const token = localStorage.getItem('termly_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      localStorage.removeItem('termly_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  useEffect(() => {
    if (loading) return;

    const publicPaths = ['/', '/login'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!user && !isPublicPath) {
      router.push('/login');
    } else if (user) {
      const hasOrg = user.orgId || user.org_id;
      if (isPublicPath) {
        if (!hasOrg) {
          router.push('/onboarding');
        } else {
          router.push('/dashboard');
        }
      } else if (pathname !== '/onboarding' && !hasOrg) {
        router.push('/onboarding');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('termly_token', res.data.token);
      
      const loggedUser = res.data.user;
      setUser(loggedUser);
      
      const hasOrg = loggedUser?.orgId || loggedUser?.org_id;
      if (!hasOrg) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      localStorage.removeItem('termly_token');
      setUser(null);
      throw new Error(err.response?.data?.error || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const res = await axios.post('/auth/signup', { email, password, fullName });
      localStorage.setItem('termly_token', res.data.token);
      
      const signedUser = res.data.user;
      setUser(signedUser);
      
      const hasOrg = signedUser?.orgId || signedUser?.org_id;
      if (!hasOrg) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      localStorage.removeItem('termly_token');
      setUser(null);
      throw new Error(err.response?.data?.error || 'Registration failed. Email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('termly_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, refreshUser }}>
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
