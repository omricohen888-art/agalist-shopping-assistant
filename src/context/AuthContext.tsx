import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // Callback for components to register cleanup functions
  onLogout: (callback: () => void) => () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const logoutCallbacksRef = useRef<Set<() => void>>(new Set());
  const queryClient = useQueryClient();

  // Register a cleanup callback to be called on logout
  const onLogout = useCallback((callback: () => void) => {
    logoutCallbacksRef.current.add(callback);
    // Return unsubscribe function
    return () => {
      logoutCallbacksRef.current.delete(callback);
    };
  }, []);

  // Execute all registered cleanup callbacks
  const executeLogoutCleanup = useCallback(() => {
    console.log('[Auth] Executing logout cleanup...');
    // Clear all React Query cache
    queryClient.clear();
    // Execute all registered callbacks
    logoutCallbacksRef.current.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('[Auth] Cleanup callback error:', error);
      }
    });
    console.log('[Auth] Logout cleanup complete');
  }, [queryClient]);

  useEffect(() => {
    // Skip if Supabase is not configured
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session) => {
        console.log('[Auth] State changed:', event);
        
        // Handle logout - clear all user data
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          // Defer cleanup to avoid blocking auth state update
          setTimeout(() => {
            executeLogoutCleanup();
          }, 0);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [executeLogoutCleanup]);

  const signInWithGoogle = async () => {
    const redirectUrl = "https://icy-plant-07a95c31e.4.azurestaticapps.net/";
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('Error signing in with Google:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
      throw error;
    }
    // The onAuthStateChange listener will handle the cleanup
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isConfigured: isSupabaseConfigured,
      signInWithGoogle, 
      signOut,
      onLogout,
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
