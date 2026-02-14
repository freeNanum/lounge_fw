import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthProvider";

export function RootLayout() {
  const { user, signOut } = useAuth();

  return (
    <div>
      <header style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <nav style={{ display: "flex", gap: "16px" }}>
            <Link to="/">Home</Link>
            <Link to="/search">Search</Link>
            <Link to="/write">Write</Link>
            <Link to="/me">My Page</Link>
            <Link to="/settings">Settings</Link>
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
              <Link to="/auth/login">Sign in</Link>
            )}
          </div>
        </div>
      </header>
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
