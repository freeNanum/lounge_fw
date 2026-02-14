import { useEffect } from "react";

const SITE_NAME = "Lounge FW";
const SITE_URL = "https://lounge-fw.vercel.app";

interface SeoMetaOptions {
  title: string;
  description: string;
  path?: string;
  robots?: string;
  type?: "website" | "article";
}

function upsertMetaByName(name: string, content: string): void {
  let node = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute("name", name);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

function upsertMetaByProperty(property: string, content: string): void {
  let node = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute("property", property);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

function upsertCanonical(href: string): void {
  let node = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", "canonical");
    document.head.appendChild(node);
  }
  node.setAttribute("href", href);
}

function normalizePath(path: string | undefined): string {
  if (!path) {
    return window.location.pathname + window.location.search;
  }

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function useSeoMeta({ title, description, path, robots = "index,follow", type = "website" }: SeoMetaOptions): void {
  useEffect(() => {
    const finalTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const normalizedPath = normalizePath(path);
    const canonicalUrl = normalizedPath.startsWith("http") ? normalizedPath : `${SITE_URL}${normalizedPath}`;

    document.title = finalTitle;
    upsertCanonical(canonicalUrl);

    upsertMetaByName("description", description);
    upsertMetaByName("robots", robots);
    upsertMetaByName("twitter:card", "summary");
    upsertMetaByName("twitter:title", finalTitle);
    upsertMetaByName("twitter:description", description);

    upsertMetaByProperty("og:type", type);
    upsertMetaByProperty("og:site_name", SITE_NAME);
    upsertMetaByProperty("og:title", finalTitle);
    upsertMetaByProperty("og:description", description);
    upsertMetaByProperty("og:url", canonicalUrl);
  }, [title, description, path, robots, type]);
}
