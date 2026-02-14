import { useQuery } from "@tanstack/react-query";
import type { PostSort, PostType } from "../../entities/post/types";
import { postsRepository } from "../../repositories/supabase";
import { useAuth } from "../auth/AuthProvider";

interface UseFeedPostsParams {
  type?: PostType;
  tag?: string;
  q?: string;
  sort?: PostSort;
  limit?: number;
  cursor?: string | null;
}

export function useFeedPosts(params: UseFeedPostsParams) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["posts", "feed", params, user?.id ?? null],
    queryFn: () =>
      postsRepository.listFeed(
        {
          type: params.type,
          tag: params.tag,
          q: params.q,
          sort: params.sort,
          limit: params.limit ?? 20,
          cursor: params.cursor ?? null,
        },
        {
          viewerId: user?.id ?? null,
        }
      ),
  });
}
