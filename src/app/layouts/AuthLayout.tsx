import { Outlet } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";

export function AuthLayout() {
  return (
    <div>
      <AppHeader />
      <main style={{ maxWidth: "420px", margin: "48px auto", padding: "0 16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
