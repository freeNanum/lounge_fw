import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <main style={{ maxWidth: "420px", margin: "48px auto", padding: "0 16px" }}>
      <Outlet />
    </main>
  );
}
