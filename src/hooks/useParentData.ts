import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { parentAPI } from "@/lib/api";
import { Child, Registration } from "@/types/models";

export const useParentData = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  useEffect(() => {
    const fetchParentData = async () => {
      if (!user || user.userType !== "parent") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch children
        const childrenData = await parentAPI.getChildren(user.id);
        setChildren(childrenData);

        // Fetch registrations
        const registrationsData = await parentAPI.getRegistrations(user.id);
        setRegistrations(registrationsData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching parent data:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch parent data"),
        );
        setLoading(false);
      }
    };

    fetchParentData();
  }, [user]);

  return {
    loading,
    error,
    children,
    registrations,
    parentName: user ? `${user.firstName} ${user.lastName}` : "",
    parentId: user?.id,
  };
};
