import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ 
    error: AuthError | Error | null;
    requiresConfirmation?: boolean;
    user?: User;
  }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return { 
          error: new Error('Authentication service is not configured. Please check your environment variables.'),
          requiresConfirmation: false
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      // Check if email confirmation is required
      if (data.user && !data.session && !error) {
        // User created but needs to confirm email
        return { 
          error: null,
          requiresConfirmation: true,
          user: data.user
        };
      }
      
      return { error, requiresConfirmation: false };
    } catch (err) {
      console.error('Sign up error:', err);
      return { 
        error: err instanceof Error ? err : new Error('Failed to sign up'),
        requiresConfirmation: false
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
      
      if (!supabaseUrl || !supabaseAnonKey) {
        return { 
          error: new Error('Authentication service is not configured. Please check your environment variables.')
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        // Provide more user-friendly error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and confirm your account before signing in.';
        }
        // Create a new error with the friendly message
        const friendlyError: AuthError = {
          ...error,
          message: errorMessage
        };
        return { error: friendlyError };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { 
        error: err instanceof Error ? err : new Error('Failed to sign in')
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
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

