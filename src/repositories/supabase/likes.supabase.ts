import type { PostLikeStatus, ToggleLikeResult } from "../../entities/like/types";
import type { LikesRepository } from "../interfaces/likes.repository";
import { supabase } from "../../shared/lib/supabase/supabaseClient";
import { PostRow, throwIfError } from "./_shared";

class SupabaseLikesRepository implements LikesRepository {
  async getPostLikeStatus(postId: string, viewerId: string): Promise<PostLikeStatus> {
    const [{ data: postRow, error: postError }, { data: likeRow, error: likeError }] = await Promise.all([
      supabase.from("posts").select("id,like_count").eq("id", postId).single(),
      supabase
        .from("post_likes")
        .select("post_id")
        .eq("post_id", postId)
        .eq("user_id", viewerId)
        .maybeSingle(),
    ]);

    throwIfError(postError);
    throwIfError(likeError);

    return {
      postId,
      likedByViewer: Boolean(likeRow),
      likeCount: (postRow as Pick<PostRow, "like_count">).like_count,
    };
  }

  async like(postId: string, viewerId: string): Promise<ToggleLikeResult> {
    const { error } = await supabase.from("post_likes").upsert({ post_id: postId, user_id: viewerId });
    throwIfError(error);

    return this.resolveToggleResult(postId, viewerId);
  }

  async unlike(postId: string, viewerId: string): Promise<ToggleLikeResult> {
    const { error } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", viewerId);
    throwIfError(error);

    return this.resolveToggleResult(postId, viewerId);
  }

  private async resolveToggleResult(postId: string, viewerId: string): Promise<ToggleLikeResult> {
    const status = await this.getPostLikeStatus(postId, viewerId);

    return {
      postId,
      likedByViewer: status.likedByViewer,
      likeCount: status.likeCount,
    };
  }
}

export const likesRepository: LikesRepository = new SupabaseLikesRepository();
