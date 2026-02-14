import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { PostType } from "../../entities/post/types";
import { useAuth } from "../../features/auth/AuthProvider";
import { usePostDetail } from "../../features/post-detail/usePostDetail";
import { PostTagSelector } from "../../features/post-editor/components/PostTagSelector";
import { useDeletePost, useUpdatePost } from "../../features/post-editor/usePostMutations";

export function PostEditPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const postQuery = usePostDetail(postId);
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const [type, setType] = useState<PostType>("question");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagNames, setTagNames] = useState<string[]>([]);

  useEffect(() => {
    if (!postQuery.data) {
      return;
    }

    setType(postQuery.data.type);
    setTitle(postQuery.data.title);
    setBody(postQuery.data.body);
    setTagNames(postQuery.data.tags.map((tag) => tag.name));
  }, [postQuery.data]);

  if (!postId) {
    return <div>Invalid post id.</div>;
  }

  if (postQuery.isLoading) {
    return <div>Loading post...</div>;
  }

  if (!postQuery.data) {
    return <div>Post not found.</div>;
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) {
      return;
    }

    const updated = await updatePost.mutateAsync({
      postId,
      authorId: user.id,
      input: {
        type,
        title,
        body,
        tagNames,
      },
    });

    navigate(`/posts/${updated.id}`);
  };

  const onDelete = async () => {
    if (!user?.id) {
      return;
    }

    await deletePost.mutateAsync({
      postId,
      authorId: user.id,
    });

    navigate("/");
  };

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <h1 style={{ margin: 0 }}>Edit Post</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "10px", maxWidth: "760px" }}>
        <label>
          Type
          <select value={type} onChange={(event) => setType(event.target.value as PostType)}>
            <option value="question">Question</option>
            <option value="info">Info</option>
          </select>
        </label>
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} minLength={3} maxLength={200} required />
        </label>
        <label>
          Body
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={10} minLength={10} required />
        </label>
        <PostTagSelector selectedTagNames={tagNames} onChange={setTagNames} disabled={updatePost.isPending || deletePost.isPending} />
        <div style={{ display: "flex", gap: "8px" }}>
          <button type="submit" disabled={updatePost.isPending || !title.trim() || !body.trim()}>
            {updatePost.isPending ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => void onDelete()} disabled={deletePost.isPending}>
            {deletePost.isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </form>
    </div>
  );
}
