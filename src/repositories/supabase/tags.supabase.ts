import type { Tag, TagSummary } from "../../entities/tag/types";
import type { TagsRepository } from "../interfaces/tags.repository";
import { supabase } from "../../shared/lib/supabase/supabaseClient";
import { PostTagRow, TagRow, throwIfError, toTag } from "./_shared";

class SupabaseTagsRepository implements TagsRepository {
  async listAll(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from("tags")
      .select("id,name,description,created_at")
      .order("name", { ascending: true });

    throwIfError(error);

    return ((data ?? []) as TagRow[]).map(toTag);
  }

  async listPopular(limit: number): Promise<TagSummary[]> {
    const safeLimit = Math.max(limit, 1);
    const { data: tagRows, error: tagError } = await supabase
      .from("tags")
      .select("id,name")
      .order("name", { ascending: true });

    throwIfError(tagError);

    const { data: links, error: linkError } = await supabase.from("post_tags").select("post_id,tag_id");
    throwIfError(linkError);

    const counts = new Map<string, number>();
    for (const link of (links ?? []) as PostTagRow[]) {
      counts.set(link.tag_id, (counts.get(link.tag_id) ?? 0) + 1);
    }

    return ((tagRows ?? []) as Array<{ id: string; name: string }>)
      .map((row) => ({
        id: row.id,
        name: row.name,
        postCount: counts.get(row.id) ?? 0,
      }))
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, safeLimit);
  }

  async searchByPrefix(keyword: string, limit: number): Promise<Tag[]> {
    const safeLimit = Math.max(limit, 1);
    const normalized = keyword.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    const { data, error } = await supabase
      .from("tags")
      .select("id,name,description,created_at")
      .ilike("name", `${normalized}%`)
      .order("name", { ascending: true })
      .limit(safeLimit);

    throwIfError(error);

    return ((data ?? []) as TagRow[]).map(toTag);
  }

  async listByPost(postId: string): Promise<Tag[]> {
    const { data: links, error: linkError } = await supabase
      .from("post_tags")
      .select("tag_id")
      .eq("post_id", postId);

    throwIfError(linkError);

    const tagIds = [...new Set(((links ?? []) as Array<{ tag_id: string }>).map((item) => item.tag_id))];
    if (tagIds.length === 0) {
      return [];
    }

    const { data: rows, error: rowError } = await supabase
      .from("tags")
      .select("id,name,description,created_at")
      .in("id", tagIds)
      .order("name", { ascending: true });

    throwIfError(rowError);
    return ((rows ?? []) as TagRow[]).map(toTag);
  }

  async replaceForOwnedPost(postId: string, ownerId: string, tagNames: string[]): Promise<Tag[]> {
    const normalizedNames = [...new Set(tagNames.map((name) => name.trim().toLowerCase()).filter(Boolean))];

    const { data: postRow, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .eq("author_id", ownerId)
      .maybeSingle();

    throwIfError(postError);

    if (!postRow) {
      throw new Error("Post not found or no permission to update tags");
    }

    const { error: deleteError } = await supabase.from("post_tags").delete().eq("post_id", postId);
    throwIfError(deleteError);

    if (normalizedNames.length === 0) {
      return [];
    }

    const { data: existingTagRows, error: existingTagError } = await supabase
      .from("tags")
      .select("id,name,description,created_at")
      .in("name", normalizedNames);
    throwIfError(existingTagError);

    const existingRows = (existingTagRows ?? []) as TagRow[];
    const existingNames = new Set(existingRows.map((row) => row.name));
    const missingNames = normalizedNames.filter((name) => !existingNames.has(name));

    if (missingNames.length > 0) {
      const { error: insertTagError } = await supabase
        .from("tags")
        .insert(missingNames.map((name) => ({ name })));
      throwIfError(insertTagError);
    }

    const { data: finalTagRows, error: finalTagError } = await supabase
      .from("tags")
      .select("id,name,description,created_at")
      .in("name", normalizedNames);
    throwIfError(finalTagError);

    const tags = (finalTagRows ?? []) as TagRow[];

    const { error: postTagsError } = await supabase.from("post_tags").insert(
      tags.map((tag) => ({
        post_id: postId,
        tag_id: tag.id,
      }))
    );
    throwIfError(postTagsError);

    return tags.map(toTag).sort((a, b) => a.name.localeCompare(b.name));
  }
}

export const tagsRepository: TagsRepository = new SupabaseTagsRepository();
