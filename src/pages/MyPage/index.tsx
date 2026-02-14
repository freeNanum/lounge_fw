import { useAuth } from "../../features/auth/AuthProvider";
import { useSeoMeta } from "../../shared/seo/useSeoMeta";

export function MyPage() {
  useSeoMeta({
    title: "My Page",
    description: "Manage your account information in Lounge FW.",
    path: "/me",
    robots: "noindex,nofollow",
  });

  const { user, signOut } = useAuth();

  if (!user) {
    return <h1>Not signed in.</h1>;
  }

  return (
    <div style={{ display: "grid", gap: "14px", maxWidth: "720px" }}>
      <h1 style={{ margin: 0 }}>My Page</h1>
      <section style={{ display: "grid", gap: "10px", background: "#fff", border: "1px solid #e2e8f0", padding: "14px" }}>
        <div>User ID: {user.id}</div>
        <div>Email: {user.email}</div>
        <button type="button" onClick={() => void signOut()} style={{ width: "fit-content", padding: "10px 14px" }}>
          Sign out
        </button>
      </section>
    </div>
  );
}
