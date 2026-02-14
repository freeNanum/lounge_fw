import { useQuery } from "@tanstack/react-query";
import { postsRepository } from "../../repositories/supabase";
import { useAuth } from "../auth/AuthProvider";

export function usePostDetail(postId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["posts", "detail", postId, user?.id ?? null],
    queryFn: () =>
      postsRepository.getById(postId as string, {
        viewerId: user?.id ?? null,
      }),
    enabled: Boolean(postId),
  });
}
