import type { Tag, TagSummary } from "../../entities/tag/types";

export interface TagsRepository {
  listAll(): Promise<Tag[]>;
  listPopular(limit: number): Promise<TagSummary[]>;
  searchByPrefix(keyword: string, limit: number): Promise<Tag[]>;
  listByPost(postId: string): Promise<Tag[]>;
  replaceForOwnedPost(postId: string, ownerId: string, tagNames: string[]): Promise<Tag[]>;
}
