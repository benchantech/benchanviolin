import type { MetadataRoute } from "next";
import { parentQuestions } from "@/lib/parent-questions";
import { getTagDirectory } from "@/lib/tags";
import { getBranchUrl, getRouteUrl, listTechnicalBranchPages, listTechnicalRoutePages } from "@/lib/technical-route-pages";

const siteUrl = "https://benchanviolin.com";

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

function entry(
  pathOrUrl: string,
  options: {
    lastModified?: string | Date;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
  } = {},
): MetadataRoute.Sitemap[number] {
  return {
    url: pathOrUrl.startsWith("https://") ? pathOrUrl : absoluteUrl(pathOrUrl),
    lastModified: options.lastModified ?? new Date(),
    changeFrequency: options.changeFrequency,
    priority: options.priority,
  };
}

async function tagEntries(): Promise<MetadataRoute.Sitemap> {
  try {
    const tags = await getTagDirectory();
    return tags.map((tag) =>
      entry(`/library/tags/${tag.slug}`, {
        changeFrequency: "weekly",
        priority: tag.clip_count > 0 ? 0.65 : 0.45,
      }),
    );
  } catch (error) {
    console.warn("Skipping sitemap tag URLs because tag directory could not be loaded.", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    entry("/", { changeFrequency: "weekly", priority: 1 }),
    entry("/parents", { changeFrequency: "weekly", priority: 0.9 }),
    entry("/library", { changeFrequency: "weekly", priority: 0.85 }),
    entry("/tools/clip-builder", { changeFrequency: "monthly", priority: 0.45 }),
    entry("/contact", { changeFrequency: "monthly", priority: 0.35 }),
    entry("/ai-disclosure", { changeFrequency: "monthly", priority: 0.35 }),
    entry("/privacy", { changeFrequency: "yearly", priority: 0.2 }),
    entry("/terms", { changeFrequency: "yearly", priority: 0.2 }),
    entry("/cookies", { changeFrequency: "yearly", priority: 0.2 }),
    entry("/accessibility", { changeFrequency: "yearly", priority: 0.2 }),
    entry("/copyright", { changeFrequency: "yearly", priority: 0.2 }),
  ];

  const parentEntries = parentQuestions.map((question) =>
    entry(`/parents/${question.slug}`, {
      lastModified: question.updated,
      changeFrequency: "monthly",
      priority: 0.82,
    }),
  );

  const routeEntries = [
    ...listTechnicalRoutePages().map((route) =>
      entry(getRouteUrl(route.routeId), {
        changeFrequency: "weekly",
        priority: 0.72,
      }),
    ),
    ...listTechnicalBranchPages().map((branch) =>
      entry(getBranchUrl(branch.routeId, branch.branchId), {
        changeFrequency: "weekly",
        priority: 0.68,
      }),
    ),
  ];

  return [...staticEntries, ...parentEntries, ...routeEntries, ...(await tagEntries())];
}
