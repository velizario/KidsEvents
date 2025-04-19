import { supabase } from "./supabase";
import {
  transformE164ToBulgarianLocal,
  transformBulgarianMobileToE164,
} from "./utils";

import log from "../lib/logger";
import {
  convertObjectToCamelCase,
  convertObjectToSnakeCase,
} from "./case-converter";
import {
  User,
  Parent,
  Organizer,
  Child,
  Event,
  Registration,
  Review,
} from "../types/models";

// Authentication APIs
export const authAPI = {
  // Register a new user
  register: async (
    email: string,
    password: string,
    userData: Partial<User>
  ) => {
    log.debug("Registering new user:", email, userData);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });

    if (error) throw error;

    // Create profile in the appropriate table based on user type

    if (userData.userType === "parent") {
      log.debug("Creating parent profile:", userData);
      await supabase.from("parents").insert(
        convertObjectToSnakeCase({
          id: data.user?.id,
          phone: userData.phone,
        })
      );
    } else {
      log.debug("Creating organizer profile:", userData);
      await supabase.from("organizers").insert(
        convertObjectToSnakeCase({
          id: data.user?.id,
          organizationName: (userData as Partial<Organizer>).organizationName,
          description: (userData as Partial<Organizer>).description,
          phone: userData.phone,
          website: (userData as Partial<Organizer>).website,
        })
      );
    }

    return data;
  },

  // Login user
  login: async (email: string, password: string) => {
    log.debug("Logging in user:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Logout user
  logout: async () => {
    log.debug("Logging out user");
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async () => {
    log.debug("Fetching current user");
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Get user profile
  getUserProfile: async (userId: string, userType: "parent" | "organizer") => {
    const table = userType === "parent" ? "parents" : "organizers";
    try {
      // First check if the user exists
      log.debug(`Checking if ${userType} exists with ID:`, userId);
      const { data: checkData, error: checkError } = await supabase
        .from(table)
        .select("id")
        .eq("id", userId);

      if (checkError) throw checkError;

      // If no user found, throw a custom error
      if (!checkData || checkData.length === 0) {
        throw new Error(`No ${userType} found with id: ${userId}`);
      }

      // If multiple users found (shouldn't happen), log warning and use first one
      if (checkData.length > 1) {
        log.warn(
          `Multiple ${userType} profiles found with id: ${userId}. Using first one.`
        );
      }

      // Get the auth user data to retrieve phone number
      log.debug(`Fetching auth user data for ID:`, userId);
      const { data: authUser, error: authUserError } =
        await supabase.auth.admin.getUserById(userId);

      if (authUserError) {
        log.error("Error fetching auth user:", authUserError);
      }

      // Get the full user data
      let userData;

      if (userType === "parent") {
        // For parents, also fetch their children
        log.debug(`Fetching parent profile with children for ID:`, userId);
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("id", userId)
          .limit(1)
          .single();

        if (error) throw error;

        // Get children data for this parent
        log.debug(`Fetching children for parent ID:`, userId);
        const { data: childrenData, error: childrenError } = await supabase
          .from("children")
          .select("*")
          .eq("parent_id", userId);

        if (childrenError) {
          log.error("Error fetching children:", childrenError);
          // Continue with parent data even if children fetch fails
        }

        // Add children and phone to parent data
        userData = {
          ...data,
          children: childrenData || [],
          phone: transformE164ToBulgarianLocal(authUser?.user?.phone || ""),
          email: authUser?.user?.email || "",
          firstName: authUser?.user?.user_metadata?.firstName || "",
          lastName: authUser?.user?.user_metadata?.lastName || "",
        };

        log.debug("Fetched parent profile with children:", {
          parentId: userId,
          childrenCount: childrenData?.length || 0,
        });
      } else {
        // For organizers, just get their data
        log.debug(`Fetching organizer profile for ID:`, userId);
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .eq("id", userId)
          .limit(1)
          .single();

        if (error) throw error;

        // Import the phone number transformation function
        log.debug(`Fetching organizer profile for ID:`, userId);
        const { transformE164ToBulgarianLocal } = await import("./utils");

        // Add user data from auth user
        userData = {
          ...data,
          phone: transformE164ToBulgarianLocal(authUser?.user?.phone || ""),
          email: authUser?.user?.email || "",
          firstName: authUser?.user?.user_metadata?.firstName || "",
          lastName: authUser?.user?.user_metadata?.lastName || "",
        };
      }

      return convertObjectToCamelCase(userData);
    } catch (error) {
      log.error(`Error fetching ${userType} profile:`, error);
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (
    userId: string,
    userType: "parent" | "organizer",
    userData: Partial<Parent | Organizer>,
    childrenData?: Partial<Child>[],
    deletedChildrenIds?: string[]
  ) => {
    // Log the children data being received
    log.debug("Children data received in updateUserProfile:", childrenData);
    log.debug("Deleted children IDs:", deletedChildrenIds);

    // Start a Supabase transaction
    const table = userType === "parent" ? "parents" : "organizers";

    try {
      // Import the phone number transformation function

      // Extract user metadata fields to update in auth.users
      const { phone, firstName, lastName, email, ...profileData } =
        userData as any;

      // Update user metadata in auth.users if provided
      if (phone || firstName || lastName || email) {
        const updateData: any = {};

        if (phone) {
          // Transform the phone number to E.164 format before saving to the database
          updateData.phone = transformBulgarianMobileToE164(phone);
        }

        // Update user metadata if first name or last name is provided
        if (firstName || lastName) {
          updateData.data = {
            firstName: firstName || undefined,
            lastName: lastName || undefined,
          };
        }
        if (email) {
          updateData.email = email;
        }
        log.debug("Updating auth user data:", updateData);
        const { error: authUpdateError } = await supabase.auth.updateUser(
          updateData
        );

        if (authUpdateError) {
          log.error("Error updating user data in auth user:", authUpdateError);
          throw authUpdateError;
        }
      }

      // 1. Update the user profile (without phone as it's now in auth.users)
      log.debug("Updating user profile in database:", profileData);
      const { data, error } = await supabase
        .from(table)
        .update(convertObjectToSnakeCase(profileData))
        .eq("id", userId);

      if (error) throw error;

      // 2. Handle children data if provided and user is a parent
      if (userType === "parent") {
        // 2a. Delete children if any IDs are provided for deletion
        if (deletedChildrenIds && deletedChildrenIds.length > 0) {
          log.debug("Deleting children with IDs:", deletedChildrenIds);
          const { error: deleteError } = await supabase
            .from("children")
            .delete()
            .in("id", deletedChildrenIds)
            .eq("parent_id", userId);

          if (deleteError) {
            log.error("Error deleting children:", deleteError);
            throw deleteError;
          }

          log.debug(
            `Successfully deleted ${deletedChildrenIds.length} children`
          );
        }

        // 2b. Update and insert children in bulk if provided
        if (childrenData && childrenData.length > 0) {
          log.debug("Processing children data in bulk", childrenData);

          // Separate children into those to update and those to insert
          const childrenToUpdate = childrenData.filter((child) => child.id);
          const childrenToInsert = childrenData.filter((child) => !child.id);

          // Process updates in bulk if there are any
          if (childrenToUpdate.length > 0) {
            log.debug(`Updating ${childrenToUpdate.length} existing children`);

            // Use upsert with onConflict to update multiple children in one request
            const childrenDataToUpdate = childrenToUpdate.map((child) =>
              convertObjectToSnakeCase({
                ...child,
                parentId: userId,
              })
            );

            log.debug("Children data to update:", childrenDataToUpdate);

            const { error: updateError } = await supabase
              .from("children")
              .upsert(childrenDataToUpdate, { onConflict: "id" });

            if (updateError) {
              log.error("Error updating children:", updateError);
              throw updateError;
            }
          }

          // Process inserts in bulk if there are any
          if (childrenToInsert.length > 0) {
            log.debug(`Inserting ${childrenToInsert.length} new children`);

            const childrenDataToInsert = childrenToInsert.map((child) =>
              convertObjectToSnakeCase({
                ...child,
                parentId: userId,
              })
            );

            // Generate UUIDs for each new child
            for (const child of childrenDataToInsert) {
              // Add UUID for each new child
              child.id = crypto.randomUUID();
            }

            log.debug(
              "Children data to insert with IDs:",
              childrenDataToInsert
            );

            const { error: insertError } = await supabase
              .from("children")
              .insert(childrenDataToInsert);

            if (insertError) {
              log.error("Error inserting children:", insertError);
              throw insertError;
            }
          }
        }
      } else {
        log.debug("No children operations needed for organizer profile");
      }

      return convertObjectToCamelCase(data);
    } catch (error) {
      log.error("Error in updateUserProfile:", error);
      throw error;
    }
  },
};

// Parent APIs
export const parentAPI = {
  // Add a child to parent
  addChild: async (
    parentId: string,
    childData: Omit<Child, "id" | "parentId">
  ) => {
    // Generate a UUID for the new child
    const childId = crypto.randomUUID();
    log.debug("Adding child with ID:", childId);
    const { data, error } = await supabase
      .from("children")
      .insert(
        convertObjectToSnakeCase({
          id: childId,
          ...childData,
          parentId,
        })
      )
      .select();

    if (error) throw error;
    return convertObjectToCamelCase(data[0]);
  },

  // Update child information
  updateChild: async (childId: string, childData: Partial<Child>) => {
    log.debug("Updating child with ID:", childId);
    const { data, error } = await supabase
      .from("children")
      .update(convertObjectToSnakeCase(childData))
      .eq("id", childId)
      .select();

    if (error) throw error;
    return convertObjectToCamelCase(data[0]);
  },

  // Delete a child
  deleteChild: async (childId: string) => {
    log.debug("Deleting child with ID:", childId);
    const { error } = await supabase
      .from("children")
      .delete()
      .eq("id", childId);

    if (error) throw error;
    return true;
  },

  // Get all children for a parent
  getChildren: async (parentId: string) => {
    log.debug("Fetching children for parent ID:", parentId);
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parentId);

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },

  // Get a specific child
  getChild: async (childId: string) => {
    log.debug("Fetching child with ID:", childId);
    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("id", childId)
      .single();

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },

  // Get parent's registrations
  getRegistrations: async (parentId: string) => {
    log.debug("Fetching registrations for parent ID:", parentId);
    const { data, error } = await supabase
      .from("registrations")
      .select(
        `
        *,
        events (*),
        children (*)
      `
      )
      .eq("parent_id", parentId);

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },
};

// Event APIs
export const eventAPI = {
  // Create a new event
  createEvent: async (
    organizerId: string,
    eventData: Omit<Event, "id" | "organizerId" | "createdAt" | "updatedAt">
  ) => {
    log.debug("Creating new event for organizer ID:", organizerId);
    const { data, error } = await supabase
      .from("events")
      .insert(
        convertObjectToSnakeCase({
          ...eventData,
          organizerId,
        })
      )
      .select();

    if (error) throw error;
    return convertObjectToCamelCase(data[0]);
  },

  // Update an event
  updateEvent: async (eventId: string, eventData: Partial<Event>) => {
    log.debug("Updating event with ID:", eventId);
    const { data, error } = await supabase
      .from("events")
      .update(convertObjectToSnakeCase(eventData))
      .eq("id", eventId)
      .select();

    if (error) throw error;
    return convertObjectToCamelCase(data[0]);
  },

  // Delete an event
  deleteEvent: async (eventId: string) => {
    log.debug("Deleting event with ID:", eventId);
    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) throw error;
    return true;
  },

  // Get all events
  getAllEvents: async (filters?: {
    category?: string;
    date?: string;
    location?: string;
    search?: string;
  }) => {
    let query = supabase
      .from("events")
      .select(
        `
        *,
        organizers(id, organization_name)
      `
      )
      .eq("status", "active");

    // Apply filters if provided
    if (filters) {
      if (filters.category && filters.category !== "All Events") {
        query = query.eq("category", filters.category);
      }

      if (filters.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },

  // Get events by organizer
  getEventsByOrganizer: async (organizerId: string) => {
    log.debug("Fetching events for organizer ID:", organizerId);
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("organizer_id", organizerId);

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },

  // Get a specific event
  getEvent: async (eventId: string) => {
    try {
      log.debug("Fetching event with ID:", eventId);
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          organizers(*)
        `
        )
        .eq("id", eventId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

      if (error) throw error;
      return data ? convertObjectToCamelCase(data) : null;
    } catch (error) {
      log.error("Error fetching event:", error);
      return null;
    }
  },

  // Get event participants
  getEventParticipants: async (eventId: string) => {
    log.debug("Fetching participants for event:", eventId);
    const { data, error } = await supabase
      .from("registrations")
      .select(
        `
        *,
        children (*)
      `
      )
      .eq("event_id", eventId);

    if (error) throw error;

    // If we have data, fetch the parent information separately for each registration
    if (data && data.length > 0) {
      log.debug("Fetched registrations:", data);
      const registrationsWithParents = await Promise.all(
        data.map(async (registration) => {
          let parentData = null;
          let parentError = null;

          try {
            log.debug(
              "Fetching parent data for registration ID:",
              registration.id
            );
            const { data: fetchedParent, error } = await supabase
              .from("parents")
              .select("id, first_name, last_name, phone")
              .eq("id", registration.parent_id)
              .maybeSingle();

            parentData = fetchedParent;
            parentError = error;
          } catch (err) {
            log.error("Error fetching parent data:", err);
            parentError = err;
          }

          if (parentError) {
            log.error("Error fetching parent:", parentError);
            return { ...registration, parent: null };
          }

          return { ...registration, parent: parentData };
        })
      );

      return convertObjectToCamelCase(registrationsWithParents);
    }

    return convertObjectToCamelCase(data);
  },
};

// Registration APIs
export const registrationAPI = {
  // Register for an event
  registerForEvent: async (
    eventId: string,
    registrationData: {
      childId: string;
      parentId: string;
    }
  ) => {
    try {
      // First get the event to check capacity
      log.debug("Fetching event with ID:", eventId);
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) throw eventError;

      if (event.capacity > 0) {
        // Check if we've reached capacity by counting existing registrations
        log.debug("Checking event capacity for event ID:", eventId);
        const { count, error: countError } = await supabase
          .from("registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", eventId)
          .eq("status", "confirmed");

        if (countError) throw countError;

        if (count && count >= event.capacity) {
          throw new Error("This event has reached its capacity");
        }
      }

      // For development/demo purposes, we'll create a child and parent record first
      // In a real app, these would already exist and be associated with the logged-in user

      // Check if child record exists and create if needed
      try {
        // First check if the child record already exists
        log.debug(
          "Checking if child exists with ID:",
          registrationData.childId
        );
        const { data: existingChild, error: checkChildError } = await supabase
          .from("children")
          .select("id")
          .eq("id", registrationData.childId);

        // If no child exists or we get an error
        if (checkChildError || !existingChild || existingChild.length === 0) {
          // Child doesn't exist, create it
          log.debug("Creating child record with ID:", registrationData.childId);
          const { error: childError } = await supabase.from("children").insert({
            id: registrationData.childId,
            parent_id: registrationData.parentId,
            first_name: "Demo",
            last_name: "Child",
            age: 8,
          });

          if (childError) {
            log.error("Error creating child record:", childError);
            throw childError;
          }
        }
      } catch (childError) {
        log.error("Error handling child record:", childError);
        throw new Error(
          "Failed to create child record: " + (childError.message || childError)
        );
      }

      // Check if parent record exists and create if needed
      try {
        // First check if the parent record already exists
        log.debug(
          "Checking if parent exists with ID:",
          registrationData.parentId
        );
        const { data: existingParent, error: checkParentError } = await supabase
          .from("parents")
          .select("id")
          .eq("id", registrationData.parentId);

        // If no parent exists or we get an error
        if (
          checkParentError ||
          !existingParent ||
          existingParent.length === 0
        ) {
          // Parent doesn't exist, create it
          log.debug(
            "Creating parent record with ID:",
            registrationData.parentId
          );
          // Create the parent record with a demo phone number
          // In a real app, this would be the parent's actual phone number
          const { error: parentError } = await supabase.from("parents").insert({
            id: registrationData.parentId,
            phone: "555-123-4567",
          });

          if (parentError) {
            log.error("Error creating parent record:", parentError);
            throw parentError;
          }
        }
      } catch (parentError) {
        log.error("Error handling parent record:", parentError);
        throw new Error(
          "Failed to create parent record: " +
            (parentError.message || parentError)
        );
      }

      // Create registration
      log.debug("Creating registration for event ID:", eventId);
      const { data, error } = await supabase
        .from("registrations")
        .insert(
          convertObjectToSnakeCase({
            eventId,
            childId: registrationData.childId,
            parentId: registrationData.parentId,
            status: "confirmed",
            registrationDate: new Date().toISOString(),
          })
        )
        .select();

      if (error) throw error;

      return convertObjectToCamelCase(data[0]);
    } catch (error) {
      log.error("Error in registerForEvent:", error);
      throw error;
    }
  },

  // Cancel a registration
  cancelRegistration: async (registrationId: string) => {
    // Get the registration to get the event ID
    log.debug("Fetching registration with ID:", registrationId);
    const { data: registration } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", registrationId)
      .single();

    // Update registration status
    log.debug("Updating registration status to cancelled:", registrationId);
    const { data, error } = await supabase
      .from("registrations")
      .update(
        convertObjectToSnakeCase({
          status: "cancelled",
        })
      )
      .eq("id", registrationId)
      .select();

    if (error) throw error;

    return convertObjectToCamelCase(data[0]);
  },

  // Get a specific registration
  getRegistration: async (registrationId: string) => {
    log.debug("Fetching registration with ID:", registrationId);
    const { data, error } = await supabase
      .from("registrations")
      .select(
        `
        *,
        events (*),
        children (*)
      `
      )
      .eq("id", registrationId)
      .single();

    if (error) throw error;

    // Fetch parent information separately
    if (data) {
      let parentData = null;
      let parentError = null;

      try {
        log.debug("Fetching parent data for registration ID:", registrationId);
        const { data: fetchedParent, error } = await supabase
          .from("parents")
          .select("id, first_name, last_name, phone")
          .eq("id", data.parent_id)
          .maybeSingle();

        parentData = fetchedParent;
        parentError = error;
      } catch (err) {
        log.error("Error fetching parent data:", err);
        parentError = err;
      }

      if (parentError) {
        log.error("Error fetching parent:", parentError);
        return convertObjectToCamelCase({ ...data, parent: null });
      }

      return convertObjectToCamelCase({ ...data, parent: parentData });
    }

    return convertObjectToCamelCase(data);
  },

  // Update registration status (for organizers)
  updateRegistrationStatus: async (
    registrationId: string,
    status: "pending" | "confirmed" | "cancelled"
  ) => {
    log.debug("Updating registration status:", registrationId, status);
    const { data, error } = await supabase
      .from("registrations")
      .update({ status })
      .eq("id", registrationId)
      .select();

    if (error) throw error;
    return convertObjectToCamelCase(data[0]);
  },
};

// Review APIs
export const reviewAPI = {
  // Create a review
  createReview: async (
    eventId: string,
    parentId: string,
    reviewData: {
      rating: number;
      comment: string;
    }
  ) => {
    // First get the event to get the organizer ID
    log.debug("Fetching event with ID:", eventId);
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("organizer_id")
      .eq("id", eventId)
      .single();

    if (eventError) throw eventError;
    log.debug("Event data:", event);
    const { data, error } = await supabase
      .from("reviews")
      .insert(
        convertObjectToSnakeCase({
          eventId,
          parentId,
          organizerId: event.organizer_id,
          rating: reviewData.rating,
          comment: reviewData.comment,
          date: new Date().toISOString(),
        })
      )
      .select();

    if (error) throw error;

    return convertObjectToCamelCase(data[0]);
  },

  // Get reviews for an event
  getEventReviews: async (eventId: string) => {
    log.debug("Fetching reviews for event ID:", eventId);
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        parents (first_name, last_name)
      `
      )
      .eq("event_id", eventId);

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },

  // Get reviews for an organizer
  getOrganizerReviews: async (organizerId: string) => {
    log.debug("Fetching reviews for organizer ID:", organizerId);
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        events (id, title),
        parents (first_name, last_name)
      `
      )
      .eq("organizer_id", organizerId);

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },
};
