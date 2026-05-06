const url = process.env.NEXT_PUBLIC_SITE_URL ?? '';

export const siteConfig = {
  contentful: {
    spaceId: process.env.CONTENTFUL_SPACE_ID ?? '',
  },
  meta: {
    title: 'Digital banking for the new generation | Colorful Coin',
    description: `Enjoy premium banking services wherever you go: instant transfers and best exchange rates, exclusive offers and priority customer support. Apply online at ${url
      .replace('https://', '')
      .replace('http://', '')}`,
    url,
    image:
      'https://images.ctfassets.net/w8vf7dk7f259/4bucno7z1xAyVI5MOkU6Pu/ded83d0ec1eb732ae3a81ddab7a18877/fallback-image-03.jpg',
  },
};
