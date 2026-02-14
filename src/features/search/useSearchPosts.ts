import { useQuery } from "@tanstack/react-query";
import { postsRepository } from "../../repositories/supabase";
import { useAuth } from "../auth/AuthProvider";

interface UseSearchPostsParams {
  queryText: string;
  tags?: string[];
  limit?: number;
  cursor?: string | null;
}

export function useSearchPosts({ queryText, tags, limit = 20, cursor = null }: UseSearchPostsParams) {
  const { user } = useAuth();
  const normalizedQueryText = queryText.trim();
  const normalizedTags = tags ?? [];

  return useQuery({
    queryKey: ["posts", "search", normalizedQueryText, normalizedTags, limit, cursor, user?.id ?? null],
    queryFn: () =>
      postsRepository.search(
        normalizedQueryText,
        {
          tags: normalizedTags,
          limit,
          cursor,
        },
        {
          viewerId: user?.id ?? null,
        }
      ),
    enabled: normalizedQueryText.length > 0 || normalizedTags.length > 0,
  });
}
