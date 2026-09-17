export function foldText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const NOISE = new Set([
  'afiliados',
  'affiliates',
  'affiliate',
  'associates',
  'contributor',
  'socios',
  'partners',
  'partner',
  'program',
  'programa',
  'para',
  'de',
  'del',
  'la',
  'el',
  'los',
  'las',
  'un',
  'una',
  'y',
  'the',
  'and',
  'by',
  'con',
  'creadores',
  'subscriptions',
  'subscription',
  'suscripciones',
  'gifts',
  'regalos',
  'estrellas',
  'stars',
  'productos',
  'digitales',
  'monetizacion',
  'monetización',
  'contenido',
  'content',
]);

const BRAND_MARKS: Array<[RegExp, string]> = [
  [/^facebook\b/, 'FB'],
  [/^instagram\b/, 'IG'],
  [/\byoutube\b/, 'YT'],
  [/^google adsense/, 'GS'],
  [/^google admob/, 'AM'],
  [/^amazon kindle/, 'AK'],
  [/^amazon associates/, 'AA'],
  [/^partnerstack/, 'PS'],
  [/^nordvpn/, 'NV'],
  [/^siteground/, 'SG'],
  [/^hubspot/, 'HS'],
  [/^getresponse/, 'GR'],
  [/^shopify\b/, 'SH'],
  [/^mercado libre/, 'ML'],
  [/^ko-?fi/, 'KF'],
  [/^impact/, 'IM'],
  [/^the moneytizer/, 'TM'],
  [/^systeme/, 'SY'],
];

function splitToken(token: string): string[] {
  return token
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/\s+/)
    .filter(Boolean);
}

export function initials(name: string): string {
  const headline = name.split(/[:—–|]/)[0] ?? name;
  const foldedHeadline = foldText(headline.replace(/\.com$/i, '').replace(/\.io$/i, ''));

  for (const [pattern, mark] of BRAND_MARKS) {
    if (pattern.test(foldedHeadline)) return mark;
  }

  const words = headline
    .replace(/\.com$/i, '')
    .replace(/\.io$/i, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/[\s-]+/)
    .flatMap(splitToken)
    .filter((word) => word && !NOISE.has(foldText(word)));

  if (words.length === 0) {
    const compact = name.replace(/[^\p{L}\p{N}]/gu, '');
    return compact.slice(0, 2).toUpperCase();
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

export const markColors = [
  '#1B6FD4',
  '#147A72',
  '#6D48E0',
  '#C2410C',
  '#B45309',
  '#0E7490',
  '#BE185D',
  '#1F7A4D',
] as const;

export function markColor(slug: string): string {
  let hash = 0;
  for (const char of slug) {
    hash = (hash + char.charCodeAt(0) * 17) % markColors.length;
  }
  return markColors[hash] ?? markColors[0];
}

export function pendingLabel(value: string | null | undefined, fallback = 'Pendiente de verificar'): string {
  if (value === null || value === undefined || value.trim() === '') return fallback;
  return value;
}
