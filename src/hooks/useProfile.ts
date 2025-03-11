import { useState } from "react";
import { authAPI, parentAPI } from "@/lib/api";
import { Parent, Organizer, Child } from "@/types/models";

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateParentProfile = async (
    parentId: string,
    profileData: Partial<Parent>,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authAPI.updateUserProfile(
        parentId,
        "parent",
        profileData,
      );
      return data;
    } catch (err) {
      console.error("Error updating parent profile:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to update parent profile"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateOrganizerProfile = async (
    organizerId: string,
    profileData: Partial<Organizer>,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await authAPI.updateUserProfile(
        organizerId,
        "organizer",
        profileData,
      );
      return data;
    } catch (err) {
      console.error("Error updating organizer profile:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to update organizer profile"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addChild = async (
    parentId: string,
    childData: Omit<Child, "id" | "parentId">,
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = await parentAPI.addChild(parentId, childData);
      return data;
    } catch (err) {
      console.error("Error adding child:", err);
      setError(err instanceof Error ? err : new Error("Failed to add child"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateChild = async (childId: string, childData: Partial<Child>) => {
    try {
      setLoading(true);
      setError(null);
      const data = await parentAPI.updateChild(childId, childData);
      return data;
    } catch (err) {
      console.error("Error updating child:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to update child"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteChild = async (childId: string) => {
    try {
      setLoading(true);
      setError(null);
      await parentAPI.deleteChild(childId);
      return true;
    } catch (err) {
      console.error("Error deleting child:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to delete child"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getChildren = async (parentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await parentAPI.getChildren(parentId);
      return data;
    } catch (err) {
      console.error("Error getting children:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to get children"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getParentRegistrations = async (parentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await parentAPI.getRegistrations(parentId);
      return data;
    } catch (err) {
      console.error("Error getting parent registrations:", err);
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to get parent registrations"),
      );
      throw err;
    } finally {
      setLoading(false);
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
