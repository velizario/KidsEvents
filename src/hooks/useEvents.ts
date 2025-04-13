import { useState } from "react";
import { eventAPI } from "@/lib/api";
import { Event } from "@/types/models";

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
      console.debug(`[EVENTS DEBUG] ${message}`, data ? data : "");
    }
  },
  info: (message: string, data?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.INFO) {
      console.info(`[EVENTS INFO] ${message}`, data ? data : "");
    }
  },
  warn: (message: string, data?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.WARN) {
      console.warn(`[EVENTS WARN] ${message}`, data ? data : "");
    }
  },
  error: (message: string, error?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.ERROR) {
      console.error(`[EVENTS ERROR] ${message}`, error ? error : "");
    }
  },
};

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = async (filters?: {
    category?: string;
    ageGroup?: string;
    date?: string;
    location?: string;
    search?: string;
  }) => {
    logger.debug("Starting fetchEvents", { filters });
    try {
      console.log("Fetching events with filters:", filters);
      setLoading(true);
      setError(null);

      logger.info("Calling eventAPI.getAllEvents", { filters });
      const data = await eventAPI.getAllEvents(filters);
      logger.debug("Received events data", { count: data.length });

      setEvents(data);
      logger.info("Successfully fetched events", { count: data.length });
      return data;
    } catch (err) {
      logger.error("Error fetching events:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch events"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed fetchEvents");
    }
  };

  const fetchEventsByOrganizer = async (organizerId: string) => {
    logger.debug("Starting fetchEventsByOrganizer", { organizerId });
    try {
      console.log("Fetching events by organizer:", organizerId);
      setLoading(true);
      setError(null);

      logger.info("Calling eventAPI.getEventsByOrganizer", { organizerId });
      const data = await eventAPI.getEventsByOrganizer(organizerId);
      console.log("Fetched events by organizer:", data);
      setEvents(data);
      logger.info("Successfully fetched organizer events", {
        count: data.length,
      });
      return data;
    } catch (err) {
      logger.error("Error fetching organizer events:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch organizer events"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed fetchEventsByOrganizer");
    }
  };

  const fetchEvent = async (eventId: string) => {
    logger.debug("Starting fetchEvent", { eventId });
    try {
      console.log("Fetching event with ID:", eventId);
      setLoading(true);
      setError(null);

      logger.info("Calling eventAPI.getEvent", { eventId });
      const data = await eventAPI.getEvent(eventId);
      logger.debug("Received event data", { hasData: !!data, eventId });

      if (!data) {
        const notFoundError = new Error(`Event with ID ${eventId} not found`);
        logger.error("Event not found:", notFoundError);
        setError(notFoundError);
        setEvent(null);
        return null;
      }

      setEvent(data);
      logger.info("Successfully fetched event", { eventId });
      return data;
    } catch (err) {
      logger.error("Error fetching event:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch event"));
      setEvent(null);
      return null;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed fetchEvent");
    }
  };

  const createEvent = async (
    organizerId: string,
    eventData: Omit<
      Event,
      "id" | "organizerId" | "registrations" | "createdAt" | "updatedAt"
    >,
  ) => {
    logger.debug("Starting createEvent", {
      organizerId,
      eventTitle: eventData.title,
    });
    try {
      console.log("Creating event with data:", eventData);
      setLoading(true);
      setError(null);

      logger.info("Calling eventAPI.createEvent", {
        organizerId,
        eventTitle: eventData.title,
      });
      const data = await eventAPI.createEvent(organizerId, eventData);
      logger.debug("Received created event data", { eventId: data.id });

      setEvent(data);
      logger.info("Successfully created event", {
        eventId: data.id,
        title: data.title,
      });
      return data;
    } catch (err) {
      logger.error("Error creating event:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to create event"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed createEvent");
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    logger.debug("Starting updateEvent", {
      eventId,
      updateFields: Object.keys(eventData),
    });
    try {
      console.log("Updating event with ID:", eventId, "and data:", eventData);
      setLoading(true);
      setError(null);

      logger.info("Calling eventAPI.updateEvent", {
        eventId,
        updateFields: Object.keys(eventData),
      });
      const data = await eventAPI.updateEvent(eventId, eventData);
      logger.debug("Received updated event data", { eventId: data.id });

      setEvent(data);
      logger.info("Successfully updated event", {
        eventId: data.id,
        title: data.title,
      });
      return data;
    } catch (err) {
      logger.error("Error updating event:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to update event"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed updateEvent");
    }
  };

  const deleteEvent = async (eventId: string) => {
    logger.debug("Starting deleteEvent", { eventId });
    try {
      console.log("Deleting event with ID:", eventId);
      setLoading(true);
      setError(null);

      logger.info("Calling eventAPI.deleteEvent", { eventId });
      await eventAPI.deleteEvent(eventId);
      logger.debug("Event deleted successfully");

      setEvent(null);
      logger.info("Successfully deleted event and reset event state", {
        eventId,
      });
      return true;
    } catch (err) {
      logger.error("Error deleting event:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to delete event"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed deleteEvent");
    }
  };

  const fetchEventParticipants = async (eventId: string) => {
    logger.debug("Starting fetchEventParticipants", { eventId });
    try {
      console.log("Fetching participants for event ID:", eventId);
      setLoading(true);
      setError(null);

      logger.info("Calling eventAPI.getEventParticipants", { eventId });
      const data = await eventAPI.getEventParticipants(eventId);
      logger.debug("Received event participants data", {
        count: data.length,
        eventId,
      });

      logger.info("Successfully fetched event participants", {
        count: data.length,
        eventId,
      });
      return data;
    } catch (err) {
      logger.error("Error fetching event participants:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch event participants"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed fetchEventParticipants");
    }
  };

  return {
    events,
    event,
    loading,
    error,
    fetchEvents,
    fetchEventsByOrganizer,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEventParticipants,
  };
};
