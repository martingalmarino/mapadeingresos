export function foldText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function initials(name: string): string {
  const words = name
    .replace(/Afiliados|Associates|Affiliate Program|Contributor|Socios|Partners/gi, '')
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

export const markColors = [
  '#1769D2',
  '#0F766E',
  '#7C3AED',
  '#B42318',
  '#B45309',
  '#0369A1',
  '#BE185D',
  '#365314',
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
