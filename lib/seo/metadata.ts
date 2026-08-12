import type { Metadata } from 'next';

const BASE_URL = 'https://ai-fontgenerator.com';
const DEFAULT_TITLE = 'AI Font Generator — Create Custom Fonts with AI';
const DEFAULT_DESCRIPTION =
  'Create custom fonts with AI. Describe your typeface, choose its style, and generate a real downloadable font.';

interface ConstructMetadataProps {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
  keywords?: string[];
}

export function constructMetadata({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = '',
  noIndex = false,
  ogImage = '/og-image.png',
  keywords = [
    'AI font generator',
    'custom font maker',
    'generate TTF font',
    'OTF typeface builder',
    'WOFF2 webfont generator',
    'vector typography AI',
  ],
}: ConstructMetadataProps = {}): Metadata {
  const canonicalUrl = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | AI Font Generator`;

  return {
    title: fullTitle,
    description,
    keywords,
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: 'AI Font Generator',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}
