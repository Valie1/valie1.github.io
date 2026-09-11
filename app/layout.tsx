import type { Metadata, Viewport } from "next";
import JsonLd from "@/components/JsonLd";
import SiteNav from "@/components/SiteNav";
import StaticLegalPortalRuntime from "@/components/StaticLegalPortalRuntime";
import GlobalFeedback from "@/components/GlobalFeedback";
import BrowserViewportRuntime from "@/components/BrowserViewportRuntime";
import RenKotoneSecret from "@/components/RenKotoneSecret";
import { site } from "@/lib/content";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";
import "./globals.css";


export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: { default: site.seo.title, template: `%s — ${site.name}` },
  description: site.seo.description,
  keywords: site.seo.keywords,
  creator: site.seo.creator,
  publisher: site.name,
  authors: [{ name: site.seo.creator }],
  applicationName: site.name,
  category: "portfolio",
  alternates: { canonical: absoluteUrl("/") },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName: site.name,
    title: site.seo.title,
    description: site.seo.description,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.seo.defaultOgLabel}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.seo.title,
    description: site.seo.description,
    images: [absoluteUrl("/opengraph-image")],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050505",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sameAs = site.socials.map((item) => item.url).filter(Boolean);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.name,
      url: absoluteUrl("/"),
      description: site.seo.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: site.name,
      url: absoluteUrl("/"),
      email: site.email,
      description: site.seo.description,
      ...(sameAs.length ? { sameAs } : {}),
    },
  ];

  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">SKIP TO CONTENT</a>
        <JsonLd data={structuredData} />
        <StaticLegalPortalRuntime />
        <script src="/site-nav-runtime.js?v=123.19" defer />
        <script src="/site-link-preview-lock.js?v=123.19" defer />
        <BrowserViewportRuntime />
        <SiteNav />
        <GlobalFeedback />
        <RenKotoneSecret />
        <div id="main-content" tabIndex={-1}>{children}</div>
      </body>
    </html>
  );
}
