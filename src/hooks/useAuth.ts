import { trpc } from "@/providers/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { LOGIN_PATH } from "@/const";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } =
    options ?? {};

  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseLoaded, setFirebaseLoaded] = useState(false);

  useEffect(() => {
    console.log("[useAuth] Initializing onAuthStateChanged listener...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[useAuth] onAuthStateChanged fired. User:", user?.email || "null");
      setFirebaseUser(user);
      setFirebaseLoaded(true);
    });
    return unsubscribe;
  }, []);

  const {
    data: dbUser,
    isLoading: apiLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: firebaseLoaded && !!firebaseUser,
  });

  useEffect(() => {
    if (error) {
      console.error("[useAuth] auth.me query failed:", error);
    }
  }, [error]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      navigate(redirectPath);
    },
  });

  const logout = useCallback(async () => {
    await auth.signOut();
    logoutMutation.mutate();
  }, [logoutMutation]);

  const user = dbUser ?? (firebaseUser ? ({ id: firebaseUser.uid, name: firebaseUser.displayName, email: firebaseUser.email, avatar: firebaseUser.photoURL } as any) : null);
  const isLoading = (!firebaseLoaded) || (apiLoading && !!firebaseUser);

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && !user) {
      const currentPath = window.location.pathname;
      if (currentPath !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [redirectOnUnauthenticated, isLoading, user, navigate, redirectPath]);

  return useMemo(
    () => ({
      user: user ?? null,
      isAuthenticated: !!user,
      isLoading: isLoading || logoutMutation.isPending,
      error,
      logout,
      refresh: refetch,
    }),
    [user, isLoading, logoutMutation.isPending, error, logout, refetch],
  );
}
