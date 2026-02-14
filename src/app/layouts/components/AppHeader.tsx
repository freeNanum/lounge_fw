import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "../../router/paths";
import { useAuth } from "../../../features/auth/AuthProvider";

export function AppHeader() {
  const { user, signOut } = useAuth();

  return (
    <header style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <nav style={{ display: "flex", gap: "16px" }}>
          <Link to={ROUTE_PATHS.home}>Home</Link>
          <Link to={ROUTE_PATHS.search}>Search</Link>
          <Link to={ROUTE_PATHS.write}>Write</Link>
          <Link to={ROUTE_PATHS.myPage}>My Page</Link>
          <Link to={ROUTE_PATHS.settings}>Settings</Link>
        </nav>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {user ? (
            <>
              <span style={{ fontSize: "14px", color: "#475569" }}>{user.email}</span>
              <button type="button" onClick={() => void signOut()}>
                Sign out
              </button>
            </>
          ) : (
            <Link to={ROUTE_PATHS.authLogin}>Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
