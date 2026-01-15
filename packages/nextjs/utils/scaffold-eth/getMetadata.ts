import type { Metadata } from "next";

const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : `http://localhost:${process.env.PORT || 3000}`;
const titleTemplate = "%s | FansOnly";

export const getMetadata = ({
  title,
  description,
  imageRelativePath = "/thumbnail.png",
  keywords = ["decentralized", "creator platform", "cryptocurrency", "subscriptions", "Mantle", "web3"],
  type = "website",
}: {
  title: string;
  description: string;
  imageRelativePath?: string;
  keywords?: string[];
  type?:
    | "website"
    | "article"
    | "profile"
    | "book"
    | "music.song"
    | "music.album"
    | "music.playlist"
    | "music.radio_station"
    | "video.movie"
    | "video.episode"
    | "video.tv_show"
    | "video.other";
}): Metadata => {
  const imageUrl = `${baseUrl}${imageRelativePath}`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: titleTemplate,
    },
    description: description,
    keywords: keywords,
    authors: [
      { name: "Swaroop Patil", url: "https://x.com/swarooppatilx" },
      { name: "Renarin", url: "https://x.com/0xrenarin" },
    ],
    creator: "Sieg Project",
    publisher: "Sieg Project",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      url: baseUrl,
      siteName: "FansOnly",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "en_US",
      type: type,
    },
    twitter: {
      card: "summary_large_image",
      title: {
        default: title,
        template: titleTemplate,
      },
      description: description,
      images: [imageUrl],
      creator: "@swarooppatilx",
      site: "@siegproject",
    },
    icons: {
      icon: [
        {
          url: "/favicon-96x96.png",
          sizes: "96x96",
          type: "image/png",
        },
      ],
    },
    manifest: "/site.webmanifest",
    alternates: {
      canonical: baseUrl,
    },
  };
};
