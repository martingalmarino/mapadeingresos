import { site } from '../data/site';
import type { OpportunityCardData } from './catalog';
import { absoluteUrl } from './urls';

interface ListItem {
  name: string;
  url: string;
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: `${site.origin}/`,
    inLanguage: site.locale,
    description: site.tagline,
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: `${site.origin}/`,
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: `${site.origin}/`,
    description: 'Directorio editorial de oportunidades de monetización digital para quienes trabajan desde Argentina.',
  };
}

export function breadcrumbJsonLd(items: ListItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url, site.origin),
    })),
  };
}

export function collectionJsonLd(name: string, description: string, url: string, items: OpportunityCardData[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description,
    url: absoluteUrl(url, site.origin),
    inLanguage: site.locale,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: absoluteUrl(item.href, site.origin),
      })),
    },
  };
}

export function webPageJsonLd(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: absoluteUrl(url, site.origin),
    inLanguage: site.locale,
    isPartOf: {
      '@type': 'WebSite',
      name: site.name,
      url: `${site.origin}/`,
    },
  };
}

export function articleJsonLd(input: {
  headline: string;
  description: string;
  url: string;
  datePublished: Date;
  dateModified: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    url: absoluteUrl(input.url, site.origin),
    inLanguage: site.locale,
    datePublished: input.datePublished.toISOString(),
    dateModified: input.dateModified.toISOString(),
    author: {
      '@type': 'Organization',
      name: site.editorLabel,
    },
    publisher: {
      '@type': 'Organization',
      name: site.name,
      url: `${site.origin}/`,
    },
  };
}
