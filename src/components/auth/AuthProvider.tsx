import { AuthProvider as SupabaseAuthProvider } from "@/context/AuthContext";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
};
