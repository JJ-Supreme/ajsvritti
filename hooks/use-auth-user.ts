"use client";

import { useCallback, useEffect, useState } from "react";

export type ClientAuthUser = {
  id: string;
  email: string;
  username: string;
  role: string;
  imageUrl: string | null;
};

export function useAuthUser() {
  const [user, setUser] = useState<ClientAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();
        if (!cancelled) {
          setUser(data.user || null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const refetch = useCallback(() => {
    setFetchKey((k) => k + 1);
  }, []);

  return {
    user,
    isLoading,
    isSignedIn: !!user,
    refetch,
  };
}
