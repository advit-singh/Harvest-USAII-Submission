"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { setMockUser } from "@/lib/api/users";
import type { User } from "@supabase/supabase-js";

const DEV_SESSION_KEY = "harvest-dev-session";

function readDevUser(): User | null {
  if (typeof window === "undefined") return null;
  const devSession = localStorage.getItem(DEV_SESSION_KEY);
  if (!devSession) return null;
  const parsed = JSON.parse(devSession) as {
    email: string;
    fullName?: string;
  };
  setMockUser({
    id: "user_dev",
    email: parsed.email,
    fullName: parsed.fullName,
  });
  return { id: "user_dev", email: parsed.email } as User;
}

function setDevSession(email: string, fullName?: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(DEV_SESSION_KEY, JSON.stringify({ email, fullName }));
    document.cookie = `harvest-dev-auth=1; path=/; max-age=604800; SameSite=Lax`;
    setMockUser({
      id: "user_dev",
      email,
      fullName: fullName ?? email.split("@")[0],
    });
  }
}

export function clearDevSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEV_SESSION_KEY);
    document.cookie =
      "harvest-dev-auth=; path=/; max-age=0; SameSite=Lax";
  }
}

export function useAuth() {
  const router = useRouter();
  const supabaseReady = isSupabaseConfigured();
  const [user, setUser] = useState<User | null>(() =>
    supabaseReady ? null : readDevUser(),
  );
  const [loading, setLoading] = useState(supabaseReady);

  useEffect(() => {
    if (!supabaseReady) {
      return;
    }

    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data: { user: currentUser } }) => {
      if (!mounted) return;
      setUser(currentUser);
      if (currentUser?.email) {
        setMockUser({
          id: currentUser.id,
          email: currentUser.email,
          fullName: currentUser.user_metadata?.full_name,
        });
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabaseReady]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabaseReady) {
        setDevSession(email);
        setUser({ id: "user_dev", email } as User);
        router.push("/dashboard");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/dashboard");
    },
    [router, supabaseReady],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!supabaseReady) {
        setDevSession(email, fullName);
        setUser({ id: "user_dev", email } as User);
        router.push("/onboarding");
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      router.push("/onboarding");
    },
    [router, supabaseReady],
  );

  const resetPassword = useCallback(
    async (email: string) => {
      if (!supabaseReady) {
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    [supabaseReady],
  );

  const signOut = useCallback(async () => {
    if (!supabaseReady) {
      clearDevSession();
      setUser(null);
      router.push("/login");
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router, supabaseReady]);

  return {
    user,
    loading,
    signIn,
    signUp,
    resetPassword,
    signOut,
    isAuthenticated: Boolean(user),
    supabaseReady,
  };
}
