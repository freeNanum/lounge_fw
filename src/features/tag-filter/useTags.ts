import { useQuery } from "@tanstack/react-query";
import { tagsRepository } from "../../repositories/supabase";

export function usePopularTags(limit = 10) {
  return useQuery({
    queryKey: ["tags", "popular", limit],
    queryFn: () => tagsRepository.listPopular(limit),
  });
}

export function useTagSearch(keyword: string, limit = 10) {
  return useQuery({
    queryKey: ["tags", "search", keyword, limit],
    queryFn: () => tagsRepository.searchByPrefix(keyword, limit),
    enabled: keyword.trim().length > 0,
  });
}
