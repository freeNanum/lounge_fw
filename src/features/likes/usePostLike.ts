import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { likesRepository } from "../../repositories/supabase";
import { useAuth } from "../auth/AuthProvider";

export function usePostLikeStatus(postId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["likes", "status", postId, user?.id ?? null],
    queryFn: () => likesRepository.getPostLikeStatus(postId as string, user?.id as string),
    enabled: Boolean(postId && user?.id),
  });
}

export function useTogglePostLike(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (liked: boolean) => {
      if (!user?.id) {
        throw new Error("Login required");
      }

      if (liked) {
        return likesRepository.unlike(postId, user.id);
      }

      return likesRepository.like(postId, user.id);
    },
    onSuccess: () => {
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: ["likes", "status", postId] }),
        queryClient.invalidateQueries({ queryKey: ["posts", "detail", postId] }),
        queryClient.invalidateQueries({ queryKey: ["posts", "feed"] }),
      ]).then(() => undefined);
    },
  });
}
