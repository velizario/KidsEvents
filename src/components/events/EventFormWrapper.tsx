import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EventForm from "./EventForm";
import { useEvents } from "@/hooks/useEvents";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const EventFormWrapper = () => {
  const { createEvent, loading, error } = useEvents();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (data) => {
    try {
      console.log("Creating event with data:", data);
      setIsSubmitting(true);

      // Get the organizer ID from the auth context
      const organizerId = user?.id || "";

      if (!organizerId) {
        throw new Error(
          "You must be logged in as an organizer to create events",
        );
      }

      // Format the data for the API
      const eventData = {
        title: data.title,
        description: data.description,
        date: data.date.toISOString().split("T")[0],
        time: "10:00:00", // Default time if not provided
        location: data.location,
        ageGroup: data.ageGroups
          .map((group) => `${group.minAge}-${group.maxAge}`)
          .join(", "),
        category: data.category,
        capacity: parseInt(data.capacity),
        price: data.isPaid ? data.price : "0",
        isPaid: data.isPaid,
        status: "active" as const,
        imageUrl:
          "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=800&q=80",
      };

      await createEvent(organizerId, eventData);

      setSuccess(true);
      toast({
        title: "Event Created",
        description: "Your event has been successfully created.",
        variant: "default",
      });

      // Redirect to events management after a short delay
      setTimeout(() => {
        navigate("/events/manage");
      }, 2000);
    } catch (err) {
      console.error("Error creating event:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-background p-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-green-600">
            Event Created Successfully!
          </h2>
          <p className="mb-4">Your event has been created and is now live.</p>
          <p>Redirecting to event management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg">Creating your event...</p>
          </div>
        </div>
      )}

      <EventForm onSubmit={handleSubmit} isEditing={false} />

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">
            {error.message || "An error occurred while creating the event."}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventFormWrapper;
