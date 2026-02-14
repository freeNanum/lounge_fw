import { useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { supabase } from "../../shared/lib/supabase/supabaseClient";

export type AuthStateListener = (event: AuthChangeEvent, session: Session | null) => void;

export function useAuthStateListener(onSessionChange: AuthStateListener): void {
  useEffect(() => {
    let isActive = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!isActive) {
        return;
      }

      onSessionChange("INITIAL_SESSION", data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      onSessionChange(_event, session);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [onSessionChange]);
}
