import { KeyboardEvent, useState } from "react";
import { usePopularTags } from "../../tag-filter/useTags";
import { FormErrorText } from "../../../shared/ui/FormErrorText";

interface PostTagSelectorProps {
  selectedTagNames: string[];
  onChange: (tagNames: string[]) => void;
  disabled?: boolean;
  popularLimit?: number;
}

function normalizeTagName(raw: string): string {
  return raw.trim().toLowerCase();
}

export function PostTagSelector({ selectedTagNames, onChange, disabled = false, popularLimit = 16 }: PostTagSelectorProps) {
  const tagsQuery = usePopularTags(popularLimit);
  const [customTagInput, setCustomTagInput] = useState("");

  const toggleTag = (tagName: string) => {
    const normalized = normalizeTagName(tagName);
    if (!normalized || disabled) {
      return;
    }

    const hasTag = selectedTagNames.includes(normalized);
    if (hasTag) {
      onChange(selectedTagNames.filter((item) => item !== normalized));
      return;
    }

    onChange([...selectedTagNames, normalized]);
  };

  const addCustomTag = () => {
    const normalized = normalizeTagName(customTagInput);
    if (!normalized || disabled) {
      return;
    }

    if (!selectedTagNames.includes(normalized)) {
      onChange([...selectedTagNames, normalized]);
    }

    setCustomTagInput("");
  };

  const onCustomTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addCustomTag();
  };

  return (
    <section style={{ display: "grid", gap: "8px", padding: "12px", border: "1px solid #e2e8f0", background: "#fff" }}>
      <strong>Select Tags</strong>
      <FormErrorText>{tagsQuery.isError ? "Failed to load tags." : null}</FormErrorText>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {(tagsQuery.data ?? []).map((tag) => {
          const checked = selectedTagNames.includes(tag.name);
          return (
            <label key={tag.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input type="checkbox" checked={checked} onChange={() => toggleTag(tag.name)} disabled={disabled} />
              <span>#{tag.name}</span>
            </label>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={customTagInput}
          onChange={(event) => setCustomTagInput(event.target.value)}
          onKeyDown={onCustomTagKeyDown}
          placeholder="Add custom tag"
          disabled={disabled}
        />
        <button type="button" onClick={addCustomTag} disabled={disabled || !customTagInput.trim()}>
          Add Tag
        </button>
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {selectedTagNames.map((tagName) => (
          <button key={tagName} type="button" onClick={() => toggleTag(tagName)} disabled={disabled}>
            #{tagName} x
          </button>
        ))}
      </div>
    </section>
  );
}
