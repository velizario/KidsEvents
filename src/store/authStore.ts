import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/models";
import { useNavigate } from "react-router-dom";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userType: "parent" | "organizer" | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: Partial<User>
  ) => Promise<void>;
  signOut: () => Promise<void>;
  checkUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(
  persist(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      userType: null,

      checkUser: async () => {
        try {
          // Skip actual API calls if using placeholder URL
          if (supabase.supabaseUrl === "https://placeholder-url.supabase.co") {
            console.log("Using placeholder Supabase URL - skipping auth check");
            set({ isLoading: false });
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
                set({
                  user: { ...profile, id: user.id, userType: type },
                  userType: type,
                  isAuthenticated: true,
                  isLoading: false,
                });
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
                  set({
                    user: { ...newProfile, id: user.id, userType: type },
                    userType: type,
                    isAuthenticated: true,
                    isLoading: false,
                  });
                } else {
                  set({ isLoading: false });
                }
              }
            } else {
              set({ isLoading: false });
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error) {
          console.error("Error checking user:", error);
          set({ isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;

          // The auth state change listener will handle setting the user
          await get().checkUser();
        } catch (error) {
          console.error("Error signing in:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      signUp: async (
        email: string,
        password: string,
        userData: Partial<User>
      ) => {
        try {
          set({ isLoading: true });
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
            const { error: parentError } = await supabase
              .from("parents")
              .upsert(
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
              console.error(
                "Error creating organizer profile:",
                organizerError
              );
            }
          }

          // For development, auto-confirm the email
          if (supabase.supabaseUrl === "https://placeholder-url.supabase.co") {
            // Mock successful sign-in for development
            set({
              user: { ...userData, id: "mock-user-id" } as User,
              userType: userData.userType as "parent" | "organizer",
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // In production, we'd show a message to check email
            // For demo, we'll try to sign in directly
            try {
              await get().signIn(email, password);
            } catch (signInError) {
              console.log(
                "Auto sign-in failed, user may need to confirm email"
              );
              set({ isLoading: false });
              // We'll still consider this a successful registration
            }
          }
        } catch (error) {
          console.error("Error signing up:", error);
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true });
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({
            user: null,
            userType: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error signing out:", error);
          set({ isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userType: state.userType,
      }),
    }
  )
);

// Set up auth state change listener
if (typeof window !== "undefined") {
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    const authStore = useAuthStore.getState();

    if (event === "SIGNED_IN" && session) {
      setTimeout(async () => {
        await authStore.checkUser();
      }, 0);
    } else if (event === "SIGNED_OUT") {
      useAuthStore.setState({
        user: null,
        userType: null,
        isAuthenticated: false,
      });

      // Redirect to login page on sign out
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  });

  // Initial auth check
  useAuthStore.getState().checkUser();
}
