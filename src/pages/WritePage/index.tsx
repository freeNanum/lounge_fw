import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PostType } from "../../entities/post/types";
import { useAuth } from "../../features/auth/AuthProvider";
import { useCreatePost } from "../../features/post-editor/usePostMutations";

export function WritePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createPost = useCreatePost();

  const [type, setType] = useState<PostType>("question");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) {
      return;
    }

    const tagNames = tagsInput
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const created = await createPost.mutateAsync({
      authorId: user.id,
      input: {
        type,
        title,
        body,
        tagNames,
      },
    });

    navigate(`/posts/${created.id}`);
  };

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <h1 style={{ margin: 0 }}>Write a Post</h1>
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
        <label>
          Tags (comma separated)
          <input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} placeholder="embedded,rtos,pcb" />
        </label>
        <button type="submit" disabled={createPost.isPending || !title.trim() || !body.trim()}>
          {createPost.isPending ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
}
