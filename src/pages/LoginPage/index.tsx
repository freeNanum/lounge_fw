import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/paths";
import { useAuth } from "../../features/auth/AuthProvider";
import { supabase } from "../../shared/lib/supabase/supabaseClient";

interface RedirectState {
  from?: {
    pathname?: string;
  };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectPath = useMemo(() => {
    const state = location.state as RedirectState | null;
    return state?.from?.pathname ?? ROUTE_PATHS.home;
  }, [location.state]);

  useEffect(() => {
    if (!user) {
      return;
    }

    navigate(redirectPath, { replace: true });
  }, [user, navigate, redirectPath]);

  const onEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}${ROUTE_PATHS.authCallback}`,
      },
    });

    setIsSubmitting(false);

    if (error) {
      setStatus(error.message);
      return;
    }

    setStatus("Check your email for a sign-in link.");
  };

  const onGithubLogin = async () => {
    setIsSubmitting(true);
    setStatus(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}${ROUTE_PATHS.authCallback}`,
      },
    });

    if (error) {
      setStatus(error.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <h1 style={{ margin: 0 }}>Sign in</h1>
      <form onSubmit={onEmailSubmit} style={{ display: "grid", gap: "8px" }}>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          required
        />
        <button type="submit" disabled={isSubmitting || !email.trim()}>
          Send magic link
        </button>
      </form>
      <button type="button" onClick={() => void onGithubLogin()} disabled={isSubmitting}>
        Continue with GitHub
      </button>
      {status ? <div style={{ color: "#475569" }}>{status}</div> : null}
    </div>
  );
}
