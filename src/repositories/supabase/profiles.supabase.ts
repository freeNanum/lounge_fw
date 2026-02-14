import type { Profile, UpdateProfileInput, UserId } from "../../entities/profile/types";
import type { User } from "@supabase/supabase-js";
import type { ProfilesRepository } from "../interfaces/profiles.repository";
import { supabase } from "../../shared/lib/supabase/supabaseClient";
import { ProfileRow, throwIfError, toProfile } from "./_shared";

function normalizeNickname(raw: string): string {
  const normalized = raw
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "user";
}

function buildDefaultNickname(user: User): string {
  const emailPrefix = user.email?.split("@")[0] ?? "user";
  const metadataNickname =
    typeof user.user_metadata?.nickname === "string" && user.user_metadata.nickname.trim().length > 0
      ? user.user_metadata.nickname
      : emailPrefix;

  const base = normalizeNickname(metadataNickname).slice(0, 23);
  const suffix = user.id.replace(/-/g, "").slice(0, 6);
  const candidate = `${base}_${suffix}`.slice(0, 30);

  return candidate.length >= 2 ? candidate : `user_${suffix}`;
}

class SupabaseProfilesRepository implements ProfilesRepository {
  async getByUserId(userId: UserId): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id,nickname,avatar_url,bio,created_at,updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    throwIfError(error);

    if (!data) {
      return null;
    }

    return toProfile(data as ProfileRow);
  }

  async getByNickname(nickname: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id,nickname,avatar_url,bio,created_at,updated_at")
      .eq("nickname", nickname)
      .maybeSingle();

    throwIfError(error);

    if (!data) {
      return null;
    }

    return toProfile(data as ProfileRow);
  }

  async updateMyProfile(userId: UserId, input: UpdateProfileInput): Promise<Profile> {
    const payload: Record<string, string | null> = {};

    if (input.nickname !== undefined) {
      payload.nickname = input.nickname;
    }
    if (input.avatarUrl !== undefined) {
      payload.avatar_url = input.avatarUrl;
    }
    if (input.bio !== undefined) {
      payload.bio = input.bio;
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("user_id", userId)
      .select("user_id,nickname,avatar_url,bio,created_at,updated_at")
      .single();

    throwIfError(error);

    return toProfile(data as ProfileRow);
  }

  async ensureProfileForUser(user: User): Promise<void> {
    const avatarUrl =
      typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url.trim().length > 0
        ? user.user_metadata.avatar_url
        : null;

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: user.id,
        nickname: buildDefaultNickname(user),
        avatar_url: avatarUrl,
      },
      {
        onConflict: "user_id",
        ignoreDuplicates: true,
      }
    );

    throwIfError(error);
  }
}

export const profilesRepository: ProfilesRepository = new SupabaseProfilesRepository();
