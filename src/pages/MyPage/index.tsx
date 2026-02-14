import { useAuth } from "../../features/auth/AuthProvider";

export function MyPage() {
  const { user, signOut } = useAuth();

  if (!user) {
    return <h1>Not signed in.</h1>;
  }

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <h1 style={{ margin: 0 }}>My Page</h1>
      <div>User ID: {user.id}</div>
      <div>Email: {user.email}</div>
      <button type="button" onClick={() => void signOut()}>
        Sign out
      </button>
    </div>
  );
}
