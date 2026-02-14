import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../app/router/paths";
import { useSeoMeta } from "../../shared/seo/useSeoMeta";

export function AuthSignupCompletePage() {
  useSeoMeta({
    title: "Signup Complete",
    description: "Your Lounge FW account signup is complete.",
    path: "/auth/signup-complete",
    robots: "noindex,nofollow",
  });

  const navigate = useNavigate();

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <h1 style={{ margin: 0 }}>Signup Complete</h1>
      <p style={{ margin: 0, color: "#334155" }}>Your account has been created successfully.</p>
      <button type="button" onClick={() => navigate(ROUTE_PATHS.home, { replace: true })}>
        Go to Home
      </button>
      <button type="button" onClick={() => navigate(ROUTE_PATHS.authLogin, { replace: true })}>
        Go to Login
      </button>
    </div>
  );
}
