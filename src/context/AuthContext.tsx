import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/models";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  userType: "parent" | "organizer" | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<"parent" | "organizer" | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Skip actual API calls if using placeholder URL
        if (supabase.supabaseUrl === "https://placeholder-url.supabase.co") {
          console.log("Using placeholder Supabase URL - skipping auth check");
          setIsLoading(false);
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            // Get user profile data from the appropriate table
            const type = user.user_metadata?.userType || "parent";
            const { data: profile } = await supabase
              .from(type === "parent" ? "parents" : "organizers")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profile) {
              setUser({ ...profile, id: user.id, userType: type });
              setUserType(type);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (user) {
            // Get user profile data
            const type = user.user_metadata?.userType || "parent";
            const { data: profile } = await supabase
              .from(type === "parent" ? "parents" : "organizers")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profile) {
              setUser({ ...profile, id: user.id, userType: type });
              setUserType(type);
              setIsAuthenticated(true);
            }
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setUserType(null);
          setIsAuthenticated(false);
          navigate("/login");
        }
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // The auth state change listener will handle setting the user
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    userData: Partial<User>,
  ) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            userType: userData.userType,
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
        },
      });

      if (error) throw error;

      // Create profile in the appropriate table
      if (userData.userType === "parent") {
        await supabase.from("parents").insert({
          id: (await supabase.auth.getUser()).data.user?.id,
          email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zipCode: userData.zipCode,
        });
      } else {
        await supabase.from("organizers").insert({
          id: (await supabase.auth.getUser()).data.user?.id,
          email,
          organizationName: (userData as any).organizationName,
          contactName: (userData as any).contactName,
          description: (userData as any).description || "",
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zipCode: userData.zipCode,
          website: (userData as any).website,
        });
      }

      // In a real app, you would show a message to check email for confirmation
      // For demo purposes, we'll sign in automatically
      await signIn(email, password);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // The auth state change listener will handle clearing the user
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        isAuthenticated,
        userType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
