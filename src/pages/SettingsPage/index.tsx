import { FormEvent, useEffect, useState, type CSSProperties } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { profilesRepository } from "../../repositories/supabase";
import { useAuth } from "../../features/auth/AuthProvider";

export function SettingsPage() {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id ?? null],
    queryFn: () => profilesRepository.getByUserId(user?.id as string),
    enabled: Boolean(user?.id),
  });

  const updateMutation = useMutation({
    mutationFn: ({ nickname, bio, avatarUrl }: { nickname: string; bio: string; avatarUrl: string }) =>
      profilesRepository.updateMyProfile(user?.id as string, {
        nickname,
        bio,
        avatarUrl: avatarUrl.trim() || null,
      }),
  });

  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const fieldContainerStyle: CSSProperties = {
    display: "grid",
    gap: "6px",
  };

  const fieldBaseStyle: CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
  };

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    setNickname(profileQuery.data.nickname);
    setBio(profileQuery.data.bio);
    setAvatarUrl(profileQuery.data.avatarUrl ?? "");
  }, [profileQuery.data]);

  if (!user) {
    return <h1>Not signed in.</h1>;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateMutation.mutateAsync({ nickname, bio, avatarUrl });
    await profileQuery.refetch();
  };

  return (
    <div style={{ display: "grid", gap: "14px", maxWidth: "720px" }}>
      <h1 style={{ margin: 0 }}>Settings</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "12px", background: "#fff", border: "1px solid #e2e8f0", padding: "14px" }}>
        <label style={fieldContainerStyle}>
          Nickname
          <input
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
            minLength={2}
            maxLength={30}
            style={fieldBaseStyle}
            required
          />
        </label>
        <label style={fieldContainerStyle}>
          Bio
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={300}
            rows={4}
            style={{ ...fieldBaseStyle, minHeight: "120px", resize: "vertical" }}
          />
        </label>
        <label style={fieldContainerStyle}>
          Avatar URL
          <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} style={fieldBaseStyle} />
        </label>
        <button type="submit" disabled={updateMutation.isPending || profileQuery.isLoading} style={{ width: "fit-content", padding: "10px 14px" }}>
          {updateMutation.isPending ? "Saving..." : "Save Profile"}
        </button>
      </form>
      {profileQuery.isError ? <div>Failed to load profile.</div> : null}
      {updateMutation.isError ? <div>Failed to update profile.</div> : null}
    </div>
  );
}
