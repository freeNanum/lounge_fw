import type {
  CommentItem,
  CreateCommentInput,
  UpdateCommentInput,
} from "../../entities/comment/types";
import type { CursorPage, CursorRequest } from "./common";

export interface CommentsRepository {
  listByPost(postId: string, query: CursorRequest): Promise<CursorPage<CommentItem>>;
  create(authorId: string, input: CreateCommentInput): Promise<CommentItem>;
  update(commentId: string, authorId: string, input: UpdateCommentInput): Promise<CommentItem>;
  remove(commentId: string, authorId: string): Promise<void>;
}
