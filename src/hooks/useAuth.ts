import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { authAPI } from '@/lib/api';
import { User } from '@/types/models';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  getUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const authUser = await authAPI.getCurrentUser();
          if (authUser) {
            // Get user profile data
            const userType = authUser.user_metadata?.userType || 'parent';
            const profile = await authAPI.getUserProfile(authUser.id, userType);
            setUser({ ...profile, id: authUser.id, userType });
          }
        }
      } catch (err) {
        console.error('Error checking session:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          try {
            const authUser = await authAPI.getCurrentUser();
            if (authUser) {
              // Get user profile data
              const userType = authUser.user_metadata?.userType || 'parent';
              const profile = await authAPI.getUserProfile(authUser.id, userType);
              setUser({ ...profile, id: authUser.id, userType });
            }
          } catch (err) {
            console.error('Error getting user profile:', err);
            setError(err instanceof Error ? err : new Error('Unknown error'));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.login(email, password);
      // User will be set by the auth state change listener
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err : new Error('Login failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.register(email, password, userData);
      // User will be set by the auth state change listener after they confirm their email
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err : new Error('Registration failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err : new Error('Logout failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const profile = await authAPI.getUserProfile(user.id, user.userType);
      setUser({ ...profile, id: user.id, userType: user.userType });
    } catch (err) {
      console.error('Error getting user profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to get user profile'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        getUserProfile,
      }}
    >
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
