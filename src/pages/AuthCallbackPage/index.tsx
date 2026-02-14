import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/paths";
import { authRepository } from "../../repositories/supabase";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      const hasCode = url.searchParams.get("code");
      const flow = url.searchParams.get("flow");

      if (hasCode) {
        try {
          await authRepository.exchangeCodeForSession(window.location.href);
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to finish sign-in.");
          return;
        }
      }

      if (flow === "signup") {
        navigate(ROUTE_PATHS.authSignupComplete, { replace: true });
        return;
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
