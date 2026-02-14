import type { PostLikeStatus, ToggleLikeResult } from "../../entities/like/types";

export interface LikesRepository {
  getPostLikeStatus(postId: string, viewerId: string): Promise<PostLikeStatus>;
  like(postId: string, viewerId: string): Promise<ToggleLikeResult>;
  unlike(postId: string, viewerId: string): Promise<ToggleLikeResult>;
}
