import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "../paths";
import { useAuth } from "../../../features/auth/AuthProvider";

export function RequireAuth() {
  const { isInitializing, user } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <div>Loading auth...</div>;
  }

  if (!user) {
    return <Navigate to={ROUTE_PATHS.authLogin} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
