import type { MetadataRoute } from 'next';

const BASE_URL = 'https://ai-fontgenerator.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '',
    '/fancy-font-generator',
    '/fancy-font',
    '/stylish-font',
    '/fancy-text-generator',
    '/stylish-text-generator',
    '/cool-font-generator',
    '/aesthetic-font-generator',
    '/gothic-font-generator',
    '/bold-font-generator',
    '/italic-font-generator',
    '/bubble-font-generator',
    '/small-caps-font-generator',
    '/instagram-fonts',
    '/tiktok-fonts',
    '/discord-fonts',
    '/ai-font-generator',
    '/font-generator',
    '/custom-font-generator',
    '/font-maker',
    '/ai-font-maker',
    '/create-a-font',
    '/handwriting-font-generator',
    '/cursive-font-generator',
    '/handwritten-font-generator',
    '/futuristic-font-generator',
    '/gaming-font-generator',
    '/luxury-font-generator',
    '/how-it-works',
    '/typography-glossary',
    '/resources',
    '/resources/how-to-describe-a-font-to-an-ai-font-generator',
    '/resources/ttf-vs-otf-vs-woff2',
    '/resources/how-to-create-a-custom-font',
    '/resources/how-typography-changes-brand-personality',
    '/resources/what-makes-a-good-display-font',
    '/resources/how-to-prepare-handwriting-for-a-font',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/disclaimer',
    '/cookie-policy',
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/resources/') ? 0.7 : 0.8,
  }));
}
