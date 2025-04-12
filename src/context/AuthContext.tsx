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
    userData: Partial<User>
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
            console.log(
              `Fetching profile for user ${user.id} from ${
                type === "parent" ? "parents" : "organizers"
              }`
            );
            const { data: profile, error: profileError } = await supabase
              .from(type === "parent" ? "parents" : "organizers")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profileError) {
              console.error(`Error fetching ${type} profile:`, profileError);
            }

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
            console.log(
              `Fetching profile for user ${user.id} from ${
                type === "parent" ? "parents" : "organizers"
              }`
            );
            const { data: profile, error: profileError } = await supabase
              .from(type === "parent" ? "parents" : "organizers")
              .select("*")
              .eq("id", user.id)
              .single();

            if (profileError) {
              console.error(`Error fetching ${type} profile:`, profileError);
            }

            if (profile) {
              setUser({ ...profile, id: user.id, userType: type });
              setUserType(type);
              setIsAuthenticated(true);
            } else {
              // If profile doesn't exist yet (e.g., after email confirmation), create it
              console.log("Profile not found, creating from user metadata");
              const userData = {
                id: user.id,
                email: user.email,
                firstName: user.user_metadata?.firstName || "",
                lastName: user.user_metadata?.lastName || "",
                userType: type,
                phone: user.user_metadata?.phone || "",
                organizationName: user.user_metadata?.organizationName,
                contactName: user.user_metadata?.contactName,
                description: user.user_metadata?.description,
                website: user.user_metadata?.website,
              };

              // Create profile in the appropriate table
              if (type === "parent") {
                const { error: parentError } = await supabase
                  .from("parents")
                  .upsert(
                    {
                      id: user.id,
                      email: user.email,
                      first_name: userData.firstName || "",
                      last_name: userData.lastName || "",
                      phone: userData.phone || "",
                    },
                    { onConflict: "id" }
                  );

                if (parentError) {
                  console.error(
                    "Error creating parent profile after auth:",
                    parentError
                  );
                }
              } else {
                const { error: organizerError } = await supabase
                  .from("organizers")
                  .upsert(
                    {
                      id: user.id,
                      email: user.email,
                      organization_name: userData.organizationName || "",
                      contact_name: userData.contactName || "",
                      description: userData.description || "",
                      phone: userData.phone || "",
                      website: userData.website || "",
                    },
                    { onConflict: "id" }
                  );

                if (organizerError) {
                  console.error(
                    "Error creating organizer profile after auth:",
                    organizerError
                  );
                }
              }

              // Fetch the newly created profile
              const { data: newProfile } = await supabase
                .from(type === "parent" ? "parents" : "organizers")
                .select("*")
                .eq("id", user.id)
                .single();

              if (newProfile) {
                setUser({ ...newProfile, id: user.id, userType: type });
                setUserType(type);
                setIsAuthenticated(true);
              }
            }
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setUserType(null);
          setIsAuthenticated(false);
          navigate("/login");
        }
      }
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
    userData: Partial<User>
  ) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            userType: userData.userType,
            firstName: userData.firstName,
            lastName: userData.lastName,
          },
          // Skip email verification for development
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // Create profile in the appropriate table with upsert to handle both initial creation and post-confirmation
      if (userData.userType === "parent") {
        const { error: parentError } = await supabase.from("parents").upsert(
          {
            id: data.user?.id,
            email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone || "",
            // Using snake_case for database column names
          },
          { onConflict: "id" }
        );

        if (parentError) {
          console.error("Error creating parent profile:", parentError);
        }
      } else {
        const { error: organizerError } = await supabase
          .from("organizers")
          .upsert(
            {
              id: data.user?.id,
              email,
              organization_name: (userData as any).organizationName || "",
              contact_name: (userData as any).contactName || "",
              description: (userData as any).description || "",
              phone: userData.phone || "",
              website: (userData as any).website || "",
              // Using snake_case for database column names
            },
            { onConflict: "id" }
          );

        if (organizerError) {
          console.error("Error creating organizer profile:", organizerError);
        }
      }

      // For development, auto-confirm the email
      if (supabase.supabaseUrl === "https://placeholder-url.supabase.co") {
        // Mock successful sign-in for development
        setUser({ ...userData, id: "mock-user-id" } as User);
        setUserType(userData.userType as "parent" | "organizer");
        setIsAuthenticated(true);
      } else {
        // In production, we'd show a message to check email
        // For demo, we'll try to sign in directly
        try {
          await signIn(email, password);
        } catch (signInError) {
          console.log("Auto sign-in failed, user may need to confirm email");
          // We'll still consider this a successful registration
        }
      }
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
