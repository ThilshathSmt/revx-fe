// src/hooks/useAuth.js
import { useSession } from "next-auth/react";

export const useAuth = () => {
  const { data: session } = useSession();

  return {
    user: session?.user || null,
  };
};
