import { useQuery } from "@tanstack/react-query";
import { postsRepository } from "../../repositories/supabase";
import { useAuth } from "../auth/AuthProvider";

interface UseSearchPostsParams {
  queryText: string;
  limit?: number;
  cursor?: string | null;
}

export function useSearchPosts({ queryText, limit = 20, cursor = null }: UseSearchPostsParams) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["posts", "search", queryText, limit, cursor, user?.id ?? null],
    queryFn: () =>
      postsRepository.search(
        queryText,
        {
          limit,
          cursor,
        },
        {
          viewerId: user?.id ?? null,
        }
      ),
    enabled: queryText.trim().length > 0,
  });
}
