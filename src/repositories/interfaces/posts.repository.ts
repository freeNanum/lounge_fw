import type {
  CreatePostInput,
  PostDetail,
  PostSort,
  PostSummary,
  PostType,
  UpdatePostInput,
} from "../../entities/post/types";
import type { CursorPage, CursorRequest, RequestContext } from "./common";

export interface ListPostsQuery extends CursorRequest {
  type?: PostType;
  tag?: string;
  q?: string;
  sort?: PostSort;
}

export interface PostsRepository {
  listFeed(query: ListPostsQuery, context?: RequestContext): Promise<CursorPage<PostSummary>>;
  listByTag(tagName: string, query: CursorRequest, context?: RequestContext): Promise<CursorPage<PostSummary>>;
  search(queryText: string, query: CursorRequest, context?: RequestContext): Promise<CursorPage<PostSummary>>;
  getById(postId: string, context?: RequestContext): Promise<PostDetail | null>;
  create(authorId: string, input: CreatePostInput): Promise<PostDetail>;
  update(postId: string, authorId: string, input: UpdatePostInput): Promise<PostDetail>;
  remove(postId: string, authorId: string): Promise<void>;
}
