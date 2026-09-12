import type { Metadata } from "next";
import { site } from "@/lib/content";

const fallbackUrl = "http://localhost:3000";

export function getSiteUrl() {
  const candidate = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!candidate) return new URL(fallbackUrl);
  try {
    return new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
  } catch {
    return new URL(fallbackUrl);
  }
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

type BuildMetadataArgs = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  noIndex?: boolean;
};







export function buildMetadata({
  title,
  description = site.seo.description,
  path = "/",
  image = "/valie-social-preview-12349.png",
  imageAlt,
  keywords = site.seo.keywords,
  noIndex = false,
}: BuildMetadataArgs = {}): Metadata {
  const canonical = absoluteUrl(path);
  const resolvedTitle = title ? `${title} — ${site.name}` : site.seo.title;
  const resolvedImageAlt = imageAlt ?? `${resolvedTitle} — ${site.seo.defaultOgLabel}`;

  return {
    title: { absolute: resolvedTitle },
    description,
    keywords,
    creator: site.seo.creator,
    publisher: site.name,
    authors: [{ name: site.seo.creator }],
    alternates: { canonical },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: site.name,
      title: resolvedTitle,
      description,
      images: [
        {
          url: absoluteUrl(image),
          width: 1200,
          height: 630,
          alt: resolvedImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [absoluteUrl(image)],
    },
  };
}
