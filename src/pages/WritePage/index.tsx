import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import type { PostType } from "../../entities/post/types";
import { useAuth } from "../../features/auth/AuthProvider";
import { PostTagSelector } from "../../features/post-editor/components/PostTagSelector";
import { useCreatePost } from "../../features/post-editor/usePostMutations";
import { FormErrorText } from "../../shared/ui/FormErrorText";

interface CreatePostFormValues {
  type: PostType;
  title: string;
  body: string;
  tagNames: string[];
}

const QUESTION_PLACEHOLDER = `# Problem
What issue are you facing?

## Environment
- Board/Device:
- Firmware/OS version:
- Toolchain:

## What I tried
1. Step 1
2. Step 2

## Expected result
Describe what should happen.

## Actual result
Describe what actually happened.`;

const INFO_PLACEHOLDER = `# Summary
Share useful information for others.

## Context
Why this tip/update matters.

## Key points
- Point 1
- Point 2

## How to apply
1. Step 1
2. Step 2

## References
- Link or document`;

export function WritePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createPost = useCreatePost();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormValues>({
    defaultValues: {
      type: "question",
      title: "",
      body: "",
      tagNames: [],
    },
  });

  const selectedTagNames = watch("tagNames") ?? [];
  const markdownBody = watch("body");
  const selectedType = watch("type");
  const bodyPlaceholder = selectedType === "info" ? INFO_PLACEHOLDER : QUESTION_PLACEHOLDER;

  const setSelectedTagNames = (nextTags: string[]) => {
    setValue("tagNames", nextTags, { shouldDirty: true, shouldTouch: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");
    if (!user?.id) {
      setError("root", { message: "You must be signed in to create a post." });
      return;
    }

    try {
      const created = await createPost.mutateAsync({
        authorId: user.id,
        input: {
          type: values.type,
          title: values.title.trim(),
          body: values.body.trim(),
          tagNames: values.tagNames,
        },
      });

      navigate(`/posts/${created.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create post. Please try again.";
      setError("root", { message });
    }
  });

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <h1 style={{ margin: 0 }}>Create Post</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: "12px", maxWidth: "960px" }}>
        <label>
          Type
          <select {...register("type", { required: true })} style={{ marginLeft: "12px" }}>
            <option value="question">Question</option>
            <option value="info">Info</option>
          </select>
        </label>
        <label>
          Title
          <input
            {...register("title", {
              required: "Title is required.",
              minLength: {
                value: 3,
                message: "Title must be at least 3 characters.",
              },
              maxLength: {
                value: 200,
                message: "Title must be 200 characters or less.",
              },
            })}
            minLength={3}
            maxLength={200}
            style={{ width: "100%", boxSizing: "border-box" }}
            placeholder="What are you working on?"
          />
        </label>
        <FormErrorText>{errors.title?.message}</FormErrorText>
        <label>
          Markdown Content
          <textarea
            {...register("body", {
              required: "Content is required.",
              minLength: {
                value: 10,
                message: "Content must be at least 10 characters.",
              },
              maxLength: {
                value: 20000,
                message: "Content must be 20000 characters or less.",
              },
            })}
            rows={18}
            minLength={10}
            style={{ width: "100%", minHeight: "420px", resize: "vertical" }}
            placeholder={bodyPlaceholder}
          />
        </label>
        <FormErrorText>{errors.body?.message}</FormErrorText>

        <input type="hidden" {...register("tagNames")} />
        <PostTagSelector
          selectedTagNames={selectedTagNames}
          onChange={setSelectedTagNames}
          disabled={createPost.isPending || isSubmitting}
        />

        <section style={{ display: "grid", gap: "8px", padding: "12px", border: "1px solid #e2e8f0", background: "#fff" }}>
          <strong>Markdown Preview</strong>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit" }}>{markdownBody || "Nothing to preview yet."}</pre>
        </section>

        <FormErrorText>{errors.root?.message}</FormErrorText>

        <button type="submit" disabled={createPost.isPending || isSubmitting}>
          {createPost.isPending || isSubmitting ? "Publishing..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
