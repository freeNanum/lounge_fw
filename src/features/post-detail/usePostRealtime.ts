import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../shared/lib/supabase/supabaseClient";

export function usePostRealtime(postId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) {
      return;
    }

    const invalidate = () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["posts", "detail", postId] }),
        queryClient.invalidateQueries({ queryKey: ["comments", "post", postId] }),
        queryClient.invalidateQueries({ queryKey: ["likes", "status", postId] }),
        queryClient.invalidateQueries({ queryKey: ["posts", "feed"] }),
      ]);
    };

    const commentsChannel = supabase
      .channel(`post:${postId}:comments`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        invalidate
      )
      .subscribe();

    const likesChannel = supabase
      .channel(`post:${postId}:likes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "post_likes",
          filter: `post_id=eq.${postId}`,
        },
        invalidate
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(commentsChannel);
      void supabase.removeChannel(likesChannel);
    };
  }, [postId, queryClient]);
}
