import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { useAuthStateListener } from "./useAuthStateListener";
import { authRepository, profilesRepository } from "../../repositories/supabase";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isInitializing: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useAuthStateListener((event, nextSession) => {
    setSession(nextSession);
    setIsInitializing(false);

    if (!nextSession?.user) {
      return;
    }

    if (event !== "SIGNED_IN" && event !== "INITIAL_SESSION") {
      return;
    }

    void profilesRepository.ensureProfileForUser(nextSession.user).catch(() => undefined);
  });

  const signOut = useCallback(async () => {
    await authRepository.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isInitializing,
      signOut,
    }),
    [session, isInitializing, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
