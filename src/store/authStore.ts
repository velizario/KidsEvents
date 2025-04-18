import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { User } from "@/types/models";
import { useNavigate } from "react-router-dom";
import { keysToCamelCase } from "@/lib/utils";

// Configure logging level
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

type PersistedAuthState = Pick<
  AuthState,
  "user" | "isAuthenticated" | "userType"
>;

// Set current log level - can be adjusted for production/development
const CURRENT_LOG_LEVEL = LOG_LEVEL.DEBUG; // Assuming DEBUG for development

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
  checkUser: (options?: { forceProfileRefresh?: boolean }) => Promise<void>;
}

// Cache for user profiles to prevent duplicate API calls
const profileCache = new Map();

export const useAuthStore = create(
  persist<AuthState, [], [], PersistedAuthState>(
    (set, get) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,
      userType: null,

      checkUser: async (options?: { forceProfileRefresh?: boolean }) => {
        logger.debug("Starting checkUser process");
        // Clear profile cache to ensure fresh data is fetched
        profileCache.clear();
        try {
          if (
            import.meta.env.VITE_SUPABASE_URL ===
            "https://placeholder-url.supabase.co"
          ) {
            logger.info("Using placeholder Supabase URL - skipping auth check");
            set({ isLoading: false });
            return;
          }

          const currentState = get();

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
              if (
                !options?.forceProfileRefresh &&
                currentState.user &&
                currentState.user.id === user.id &&
                currentState.isAuthenticated
              ) {
                logger.debug("User profile already in state, skipping fetch", {
                  userId: user.id,
                });
                set({ isLoading: false });
                return;
              }

              if (profileCache.has(user.id)) {
                logger.debug("User profile found in cache, using cached data", {
                  userId: user.id,
                });
                const cachedProfile = profileCache.get(user.id);
                set({
                  user: cachedProfile,
                  userType: cachedProfile.userType,
                  isAuthenticated: true,
                  isLoading: false,
                });
                return;
              }

              const type = user.user_metadata?.userType || "parent";
              logger.info(
                `Workspaceing profile for user ${user.id} from ${
                  type === "parent" ? "parents" : "organizers"
                }`
              );
              const { data: profile, error: profileError } = await supabase
                .from(type === "parent" ? "parents" : "organizers")
                .select("*")
                .eq("id", user.id)
                .maybeSingle();
              if (profileError) {
                logger.error(`Error fetching ${type} profile:`, profileError);
              }

              if (profile) {
                logger.info(`Profile found for user ${user.id}`, {
                  userType: type,
                });
                const camelCaseProfile = keysToCamelCase(profile); //convertfrom DBs snake_case to DTOs camelCase

                // For parent profiles, fetch children data
                if (type === "parent") {
                  logger.debug("Fetching children for parent profile", {
                    parentId: user.id,
                  });
                  const { data: childrenData, error: childrenError } =
                    await supabase
                      .from("children")
                      .select("*")
                      .eq("parent_id", user.id)
                      .order("created_at", { ascending: false });

                  if (childrenError) {
                    logger.error("Error fetching children:", childrenError);
                  } else {
                    logger.info(
                      `Found ${childrenData?.length || 0} children for parent ${
                        user.id
                      }`
                    );
                    camelCaseProfile.children = keysToCamelCase(
                      childrenData || []
                    );
                  }
                }

                const userData = {
                  ...camelCaseProfile,
                  id: user.id,
                  userType: type,
                };
                profileCache.set(user.id, userData);

                set({
                  user: userData,
                  userType: type,
                  isAuthenticated: true,
                  isLoading: false,
                });
                logger.debug("Auth state updated with profile data");
              } else {
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

                if (type === "parent") {
                  const { error: parentError } = await supabase
                    .from("parents")
                    .upsert(
                      {
                        id: user.id,
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

                const { data: newProfile } = await supabase
                  .from(type === "parent" ? "parents" : "organizers")
                  .select("*")
                  .eq("id", user.id)
                  .maybeSingle();

                if (newProfile) {
                  logger.info("Successfully fetched newly created profile", {
                    userId: user.id,
                    userType: type,
                  });
                  const camelCaseNewProfile = keysToCamelCase(newProfile);
                  const newUserData = {
                    ...camelCaseNewProfile,
                    id: user.id,
                    userType: type,
                  };

                  profileCache.set(user.id, newUserData);

                  set({
                    user: newUserData,
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
            // No session, ensure user is logged out in state
            if (currentState.isAuthenticated || currentState.user) {
              //
              logger.info(
                "No active session found, ensuring user is logged out in state."
              ); //
              profileCache.clear(); //
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                userType: null,
              }); //
            } else {
              //
              set({ isLoading: false }); //
            } //
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

          try {
            await get().signIn(email, password);
            logger.info("Auto sign-in after registration successful");
          } catch (signInError) {
            set({ isLoading: false });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true }); //

          const { error } = await supabase.auth.signOut();

          if (error) {
            logger.error("Sign out failed", { errorMessage: error.message });
            throw error;
          }

          profileCache.clear(); //
          set({
            user: null,
            userType: null,
            isAuthenticated: false,
            isLoading: false,
          });
        } catch (error) {
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
  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      const authStore = useAuthStore.getState();
      logger.debug(`onAuthStateChange event: ${event}`, {
        hasSession: !!session,
      });

      if (session) {
        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED" ||
          event === "INITIAL_SESSION"
        ) {
          const currentUserId = authStore.user?.id;
          const newUserId = session.user.id;

          if (
            newUserId !== currentUserId ||
            !authStore.isAuthenticated ||
            event === "USER_UPDATED"
          ) {
            logger.info(
              `Auth state change requires checkUser (${event}, user: ${newUserId}, previously authenticated: ${authStore.isAuthenticated})`
            );
            if (!window._authCheckInProgress) {
              window._authCheckInProgress = true;
              setTimeout(async () => {
                logger.debug("Debounced checkUser call starting.");
                await authStore.checkUser();
                window._authCheckInProgress = false;
                logger.debug("Debounced checkUser call finished.");
              }, 0);
            } else {
              logger.debug(
                "checkUser call already in progress, skipping duplicate trigger."
              );
            }
          } else {
            logger.debug(
              `Auth event (${event}) for same authenticated user (${newUserId}). Skipping full checkUser.`
            );
            if (authStore.isLoading) {
              useAuthStore.setState({ isLoading: false });
            }
          }
        }
      } else if (event === "SIGNED_OUT") {
        logger.debug("SIGNED_OUT event detected, resetting auth state");
        profileCache.clear();
        logger.debug("Profile cache cleared.");
        useAuthStore.setState({
          user: null,
          userType: null,
          isAuthenticated: false,
          isLoading: false,
        });
        logger.debug("Auth state reset after SIGNED_OUT event");

        if (typeof window !== "undefined") {
          logger.debug("Redirecting to login page after sign out");
          window.location.href = "/login";
        }
      }
    }
  );

  if (!window._authCheckInProgress) {
    logger.info("Performing initial auth check on application load");
    window._authCheckInProgress = true;
    setTimeout(async () => {
      logger.debug("Initial debounced checkUser call starting.");
      await useAuthStore.getState().checkUser();
      window._authCheckInProgress = false;
      logger.debug("Initial debounced checkUser call finished.");
    }, 0);
  }
}

declare global {
  interface Window {
    _authCheckInProgress?: boolean;
  }
}
