import { Outlet } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";

export function RootLayout() {
  return (
    <div>
      <AppHeader />
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "24px 16px" }}>
        <Outlet />
      </main>
    </div>
  );
}
