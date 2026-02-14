import type { Profile, UpdateProfileInput, UserId } from "../../entities/profile/types";

export interface ProfilesRepository {
  getByUserId(userId: UserId): Promise<Profile | null>;
  getByNickname(nickname: string): Promise<Profile | null>;
  updateMyProfile(userId: UserId, input: UpdateProfileInput): Promise<Profile>;
}
