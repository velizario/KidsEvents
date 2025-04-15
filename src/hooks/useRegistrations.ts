import { useState } from "react";
import { registrationAPI } from "@/lib/api";
import { Registration } from "@/types/models";

// Configure logging level
const LOG_LEVEL = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Set current log level - can be adjusted for production/development
const CURRENT_LOG_LEVEL = LOG_LEVEL.INFO;

// Logging utility functions
const logger = {
  debug: (message: string, data?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.DEBUG) {
      console.debug(`[REGISTRATIONS DEBUG] ${message}`, data ? data : "");
    }
  },
  info: (message: string, data?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.INFO) {
      console.info(`[REGISTRATIONS INFO] ${message}`, data ? data : "");
    }
  },
  warn: (message: string, data?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.WARN) {
      console.warn(`[REGISTRATIONS WARN] ${message}`, data ? data : "");
    }
  },
  error: (message: string, error?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.ERROR) {
      console.error(`[REGISTRATIONS ERROR] ${message}`, error ? error : "");
    }
  },
};

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
    }
  ) => {
    logger.debug("Starting registerForEvent", {
      eventId,
      childId: registrationData.childId,
      parentId: registrationData.parentId,
    });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      logger.info("Calling registrationAPI.registerForEvent", {
        eventId,
        childId: registrationData.childId,
      });
      const data = await registrationAPI.registerForEvent(
        eventId,
        registrationData
      );
      logger.debug("Received registration data", { registrationId: data.id });

      setRegistration(data);
      logger.info("Successfully registered for event", {
        registrationId: data.id,
        eventId,
        status: data.status,
      });
      return data;
    } catch (err) {
      logger.error("Error registering for event:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to register for event")
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed registerForEvent");
    }
  };

  const cancelRegistration = async (registrationId: string) => {
    logger.debug("Starting cancelRegistration", { registrationId });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      logger.info("Calling registrationAPI.cancelRegistration", {
        registrationId,
      });
      const data = await registrationAPI.cancelRegistration(registrationId);
      logger.debug("Received cancelled registration data", {
        registrationId: data.id,
        status: data.status,
      });

      setRegistration(data);
      logger.info("Successfully cancelled registration", {
        registrationId: data.id,
        status: data.status,
      });
      return data;
    } catch (err) {
      logger.error("Error cancelling registration:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to cancel registration")
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed cancelRegistration");
    }
  };

  const fetchRegistration = async (registrationId: string) => {
    logger.debug("Starting fetchRegistration", { registrationId });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      logger.info("Calling registrationAPI.getRegistration", {
        registrationId,
      });
      const data = await registrationAPI.getRegistration(registrationId);
      logger.debug("Received registration data", {
        hasData: !!data,
        registrationId,
      });

      setRegistration(data);
      logger.info("Successfully fetched registration", {
        registrationId,
        status: data?.status,
      });
      return data;
    } catch (err) {
      logger.error("Error fetching registration:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch registration")
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed fetchRegistration");
    }
  };

  const updateRegistrationStatus = async (
    registrationId: string,
    status: "pending" | "confirmed" | "cancelled"
  ) => {
    logger.debug("Starting updateRegistrationStatus", {
      registrationId,
      status,
    });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      logger.info("Calling registrationAPI.updateRegistrationStatus", {
        registrationId,
        status,
      });
      const data = await registrationAPI.updateRegistrationStatus(
        registrationId,
        status
      );
      logger.debug("Received updated registration data", {
        registrationId: data.id,
        status: data.status,
      });

      setRegistration(data);
      logger.info("Successfully updated registration status", {
        registrationId: data.id,
        status: data.status,
      });
      return data;
    } catch (err) {
      logger.error("Error updating registration status:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to update registration status")
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed updateRegistrationStatus");
    }
  };

  const updatePaymentStatus = async (
    registrationId: string,
    paymentStatus: "pending" | "paid" | "refunded"
  ) => {
    logger.debug("Starting updatePaymentStatus", {
      registrationId,
      paymentStatus,
    });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      logger.info("Calling registrationAPI.updatePaymentStatus", {
        registrationId,
        paymentStatus,
      });
      const data = await registrationAPI.updatePaymentStatus(
        registrationId,
        paymentStatus
      );
      logger.debug("Received updated payment status data", {
        registrationId: data.id,
        paymentStatus: data.paymentStatus,
      });

      setRegistration(data);
      logger.info("Successfully updated payment status", {
        registrationId: data.id,
        paymentStatus: data.paymentStatus,
      });
      return data;
    } catch (err) {
      logger.error("Error updating payment status:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to update payment status")
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed updatePaymentStatus");
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
