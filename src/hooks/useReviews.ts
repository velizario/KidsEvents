import { useState } from "react";
import { reviewAPI } from "@/lib/api";
import { Review } from "@/types/models";

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createReview = async (
    eventId: string,
    parentId: string,
    reviewData: {
      rating: number;
      comment: string;
    },
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewAPI.createReview(eventId, parentId, reviewData);
      return data;
    } catch (err) {
      console.error("Error creating review:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to create review"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchEventReviews = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewAPI.getEventReviews(eventId);
      setReviews(data);
      return data;
    } catch (err) {
      console.error("Error fetching event reviews:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch event reviews"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizerReviews = async (organizerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reviewAPI.getOrganizerReviews(organizerId);
      setReviews(data);
      return data;
    } catch (err) {
      console.error("Error fetching organizer reviews:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to fetch organizer reviews"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    reviews,
    loading,
    error,
    createReview,
    fetchEventReviews,
    fetchOrganizerReviews,
  };
};
