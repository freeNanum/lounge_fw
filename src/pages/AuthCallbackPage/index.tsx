import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/paths";
import { supabase } from "../../shared/lib/supabase/supabaseClient";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const hasCode = new URL(window.location.href).searchParams.get("code");

      if (hasCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          setErrorMessage(error.message);
          return;
        }
      }

      navigate(ROUTE_PATHS.home, { replace: true });
    };

    void run();
  }, [navigate]);

  if (errorMessage) {
    return <h1>Sign-in failed: {errorMessage}</h1>;
  }

  return <h1>Signing in...</h1>;
}
