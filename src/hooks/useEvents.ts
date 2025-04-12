import { useState } from "react";
import { eventAPI } from "@/lib/api";
import { Event } from "@/types/models";

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
    try {
      console.log("Fetching events with filters:", filters);
      setLoading(true);
      setError(null);
      const data = await eventAPI.getAllEvents(filters);
      setEvents(data);
      return data;
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch events")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchEventsByOrganizer = async (organizerId: string) => {
    try {
      console.log("Fetching events by organizer:", organizerId);
      setLoading(true);
      setError(null);
      const data = await eventAPI.getEventsByOrganizer(organizerId);
      console.log("Fetched events by organizer:", data);
      setEvents(data);
      return data;
    } catch (err) {
      console.error("Error fetching organizer events:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch organizer events")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchEvent = async (eventId: string) => {
    try {
      console.log("Fetching event with ID:", eventId);
      setLoading(true);
      setError(null);
      const data = await eventAPI.getEvent(eventId);
      setEvent(data);
      return data;
    } catch (err) {
      console.error("Error fetching event:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch event"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (
    organizerId: string,
    eventData: Omit<
      Event,
      "id" | "organizerId" | "registrations" | "createdAt" | "updatedAt"
    >
  ) => {
    try {
      console.log("Creating event with data:", eventData);
      setLoading(true);
      setError(null);
      const data = await eventAPI.createEvent(organizerId, eventData);
      console.log("Created event:", data);
      setEvent(data);
      return data;
    } catch (err) {
      console.error("Error creating event:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to create event")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventId: string, eventData: Partial<Event>) => {
    try {
      console.log("Updating event with ID:", eventId, "and data:", eventData);
      setLoading(true);
      setError(null);
      const data = await eventAPI.updateEvent(eventId, eventData);
      setEvent(data);
      return data;
    } catch (err) {
      console.error("Error updating event:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to update event")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      console.log("Deleting event with ID:", eventId);
      setLoading(true);
      setError(null);
      await eventAPI.deleteEvent(eventId);
      setEvent(null);
      return true;
    } catch (err) {
      console.error("Error deleting event:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to delete event")
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchEventParticipants = async (eventId: string) => {
    try {
      console.log("Fetching participants for event ID:", eventId);
      setLoading(true);
      setError(null);
      const data = await eventAPI.getEventParticipants(eventId);
      return data;
    } catch (err) {
      console.error("Error fetching event participants:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch event participants")
      );
      throw err;
    } finally {
      setLoading(false);
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
