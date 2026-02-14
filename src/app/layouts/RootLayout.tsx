import { Link, Outlet } from "react-router-dom";

export function RootLayout() {
  return (
    <div>
      <header style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <nav style={{ display: "flex", gap: "16px" }}>
          <Link to="/">Home</Link>
          <Link to="/search">Search</Link>
          <Link to="/write">Write</Link>
          <Link to="/me">My Page</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
