import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/models";
import { useNavigate } from "react-router-dom";

// Configure logging level
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Set current log level - can be adjusted for production/development
const CURRENT_LOG_LEVEL = LOG_LEVEL.DEBUG;

// Logging utility functions
const logger = {
  debug: (message: string, data?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.DEBUG) {
      console.debug(`[AUTH DEBUG] ${message}`, data ? data : "");
    }
  },
  info: (message: string, data?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.INFO) {
      console.info(`[AUTH INFO] ${message}`, data ? data : "");
    }
  },
  warn: (message: string, data?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.WARN) {
      console.warn(`[AUTH WARN] ${message}`, data ? data : "");
    }
  },
  error: (message: string, error?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.ERROR) {
      console.error(`[AUTH ERROR] ${message}`, error ? error : "");
    }
  },
};

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
        logger.debug("Starting checkUser process");
        try {
          // Skip actual API calls if using placeholder URL
          if (supabase.supabaseUrl === "https://placeholder-url.supabase.co") {
            logger.info("Using placeholder Supabase URL - skipping auth check");
            set({ isLoading: false });
            return;
          }

          logger.debug("Fetching current session");
          const {
            data: { session },
          } = await supabase.auth.getSession();
          logger.debug("Session fetch result", { hasSession: !!session });
          if (session) {
            logger.debug("Session exists, fetching user data");
            const {
              data: { user },
            } = await supabase.auth.getUser();
            logger.debug("User fetch result", {
              hasUser: !!user,
              userId: user?.id,
            });
            if (user) {
              // Get user profile data from the appropriate table
              const type = user.user_metadata?.userType || "parent";
              logger.info(
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
                logger.error(`Error fetching ${type} profile:`, profileError);
              }

              if (profile) {
                logger.info(`Profile found for user ${user.id}`, {
                  userType: type,
                });
                set({
                  user: { ...profile, id: user.id, userType: type },
                  userType: type,
                  isAuthenticated: true,
                  isLoading: false,
                });
                logger.debug("Auth state updated with profile data");
              } else {
                // If profile doesn't exist yet (e.g., after email confirmation), create it
                logger.warn("Profile not found, creating from user metadata", {
                  userId: user.id,
                  userType: type,
                });
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
                    logger.error(
                      "Error creating parent profile after auth:",
                      parentError
                    );
                  } else {
                    logger.info(
                      "Successfully created parent profile after auth",
                      { userId: user.id }
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
                    logger.error(
                      "Error creating organizer profile after auth:",
                      organizerError
                    );
                  } else {
                    logger.info(
                      "Successfully created organizer profile after auth",
                      { userId: user.id }
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
                  logger.info("Successfully fetched newly created profile", {
                    userId: user.id,
                    userType: type,
                  });
                  set({
                    user: { ...newProfile, id: user.id, userType: type },
                    userType: type,
                    isAuthenticated: true,
                    isLoading: false,
                  });
                  logger.debug("Auth state updated with new profile data");
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
          logger.error("Error checking user:", error);
          set({ isLoading: false });
          logger.debug("Auth loading state set to false after error");
        }
        logger.debug("Completed checkUser process");
      },

      signIn: async (email: string, password: string) => {
        logger.info(`Attempting to sign in user`, {
          email: email.substring(0, 3) + "***",
        });
        try {
          logger.debug("Setting loading state to true");
          set({ isLoading: true });

          logger.debug("Calling Supabase signInWithPassword");
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            logger.error("Sign in failed", {
              errorMessage: error.message,
              errorCode: error.code,
            });
            throw error;
          }

          logger.info("Sign in successful", {
            email: email.substring(0, 3) + "***",
          });

          // The auth state change listener will handle setting the user
          logger.debug("Calling checkUser to update auth state");
          await get().checkUser();
        } catch (error) {
          logger.error("Error signing in:", error);
          set({ isLoading: false });
          logger.debug("Auth loading state set to false after error");
          throw error;
        }
        logger.debug("Completed sign in process");
      },

      signUp: async (
        email: string,
        password: string,
        userData: Partial<User>
      ) => {
        logger.info(`Attempting to sign up new user`, {
          email: email.substring(0, 3) + "***",
          userType: userData.userType,
        });
        try {
          logger.debug("Setting loading state to true");
          set({ isLoading: true });

          logger.debug("Calling Supabase signUp");
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

          if (error) {
            logger.error("Sign up failed", {
              errorMessage: error.message,
              errorCode: error.code,
            });
            throw error;
          }

          logger.info("Sign up successful", {
            userId: data.user?.id,
            userType: userData.userType,
          });

          // Create profile in the appropriate table with upsert to handle both initial creation and post-confirmation
          logger.debug("Creating user profile", {
            userType: userData.userType,
            userId: data.user?.id,
          });
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
              logger.error("Error creating parent profile:", parentError);
            } else {
              logger.info("Successfully created parent profile", {
                userId: data.user?.id,
              });
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
              logger.error("Error creating organizer profile:", organizerError);
            } else {
              logger.info("Successfully created organizer profile", {
                userId: data.user?.id,
              });
            }
          }

          // For development, auto-confirm the email
          if (supabase.supabaseUrl === "https://placeholder-url.supabase.co") {
            logger.info("Using mock authentication for development");
            // Mock successful sign-in for development
            set({
              user: { ...userData, id: "mock-user-id" } as User,
              userType: userData.userType as "parent" | "organizer",
              isAuthenticated: true,
              isLoading: false,
            });
            logger.debug("Auth state updated with mock user data");
          } else {
            // In production, we'd show a message to check email
            // For demo, we'll try to sign in directly
            try {
              logger.debug("Attempting auto sign-in after registration");
              await get().signIn(email, password);
              logger.info("Auto sign-in successful");
            } catch (signInError) {
              console.log(
                "Auto sign-in failed, user may need to confirm email"
              );
              set({ isLoading: false });
              // We'll still consider this a successful registration
            }
          }
        } catch (error) {
          logger.error("Error signing up:", error);
          set({ isLoading: false });
          logger.debug("Auth loading state set to false after error");
          throw error;
        }
        logger.debug("Completed sign up process");
      },

      signOut: async () => {
        logger.info("Attempting to sign out user");
        try {
          logger.debug("Setting loading state to true");
          set({ isLoading: true });

          logger.debug("Calling Supabase signOut");
          const { error } = await supabase.auth.signOut();

          if (error) {
            logger.error("Sign out failed", { errorMessage: error.message });
            throw error;
          }

          logger.info("Sign out successful");

          set({
            user: null,
            userType: null,
            isAuthenticated: false,
            isLoading: false,
          });
          logger.debug("Auth state reset after sign out");
        } catch (error) {
          logger.error("Error signing out:", error);
          set({ isLoading: false });
          logger.debug("Auth loading state set to false after error");
          throw error;
        }
        logger.debug("Completed sign out process");
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
      logger.debug("SIGNED_OUT event detected, resetting auth state");
      useAuthStore.setState({
        user: null,
        userType: null,
        isAuthenticated: false,
      });
      logger.debug("Auth state reset after SIGNED_OUT event");

      // Redirect to login page on sign out
      if (typeof window !== "undefined") {
        logger.debug("Redirecting to login page after sign out");
        window.location.href = "/login";
      }
    }
  });

  // Initial auth check
  logger.info("Performing initial auth check on application load");
  useAuthStore.getState().checkUser();
}
