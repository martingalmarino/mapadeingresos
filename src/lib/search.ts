import { foldText } from './text';

const STOPWORDS = new Set([
  'a',
  'al',
  'con',
  'de',
  'del',
  'el',
  'en',
  'la',
  'las',
  'los',
  'o',
  'para',
  'por',
  'un',
  'una',
  'y',
]);

const SYNONYMS: Record<string, string[]> = {
  afiliacion: ['afiliado', 'afiliados', 'affiliate', 'affiliates'],
  afiliado: ['afiliacion', 'afiliados', 'affiliate', 'affiliates'],
  afiliados: ['afiliacion', 'afiliado', 'affiliate', 'affiliates'],
  affiliate: ['afiliacion', 'afiliado', 'afiliados', 'affiliates'],
  affiliates: ['afiliacion', 'afiliado', 'afiliados', 'affiliate'],
  anuncios: ['publicidad', 'ads', 'adsense'],
  aportes: ['aporte', 'donacion', 'donaciones', 'membresias', 'comunidad'],
  ads: ['publicidad', 'anuncios', 'adsense'],
  adsense: ['publicidad', 'anuncios', 'ads'],
  blog: ['web', 'sitio'],
  comunidad: ['membresias', 'aportes', 'newsletter'],
  crm: ['hubspot'],
  donacion: ['aportes', 'donaciones'],
  donaciones: ['aportes', 'donacion'],
  ebook: ['ebooks', 'libros', 'kindle', 'kdp'],
  ebooks: ['ebook', 'libros', 'kindle', 'kdp'],
  email: ['newsletter', 'correo'],
  facebook: ['fb', 'meta'],
  fb: ['facebook', 'meta'],
  gifts: ['regalos', 'estrellas', 'stars'],
  hosting: ['alojamiento', 'hostinger', 'siteground'],
  alojamiento: ['hosting'],
  ig: ['instagram', 'meta'],
  instagram: ['ig', 'meta'],
  kdp: ['kindle', 'ebook', 'libros'],
  kindle: ['kdp', 'ebook', 'libros'],
  libro: ['libros', 'kdp', 'kindle', 'ebook'],
  libros: ['libro', 'kdp', 'kindle', 'ebook'],
  membresia: ['membresias', 'suscripcion', 'suscripciones', 'aportes', 'comunidad'],
  membresias: ['membresia', 'suscripcion', 'suscripciones', 'aportes', 'comunidad'],
  meta: ['facebook', 'instagram'],
  newsletter: ['email', 'correo', 'comunidad'],
  producto: ['productos', 'digitales', 'descargables'],
  productos: ['producto', 'digitales', 'descargables'],
  publicidad: ['anuncios', 'ads', 'adsense'],
  red: ['redes', 'network'],
  redes: ['red', 'network'],
  regalos: ['gifts', 'estrellas', 'stars'],
  sitio: ['web', 'blog'],
  stars: ['estrellas', 'regalos', 'gifts'],
  estrellas: ['stars', 'regalos', 'gifts'],
  suscripcion: ['suscripciones', 'membresias'],
  suscripciones: ['suscripcion', 'membresias'],
  vpn: ['nordvpn'],
  web: ['blog', 'sitio'],
  youtube: ['yt', 'video'],
  yt: ['youtube', 'video'],
};

export const searchAliases: Record<string, string> = {
  'amazon-associates': 'amazon afiliados associates',
  'amazon-kdp': 'kindle kdp ebook ebooks libros publicacion',
  'brevo-afiliados': 'sendinblue email newsletter',
  cafecito: 'cafe aportes donaciones argentina',
  'civitatis-afiliados': 'viajes tours turismo',
  'elementor-afiliados': 'wordpress page builder',
  'etsy-productos-digitales': 'etsy handmade descargables',
  'facebook-content-monetization': 'fb facebook monetizar reels meta contenido',
  'facebook-stars': 'fb facebook estrellas stars meta',
  'facebook-suscripciones': 'fb facebook suscripcion membresia meta',
  'fiverr-afiliados': 'freelance servicios',
  'getresponse-afiliados': 'email newsletter',
  'google-admob': 'admob apps android',
  'google-adsense': 'adsense ads anuncios',
  'hostinger-afiliados': 'hosting alojamiento',
  'hubspot-afiliados': 'crm marketing inbound',
  'instagram-gifts': 'ig instagram regalos gifts reels meta',
  'instagram-suscripciones': 'ig instagram suscripcion membresia meta',
  'journey-mediavine': 'mediavine ads publicidad display',
  'ko-fi': 'kofi ko fi aportes cafe',
  'medium-partner-program': 'articulos escritura blog medium',
  'nordvpn-afiliados': 'vpn nord privacy',
  payhip: 'tienda digital descargables',
  'shopify-afiliados': 'ecommerce tienda online shopify',
  'siteground-afiliados': 'hosting alojamiento',
  'systeme-io-afiliados': 'systemeio funnels',
  'tiendanube-socios': 'tienda nube ecommerce',
  twitch: 'streaming stream directo live bits',
  'youtube-partners': 'yt youtube video partners ypp',
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function tokenizeQuery(query: string): string[] {
  const raw = foldText(query)
    .replace(/[_/]+/g, ' ')
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (raw.length === 0) return [];
  const meaningful = raw.filter((token) => !STOPWORDS.has(token));
  return meaningful.length > 0 ? meaningful : raw;
}

function alternatives(token: string): string[] {
  const unique = new Set([token, ...(SYNONYMS[token] ?? []).map((item) => foldText(item))]);
  return [...unique];
}

export function tokenHits(haystack: string, token: string): boolean {
  if (!token) return true;
  const boundary = token.length <= 2 ? `(?:\\s|$)` : '';
  return new RegExp(`(?:^|\\s)${escapeRegExp(token)}${boundary}`).test(haystack);
}

export function matchesQuery(haystack: string, query: string): boolean {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return true;
  const folded = foldText(haystack);
  return tokens.every((token) => alternatives(token).some((alt) => tokenHits(folded, alt)));
}

function allTokensHit(source: string, tokens: string[], withSynonyms: boolean): boolean {
  return tokens.every((token) => {
    const alts = withSynonyms ? alternatives(token) : [token];
    return alts.some((alt) => tokenHits(source, alt));
  });
}

export function scoreQuery(name: string, slug: string, taxonomy: string, haystack: string, query: string): number {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return 0;
  const foldedName = foldText(name);
  const foldedSlug = foldText(slug.replace(/-/g, ' '));
  const foldedTaxonomy = foldText(taxonomy.replace(/-/g, ' '));
  const foldedAll = foldText(haystack);
  const foldedQuery = foldText(query);

  if (foldedName === foldedQuery) return 200;
  if (foldedName.startsWith(foldedQuery)) return 170;
  if (allTokensHit(foldedName, tokens, false)) return 140;
  if (allTokensHit(foldedName, tokens, true)) return 120;
  if (allTokensHit(foldedSlug, tokens, false)) return 100;
  if (allTokensHit(foldedTaxonomy, tokens, false)) return 80;
  if (allTokensHit(foldedAll, tokens, false)) return 50;
  if (allTokensHit(foldedAll, tokens, true)) return 25;
  return 0;
}
