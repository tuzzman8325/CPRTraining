import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/user", {
        credentials: "include",
      });

      // Return null on 401 (not authenticated) instead of throwing
      if (res.status === 401) {
        return null;
      }

      // Throw on other errors
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }

      return await res.json();
    },
    retry: false,
  });

  const isAuthenticated = !!user;

  return {
    user: isAuthenticated ? user : null,
    isLoading,
    isAuthenticated,
    isAdmin: isAuthenticated && user?.role === "admin",
  };
}