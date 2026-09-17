export function withTrailingSlash(path: string): string {
  if (path === '/') return path;
  return path.endsWith('/') ? path : `${path}/`;
}

export function absoluteUrl(path: string, origin: string): string {
  const normalized = withTrailingSlash(path.startsWith('/') ? path : `/${path}`);
  return new URL(normalized, `${origin}/`).toString();
}

export function opportunityPath(slug: string): string {
  return `/oportunidades/${slug}/`;
}

export function guidePath(slug: string): string {
  return `/guias/${slug}/`;
}

export function categoryPath(slug: string): string {
  return `/categorias/${slug}/`;
}

export function profilePath(slug: string): string {
  return `/perfiles/${slug}/`;
}

export function directorySearchHash(query: string): string {
  return `/oportunidades/#q=${encodeURIComponent(query)}`;
}

export function formatIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
