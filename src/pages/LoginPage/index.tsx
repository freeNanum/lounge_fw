import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/paths";
import { useAuth } from "../../features/auth/AuthProvider";
import { authRepository } from "../../repositories/supabase";

interface RedirectState {
  from?: {
    pathname?: string;
  };
}

type AuthMode = "login" | "signup";

function toAuthErrorMessage(error: unknown, mode: AuthMode): string {
  const fallback = mode === "login" ? "Failed to sign in." : "Failed to create account.";
  const message = error instanceof Error ? error.message : fallback;

  if (message.toLowerCase().includes("invalid api key")) {
    return "Supabase API key is invalid. Check Vercel env vars: VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) and redeploy.";
  }

  return message;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    const state = location.state as RedirectState | null;
    return state?.from?.pathname ?? ROUTE_PATHS.home;
  }, [location.state]);

  const authCallbackUrl = `${window.location.origin}${ROUTE_PATHS.authCallback}`;

  useEffect(() => {
    if (!user) {
      return;
    }

    navigate(redirectPath, { replace: true });
  }, [user, navigate, redirectPath]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      if (mode === "login") {
        await authRepository.signInWithPassword(email.trim(), password);
      } else {
        await authRepository.signUpWithPassword(email.trim(), password, {
          emailRedirectTo: authCallbackUrl,
        });
        setStatus("Account created. If email confirmation is enabled, please verify your inbox.");
      }
    } catch (error) {
      setStatus(toAuthErrorMessage(error, mode));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
  };

  const onGithubLogin = async () => {
    setIsSubmitting(true);
    setStatus(null);

    try {
      await authRepository.signInWithGithub(authCallbackUrl);
    } catch (error) {
      setStatus(toAuthErrorMessage(error, "login"));
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <h1 style={{ margin: 0 }}>{mode === "login" ? "Sign in" : "Create account"}</h1>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setStatus(null);
          }}
          disabled={mode === "login"}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setStatus(null);
          }}
          disabled={mode === "signup"}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "8px" }}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          minLength={6}
          required
        />
        <button type="submit" disabled={isSubmitting || !email.trim() || password.length < 6}>
          {mode === "login" ? "Sign in with email" : "Create account"}
        </button>
      </form>

      <button type="button" onClick={() => void onGithubLogin()} disabled={isSubmitting}>
        Continue with GitHub
      </button>
      {status ? <div style={{ color: "#475569" }}>{status}</div> : null}
    </div>
  );
}
