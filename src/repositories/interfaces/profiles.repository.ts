import type { Profile, UpdateProfileInput, UserId } from "../../entities/profile/types";
import type { User } from "@supabase/supabase-js";

export interface ProfilesRepository {
  getByUserId(userId: UserId): Promise<Profile | null>;
  getByNickname(nickname: string): Promise<Profile | null>;
  updateMyProfile(userId: UserId, input: UpdateProfileInput): Promise<Profile>;
  ensureProfileForUser(user: User): Promise<void>;
}
