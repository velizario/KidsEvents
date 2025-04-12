import { supabase } from "./supabase";
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

// Check if using placeholder URL
const isPlaceholderUrl =
  supabase.supabaseUrl === "https://placeholder-url.supabase.co";

// Mock data for development when Supabase is not connected
const mockUsers = {
  parent: {
    id: "mock-parent-id",
    email: "parent@example.com",
    firstName: "Sarah",
    lastName: "Johnson",
    phone: "(555) 123-4567",
    userType: "parent",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  organizer: {
    id: "mock-organizer-id",
    email: "organizer@example.com",
    organizationName: "Community Arts Center",
    contactName: "John Smith",
    description:
      "A non-profit organization dedicated to providing arts education.",
    phone: "(555) 987-6543",
    userType: "organizer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// Authentication APIs
export const authAPI = {
  // Register a new user
  register: async (
    email: string,
    password: string,
    userData: Partial<User>,
  ) => {
    if (isPlaceholderUrl) {
      console.log("Mock register:", { email, userData });
      return { user: { id: "mock-user-id", email } };
    }

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
      await supabase.from("parents").insert(
        convertObjectToSnakeCase({
          id: data.user?.id,
          email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zipCode: userData.zipCode,
        }),
      );
    } else {
      await supabase.from("organizers").insert(
        convertObjectToSnakeCase({
          id: data.user?.id,
          email,
          organizationName: (userData as Partial<Organizer>).organizationName,
          contactName: (userData as Partial<Organizer>).contactName,
          description: (userData as Partial<Organizer>).description,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          state: userData.state,
          zipCode: userData.zipCode,
          website: (userData as Partial<Organizer>).website,
        }),
      );
    }

    return data;
  },

  // Login user
  login: async (email: string, password: string) => {
    if (isPlaceholderUrl) {
      console.log("Mock login:", { email });
      return { user: { id: "mock-user-id", email } };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  // Logout user
  logout: async () => {
    if (isPlaceholderUrl) {
      console.log("Mock logout");
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Get current user
  getCurrentUser: async () => {
    if (isPlaceholderUrl) {
      console.log("Mock getCurrentUser");
      return { id: "mock-user-id", user_metadata: { userType: "parent" } };
    }

    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  // Get user profile
  getUserProfile: async (userId: string, userType: "parent" | "organizer") => {
    if (isPlaceholderUrl) {
      console.log("Mock getUserProfile:", { userId, userType });
      return mockUsers[userType];
    }

    const table = userType === "parent" ? "parents" : "organizers";
    try {
      // First check if the user exists
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
        console.warn(
          `Multiple ${userType} profiles found with id: ${userId}. Using first one.`,
        );
      }

      // Get the full user data
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("id", userId)
        .limit(1)
        .single();

      if (error) throw error;
      return convertObjectToCamelCase(data);
    } catch (error) {
      console.error(`Error fetching ${userType} profile:`, error);
      // Return mock data when in development to prevent app crashes
      if (process.env.NODE_ENV === "development") {
        console.warn(`Returning mock ${userType} data for development`);
        return mockUsers[userType];
      }
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (
    userId: string,
    userType: "parent" | "organizer",
    userData: Partial<Parent | Organizer>,
  ) => {
    if (isPlaceholderUrl) {
      console.log("Mock updateUserProfile:", { userId, userType, userData });
      return { ...mockUsers[userType], ...userData };
    }

    const table = userType === "parent" ? "parents" : "organizers";
    const { data, error } = await supabase
      .from(table)
      .update(convertObjectToSnakeCase(userData))
      .eq("id", userId);

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },
};

// Parent APIs
export const parentAPI = {
  // Add a child to parent
  addChild: async (
    parentId: string,
    childData: Omit<Child, "id" | "parentId">,
  ) => {
    if (isPlaceholderUrl) {
      console.log("Mock addChild:", { parentId, childData });
      return {
        id: "mock-child-id",
        ...childData,
        parentId,
      };
    }

    const { data, error } = await supabase
      .from("children")
      .insert(
        convertObjectToSnakeCase({
          ...childData,
          parentId,
        }),
      )
      .select();

    if (error) throw error;
    return convertObjectToCamelCase(data[0]);
  },

  // Update child information
  updateChild: async (childId: string, childData: Partial<Child>) => {
    if (isPlaceholderUrl) {
      console.log("Mock updateChild:", { childId, childData });
      return {
        id: childId,
        ...childData,
      };
    }

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
    if (isPlaceholderUrl) {
      console.log("Mock deleteChild:", { childId });
      return true;
    }

    const { error } = await supabase
      .from("children")
      .delete()
      .eq("id", childId);

    if (error) throw error;
    return true;
  },

  // Get all children for a parent
  getChildren: async (parentId: string) => {
    if (isPlaceholderUrl) {
      console.log("Mock getChildren:", { parentId });
      return [
        {
          id: "mock-child-1",
          firstName: "Emma",
          lastName: "Johnson",
          dateOfBirth: "2015-05-12",
          age: 8,
          allergies: "None",
          parentId,
        },
        {
          id: "mock-child-2",
          firstName: "Noah",
          lastName: "Johnson",
          dateOfBirth: "2017-08-23",
          age: 6,
          allergies: "Peanuts",
          parentId,
        },
      ];
    }

    const { data, error } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parentId);

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },

  // Get a specific child
  getChild: async (childId: string) => {
    if (isPlaceholderUrl) {
      console.log("Mock getChild:", { childId });
      return {
        id: childId,
        firstName: "Emma",
        lastName: "Johnson",
        dateOfBirth: "2015-05-12",
        age: 8,
        allergies: "None",
        parentId: "mock-parent-id",
      };
    }

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
    if (isPlaceholderUrl) {
      console.log("Mock getRegistrations:", { parentId });
      return [];
    }

    const { data, error } = await supabase
      .from("registrations")
      .select(
        `
        *,
        events (*),
        children (*)
      `,
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
    eventData: Omit<
      Event,
      "id" | "organizerId" | "registrations" | "createdAt" | "updatedAt"
    >,
  ) => {
    if (isPlaceholderUrl) {
      console.log("Mock createEvent:", { organizerId, eventData });
      return {
        id: "mock-event-id",
        ...eventData,
        organizerId,
        registrations: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from("events")
      .insert(
        convertObjectToSnakeCase({
          ...eventData,
          organizerId,
          registrations: 0,
        }),
      )
      .select();

    if (error) throw error;
    return convertObjectToCamelCase(data[0]);
  },

  // Update an event
  updateEvent: async (eventId: string, eventData: Partial<Event>) => {
    if (isPlaceholderUrl) {
      console.log("Mock updateEvent:", { eventId, eventData });
      return {
        id: eventId,
        ...eventData,
        updatedAt: new Date().toISOString(),
      };
    }

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
    if (isPlaceholderUrl) {
      console.log("Mock deleteEvent:", { eventId });
      return true;
    }

    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) throw error;
    return true;
  },

  // Get all events
  getAllEvents: async (filters?: {
    category?: string;
    ageGroup?: string;
    date?: string;
    location?: string;
    search?: string;
  }) => {
    if (isPlaceholderUrl) {
      console.log("Mock getAllEvents:", { filters });
      return [];
    }

    let query = supabase.from("events").select(`
        *,
        organizers (id, organization_name, contact_name, email, phone)
      `);

    // Apply filters if provided
    if (filters) {
      if (filters.category && filters.category !== "All Events") {
        query = query.eq("category", filters.category);
      }

      if (filters.ageGroup && filters.ageGroup !== "All Ages") {
        query = query.ilike("age_group", `%${filters.ageGroup}%`);
      }

      if (filters.location) {
        query = query.ilike("location", `%${filters.location}%`);
      }

      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        );
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },

  // Get events by organizer
  getEventsByOrganizer: async (organizerId: string) => {
    if (isPlaceholderUrl) {
      console.log("Mock getEventsByOrganizer:", { organizerId });
      return [];
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("organizer_id", organizerId);

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },

  // Get a specific event
  getEvent: async (eventId: string) => {
    if (isPlaceholderUrl) {
      console.log("Mock getEvent:", { eventId });
      return null;
    }

    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        organizers (*)
      `,
      )
      .eq("id", eventId)
      .single();

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },

  // Get event participants
  getEventParticipants: async (eventId: string) => {
    if (isPlaceholderUrl) {
      console.log("Mock getEventParticipants:", { eventId });
      return [];
    }

    const { data, error } = await supabase
      .from("registrations")
      .select(
        `
        *,
        children (*)
      `,
      )
      .eq("event_id", eventId);

    if (error) throw error;

    // If we have data, fetch the parent information separately for each registration
    if (data && data.length > 0) {
      const registrationsWithParents = await Promise.all(
        data.map(async (registration) => {
          const { data: parentData, error: parentError } = await supabase
            .from("parents")
            .select("id, first_name, last_name, email, phone")
            .eq("id", registration.parent_id)
            .single();

          if (parentError) {
            console.error("Error fetching parent:", parentError);
            return { ...registration, parent: null };
          }

          return { ...registration, parent: parentData };
        }),
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
      emergencyContact: {
        name: string;
        phone: string;
        relationship: string;
      };
      paymentMethod?: string;
    },
  ) => {
    if (isPlaceholderUrl) {
      console.log("Mock registerForEvent:", { eventId, registrationData });
      return {
        id: "mock-registration-id",
        eventId,
        childId: registrationData.childId,
        parentId: registrationData.parentId,
        status: "confirmed",
        paymentStatus: "paid",
        confirmationCode: "MOCK-1234",
        registrationDate: new Date().toISOString(),
        emergencyContact: registrationData.emergencyContact,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // First get the event to check capacity
    const { data: event } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (event.registrations >= event.capacity) {
      throw new Error("This event has reached its capacity");
    }

    // Generate confirmation code
    const confirmationCode = `${event.category
      .substring(0, 3)
      .toUpperCase()}-${new Date().getFullYear()}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;

    // Create registration
    const { data, error } = await supabase
      .from("registrations")
      .insert(
        convertObjectToSnakeCase({
          eventId,
          childId: registrationData.childId,
          parentId: registrationData.parentId,
          status: "confirmed", // or 'pending' if payment is required
          paymentStatus: event.isPaid ? "pending" : "paid",
          confirmationCode,
          registrationDate: new Date().toISOString(),
          emergencyContact: registrationData.emergencyContact,
        }),
      )
      .select();

    if (error) throw error;

    // Update event registration count
    await supabase
      .from("events")
      .update({ registrations: event.registrations + 1 })
      .eq("id", eventId);

    return convertObjectToCamelCase(data[0]);
  },

  // Cancel a registration
  cancelRegistration: async (registrationId: string) => {
    if (isPlaceholderUrl) {
      console.log("Mock cancelRegistration:", { registrationId });
      return {
        id: registrationId,
        status: "cancelled",
        paymentStatus: "refunded",
        updatedAt: new Date().toISOString(),
      };
    }

    // Get the registration to get the event ID
    const { data: registration } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", registrationId)
      .single();

    // Update registration status
    const { data, error } = await supabase
      .from("registrations")
      .update(
        convertObjectToSnakeCase({
          status: "cancelled",
          paymentStatus:
            registration.payment_status === "paid" ? "refunded" : "cancelled",
        }),
      )
      .eq("id", registrationId)
      .select();

    if (error) throw error;

    // Update event registration count
    await supabase
      .from("events")
      .select("*")
      .eq("id", registration.event_id)
      .single()
      .then(({ data: event }) => {
        return supabase
          .from("events")
          .update({ registrations: Math.max(0, event.registrations - 1) })
          .eq("id", registration.event_id);
      });

    return convertObjectToCamelCase(data[0]);
  },

  // Get a specific registration
  getRegistration: async (registrationId: string) => {
    if (isPlaceholderUrl) {
      console.log("Mock getRegistration:", { registrationId });
      return null;
    }

    const { data, error } = await supabase
      .from("registrations")
      .select(
        `
        *,
        events (*),
        children (*)
      `,
      )
      .eq("id", registrationId)
      .single();

    if (error) throw error;

    // Fetch parent information separately
    if (data) {
      const { data: parentData, error: parentError } = await supabase
        .from("parents")
        .select("id, first_name, last_name, email, phone")
        .eq("id", data.parent_id)
        .single();

      if (parentError) {
        console.error("Error fetching parent:", parentError);
        return convertObjectToCamelCase({ ...data, parent: null });
      }

      return convertObjectToCamelCase({ ...data, parent: parentData });
    }

    return convertObjectToCamelCase(data);
  },

  // Update registration status (for organizers)
  updateRegistrationStatus: async (
    registrationId: string,
    status: "pending" | "confirmed" | "cancelled",
  ) => {
    if (isPlaceholderUrl) {
      console.log("Mock updateRegistrationStatus:", { registrationId, status });
      return {
        id: registrationId,
        status,
        updatedAt: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from("registrations")
      .update({ status })
      .eq("id", registrationId)
      .select();

    if (error) throw error;
    return convertObjectToCamelCase(data[0]);
  },

  // Update payment status (for organizers)
  updatePaymentStatus: async (
    registrationId: string,
    paymentStatus: "pending" | "paid" | "refunded",
  ) => {
    if (isPlaceholderUrl) {
      console.log("Mock updatePaymentStatus:", {
        registrationId,
        paymentStatus,
      });
      return {
        id: registrationId,
        paymentStatus,
        updatedAt: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from("registrations")
      .update({ payment_status: paymentStatus })
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
    },
  ) => {
    if (isPlaceholderUrl) {
      console.log("Mock createReview:", { eventId, parentId, reviewData });
      return {
        id: "mock-review-id",
        eventId,
        parentId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert(
        convertObjectToSnakeCase({
          eventId,
          parentId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          date: new Date().toISOString(),
        }),
      )
      .select();

    if (error) throw error;

    // Update organizer rating
    await updateOrganizerRating(eventId);

    return convertObjectToCamelCase(data[0]);
  },

  // Get reviews for an event
  getEventReviews: async (eventId: string) => {
    if (isPlaceholderUrl) {
      console.log("Mock getEventReviews:", { eventId });
      return [];
    }

    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        parents (first_name, last_name)
      `,
      )
      .eq("event_id", eventId);

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },

  // Get reviews for an organizer
  getOrganizerReviews: async (organizerId: string) => {
    if (isPlaceholderUrl) {
      console.log("Mock getOrganizerReviews:", { organizerId });
      return [];
    }

    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        *,
        events (id, title, organizer_id),
        parents (first_name, last_name)
      `,
      )
      .eq("events.organizer_id", organizerId);

    if (error) throw error;
    return convertObjectToCamelCase(data);
  },
};

// Helper function to update organizer rating
async function updateOrganizerRating(eventId: string) {
  if (isPlaceholderUrl) {
    console.log("Mock updateOrganizerRating:", { eventId });
    return;
  }

  // Get the event to get the organizer ID
  const { data: event } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", eventId)
    .single();

  // Get all reviews for this organizer's events
  const { data: reviews } = await supabase
    .from("reviews")
    .select(
      `
      rating,
      events!inner (organizer_id)
    `,
    )
    .eq("events.organizer_id", event.organizer_id);

  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  // Update organizer rating
  await supabase
    .from("organizers")
    .update({
      rating: parseFloat(averageRating.toFixed(1)),
      review_count: reviews.length,
    })
    .eq("id", event.organizer_id);
}
