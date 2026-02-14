import type { Profile, UpdateProfileInput, UserId } from "../../entities/profile/types";
import type { ProfilesRepository } from "../interfaces/profiles.repository";
import { supabase } from "../../shared/lib/supabase/supabaseClient";
import { ProfileRow, throwIfError, toProfile } from "./_shared";

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
}

export const profilesRepository: ProfilesRepository = new SupabaseProfilesRepository();
