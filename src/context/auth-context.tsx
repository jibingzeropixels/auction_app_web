// src/context/auth-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {jwtDecode} from 'jwt-decode';
import { authService } from '@/services/auth-service';

interface DecodedToken {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string | null;
  isSuperAdmin: boolean;
  eventAttributes: Array<{id: string, adminStatus: string, isAdmin: boolean}>;
  teamAttributes: Array<{id: string, adminStatus: string, isAdmin: boolean}>;
  isActive: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isSuperAdmin: boolean;
  role: 'superAdmin' | 'eventAdmin' | 'teamRepresentative' | null;
  isActive: boolean;
  eventId?: string;
  teamId?: string;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserFromToken = (decodedToken: DecodedToken): User => {
    let role: 'superAdmin' | 'eventAdmin' | 'teamRepresentative' | null = null;
    let eventId: string | undefined = undefined;
    let teamId: string | undefined = undefined;
    
    if (decodedToken.isSuperAdmin) {
      role = 'superAdmin';
    } else {
      const eventAdmin = decodedToken.eventAttributes.find(attr => attr.isAdmin);
      if (eventAdmin) {
        role = 'eventAdmin';
        eventId = eventAdmin.id;
      } else {
        const teamRep = decodedToken.teamAttributes.find(attr => attr.isAdmin);
        if (teamRep) {
          role = 'teamRepresentative';
          teamId = teamRep.id;
        }
      }
    }
    
    return {
      id: decodedToken._id,
      email: decodedToken.email,
      firstName: decodedToken.firstName,
      lastName: decodedToken.lastName,
      isSuperAdmin: decodedToken.isSuperAdmin,
      role,
      isActive: decodedToken.isActive,
      eventId,
      teamId
    };
  };

  // Check for existing token on page load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const decodedToken = jwtDecode<DecodedToken>(token);
          const userData = getUserFromToken(decodedToken);
          
          if (userData.role !== null) {
            setUser(userData);
          } else {
            console.warn('User has no valid role assigned');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await authService.login(email, password);
      const token = response.token;
      
      localStorage.setItem('token', token);
      
      const decodedToken = jwtDecode<DecodedToken>(token);
      const userData = getUserFromToken(decodedToken);
      
      // Verify the user has a valid role
      if (userData.role === null) {
        throw new Error('Your account is awaiting approval.');
      }
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
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