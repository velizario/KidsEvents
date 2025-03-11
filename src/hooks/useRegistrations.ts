import { useState } from "react";
import { registrationAPI } from "@/lib/api";
import { Registration } from "@/types/models";

export const useRegistrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const registerForEvent = async (
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
    try {
      setLoading(true);
      setError(null);
      const data = await registrationAPI.registerForEvent(
        eventId,
        registrationData,
      );
      setRegistration(data);
      return data;
    } catch (err) {
      console.error("Error registering for event:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to register for event"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelRegistration = async (registrationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrationAPI.cancelRegistration(registrationId);
      setRegistration(data);
      return data;
    } catch (err) {
      console.error("Error cancelling registration:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to cancel registration"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistration = async (registrationId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrationAPI.getRegistration(registrationId);
      setRegistration(data);
      return data;
    } catch (err) {
      console.error("Error fetching registration:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch registration"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRegistrationStatus = async (
    registrationId: string,
    status: "pending" | "confirmed" | "cancelled",
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrationAPI.updateRegistrationStatus(
        registrationId,
        status,
      );
      setRegistration(data);
      return data;
    } catch (err) {
      console.error("Error updating registration status:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to update registration status"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (
    registrationId: string,
    paymentStatus: "pending" | "paid" | "refunded",
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await registrationAPI.updatePaymentStatus(
        registrationId,
        paymentStatus,
      );
      setRegistration(data);
      return data;
    } catch (err) {
      console.error("Error updating payment status:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to update payment status"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    registrations,
    registration,
    loading,
    error,
    registerForEvent,
    cancelRegistration,
    fetchRegistration,
    updateRegistrationStatus,
    updatePaymentStatus,
  };
};
