import { useState } from "react";
import { authAPI, parentAPI } from "@/lib/api";
import { Parent, Organizer, Child } from "@/types/models";

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
      console.debug(`[PROFILE DEBUG] ${message}`, data ? data : "");
    }
  },
  info: (message: string, data?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.INFO) {
      console.info(`[PROFILE INFO] ${message}`, data ? data : "");
    }
  },
  warn: (message: string, data?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.WARN) {
      console.warn(`[PROFILE WARN] ${message}`, data ? data : "");
    }
  },
  error: (message: string, error?: any) => {
    if (CURRENT_LOG_LEVEL <= LOG_LEVEL.ERROR) {
      console.error(`[PROFILE ERROR] ${message}`, error ? error : "");
    }
  },
};

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateParentProfile = async (
    parentId: string,
    profileData: Partial<Parent>,
    childrenData?: Partial<Child>[],
  ) => {
    // Log the children data being received
    console.log("Children data received in updateParentProfile:", childrenData);
    logger.debug("Starting updateParentProfile", {
      parentId,
      updateFields: Object.keys(profileData),
      childrenCount: childrenData?.length || 0,
    });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      // Add updatedAt field to the profile data
      const updatedProfileData = {
        ...profileData,
        updatedAt: new Date().toISOString(),
      };

      logger.info("Calling authAPI.updateUserProfile for parent", {
        parentId,
        updateFields: Object.keys(updatedProfileData),
      });
      const data = await authAPI.updateUserProfile(
        parentId,
        "parent",
        updatedProfileData,
      );
      logger.debug("Received updated parent profile data", { parentId });

      // Process children data if provided
      if (childrenData && childrenData.length > 0) {
        logger.info("Processing children updates", {
          childCount: childrenData.length,
        });

        // Get existing children to compare
        const existingChildren = await getChildren(parentId);
        const existingChildrenMap = new Map(
          existingChildren.map((child) => [child.id, child]),
        );

        // Process each child in the update data
        for (const childData of childrenData) {
          if (childData.id) {
            // Update existing child
            logger.debug("Updating existing child", { childId: childData.id });
            await updateChild(childData.id, childData);
          } else {
            // Add new child
            logger.debug("Adding new child", {
              childName: `${childData.firstName} ${childData.lastName}`,
            });
            await addChild(parentId, {
              firstName: childData.firstName || "",
              lastName: childData.lastName || "",
              dateOfBirth: childData.dateOfBirth || "",
            });
          }
        }
      }

      logger.info("Successfully updated parent profile", { parentId });
      // Clear any cached profile data to ensure fresh data is fetched
      return data;
    } catch (err) {
      logger.error("Error updating parent profile:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to update parent profile"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed updateParentProfile");
    }
  };

  const updateOrganizerProfile = async (
    organizerId: string,
    profileData: Partial<Organizer>,
  ) => {
    logger.debug("Starting updateOrganizerProfile", {
      organizerId,
      updateFields: Object.keys(profileData),
    });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      // Add updatedAt field to the profile data
      const updatedProfileData = {
        ...profileData,
        updatedAt: new Date().toISOString(),
      };

      logger.info("Calling authAPI.updateUserProfile for organizer", {
        organizerId,
        updateFields: Object.keys(updatedProfileData),
      });
      const data = await authAPI.updateUserProfile(
        organizerId,
        "organizer",
        updatedProfileData,
      );
      logger.debug("Received updated organizer profile data", { organizerId });

      logger.info("Successfully updated organizer profile", { organizerId });
      // Clear any cached profile data to ensure fresh data is fetched
      return data;
    } catch (err) {
      logger.error("Error updating organizer profile:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to update organizer profile"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed updateOrganizerProfile");
    }
  };

  const addChild = async (
    parentId: string,
    childData: Omit<Child, "id" | "parentId">,
  ) => {
    logger.debug("Starting addChild", {
      parentId,
      childData: {
        firstName: childData.firstName,
        lastName: childData.lastName,
      },
    });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      logger.info("Calling parentAPI.addChild", {
        parentId,
        childName: `${childData.firstName} ${childData.lastName}`,
      });
      const data = await parentAPI.addChild(parentId, childData);
      logger.debug("Received new child data", { childId: data.id });

      logger.info("Successfully added child", {
        parentId,
        childId: data.id,
        childName: `${data.firstName} ${data.lastName}`,
      });
      return data;
    } catch (err) {
      logger.error("Error adding child:", err);
      setError(err instanceof Error ? err : new Error("Failed to add child"));
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed addChild");
    }
  };

  const updateChild = async (childId: string, childData: Partial<Child>) => {
    logger.debug("Starting updateChild", {
      childId,
      updateFields: Object.keys(childData),
    });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      logger.info("Calling parentAPI.updateChild", {
        childId,
        updateFields: Object.keys(childData),
      });
      const data = await parentAPI.updateChild(childId, childData);
      logger.debug("Received updated child data", { childId: data.id });

      logger.info("Successfully updated child", {
        childId: data.id,
        childName:
          childData.firstName || childData.lastName
            ? `${childData.firstName || data.firstName} ${childData.lastName || data.lastName}`
            : undefined,
      });
      return data;
    } catch (err) {
      logger.error("Error updating child:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to update child"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed updateChild");
    }
  };

  const deleteChild = async (childId: string) => {
    logger.debug("Starting deleteChild", { childId });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      logger.info("Calling parentAPI.deleteChild", { childId });
      await parentAPI.deleteChild(childId);

      logger.info("Successfully deleted child", { childId });
      return true;
    } catch (err) {
      logger.error("Error deleting child:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to delete child"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed deleteChild");
    }
  };

  const getChildren = async (parentId: string) => {
    logger.debug("Starting getChildren", { parentId });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      logger.info("Calling parentAPI.getChildren", { parentId });
      const data = await parentAPI.getChildren(parentId);
      logger.debug("Received children data", {
        parentId,
        childrenCount: data.length,
        childrenIds: data.map((child) => child.id),
      });

      logger.info("Successfully retrieved children", {
        parentId,
        count: data.length,
      });
      return data;
    } catch (err) {
      logger.error("Error getting children:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to get children"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed getChildren");
    }
  };

  const getParentRegistrations = async (parentId: string) => {
    logger.debug("Starting getParentRegistrations", { parentId });
    try {
      logger.debug("Setting loading state to true");
      setLoading(true);
      setError(null);

      logger.info("Calling parentAPI.getRegistrations", { parentId });
      const data = await parentAPI.getRegistrations(parentId);
      logger.debug("Received parent registrations data", {
        parentId,
        registrationsCount: data.length,
        registrationIds: data.map((reg) => reg.id),
      });

      logger.info("Successfully retrieved parent registrations", {
        parentId,
        count: data.length,
      });
      return data;
    } catch (err) {
      logger.error("Error getting parent registrations:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to get parent registrations"),
      );
      throw err;
    } finally {
      logger.debug("Setting loading state to false");
      setLoading(false);
      logger.debug("Completed getParentRegistrations");
    }
  };

  return {
    loading,
    error,
    updateParentProfile,
    updateOrganizerProfile,
    addChild,
    updateChild,
    deleteChild,
    getChildren,
    getParentRegistrations,
  };
};
