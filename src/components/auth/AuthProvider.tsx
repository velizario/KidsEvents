import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const checkUser = useAuthStore((state) => state.checkUser);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  return <>{children}</>;
};
