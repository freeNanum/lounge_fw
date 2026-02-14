import type { PostLikeStatus, ToggleLikeResult } from "../../entities/like/types";
import type { LikesRepository } from "../interfaces/likes.repository";
import { supabase } from "../../shared/lib/supabase/supabaseClient";
import { throwIfError } from "./_shared";

class SupabaseLikesRepository implements LikesRepository {
  async getPostLikeStatus(postId: string, viewerId: string): Promise<PostLikeStatus> {
    const [{ error: postError }, { data: likeRow, error: likeError }, { count: likeCount, error: likeCountError }] =
      await Promise.all([
        supabase.from("posts").select("id").eq("id", postId).single(),
        supabase
          .from("post_likes")
          .select("post_id")
          .eq("post_id", postId)
          .eq("user_id", viewerId)
          .maybeSingle(),
        supabase.from("post_likes").select("post_id", { count: "exact", head: true }).eq("post_id", postId),
      ]);

    throwIfError(postError);
    throwIfError(likeError);
    throwIfError(likeCountError);

    return {
      postId,
      likedByViewer: Boolean(likeRow),
      likeCount: likeCount ?? 0,
    };
  }

  async like(postId: string, viewerId: string): Promise<ToggleLikeResult> {
    const { error } = await supabase.from("post_likes").upsert(
      { post_id: postId, user_id: viewerId },
      {
        onConflict: "post_id,user_id",
        ignoreDuplicates: true,
      }
    );
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
