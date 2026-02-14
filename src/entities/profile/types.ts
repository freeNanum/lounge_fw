export type UserId = string;

export interface Profile {
  userId: UserId;
  nickname: string;
  avatarUrl: string | null;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilePreview {
  userId: UserId;
  nickname: string;
  avatarUrl: string | null;
}

export interface UpdateProfileInput {
  nickname?: string;
  avatarUrl?: string | null;
  bio?: string;
}
