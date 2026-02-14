import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/paths";
import { authRepository } from "../../repositories/supabase";
import { useSeoMeta } from "../../shared/seo/useSeoMeta";

function isPkceVerifierMissingError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("code verifier") && normalized.includes("non-empty");
}

export function AuthCallbackPage() {
  useSeoMeta({
    title: "Auth Callback",
    description: "Authentication callback processing.",
    path: "/auth/callback",
    robots: "noindex,nofollow",
  });

  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const url = new URL(window.location.href);
      const hasCode = url.searchParams.get("code");
      const flow = url.searchParams.get("flow");
      const error = url.searchParams.get("error");
      const errorDescription = url.searchParams.get("error_description");
      const isSignupFlow = flow === "signup";

      if (error) {
        setErrorMessage(errorDescription ?? "Authentication callback failed.");
        return;
      }

      if (hasCode) {
        try {
          await authRepository.exchangeCodeForSession(window.location.href);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to finish sign-in.";
          if (!isSignupFlow || !isPkceVerifierMissingError(message)) {
            setErrorMessage(message);
            return;
          }
        }
      }

      if (isSignupFlow) {
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
