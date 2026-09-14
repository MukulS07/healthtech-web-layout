import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentUserFn, logoutFn } from "@/lib/server-functions/auth";
import type { PublicUser } from "@/lib/auth";

export const CURRENT_USER_KEY = ["current-user"] as const;

export function useCurrentUser() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: () => getCurrentUserFn(),
    staleTime: 60_000,
  });

  const setUser = (user: PublicUser | null) => {
    queryClient.setQueryData(CURRENT_USER_KEY, user);
    queryClient.invalidateQueries({ queryKey: ["my-consultations"] });
  };

  const logout = async () => {
    await logoutFn();
    setUser(null);
  };

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    setUser,
    logout,
  };
}
