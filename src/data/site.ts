export const productionOrigin = 'https://mapadeingresos.ar';

function stripSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function readEnv(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const env = import.meta.env;

export const siteOrigin = stripSlash(
  readEnv(env.PUBLIC_SITE_ORIGIN) ??
    readEnv(typeof process !== 'undefined' ? process.env.PUBLIC_SITE_ORIGIN : undefined) ??
    productionOrigin,
);

export const indexingEnabled =
  readEnv(env.PUBLIC_SITE_INDEXING) !== 'false' &&
  readEnv(env.VERCEL_ENV) !== 'preview' &&
  readEnv(typeof process !== 'undefined' ? process.env.VERCEL_ENV : undefined) !== 'preview' &&
  readEnv(env.SITE_NOINDEX) !== 'true';

export const contactEmail =
  readEnv(env.PUBLIC_CONTACT_EMAIL) ??
  readEnv(typeof process !== 'undefined' ? process.env.PUBLIC_CONTACT_EMAIL : undefined) ??
  null;

export const site = {
  name: 'mapadeingresos.ar',
  tagline: 'Formas de ganar dinero por internet desde Argentina',
  origin: siteOrigin,
  locale: 'es-AR',
  language: 'es',
  editorLabel: 'Equipo editorial de mapadeingresos.ar',
  indexingEnabled,
  contactEmail,
  defaultOgImage: '/images/og-default.png',
  defaultOgImageAlt: 'mapadeingresos.ar, directorio de oportunidades de monetización digital desde Argentina',
} as const;

export const navItems = [
  { href: '/oportunidades/', label: 'Oportunidades' },
  { href: '/categorias/', label: 'Categorías' },
  { href: '/guias/', label: 'Guías' },
  { href: '/metodologia/', label: 'Cómo elegimos' },
] as const;

export const footerGroups = [
  {
    title: 'Directorio',
    links: [
      { href: '/oportunidades/', label: 'Plataformas para ganar dinero online' },
      { href: '/redes-de-afiliacion/', label: 'Redes de afiliación' },
      { href: '/comparar/', label: 'Comparar' },
      { href: '/perfiles/principiantes/', label: 'Para principiantes' },
    ],
  },
  {
    title: 'Categorías',
    links: [
      { href: '/categorias/afiliacion/', label: 'Programas de afiliados' },
      { href: '/categorias/publicidad/', label: 'Publicidad' },
      { href: '/categorias/membresias-aportes/', label: 'Membresías y aportes' },
      { href: '/categorias/productos-digitales/', label: 'Productos digitales' },
      { href: '/categorias/licencias-contenido/', label: 'Licencias de contenido' },
      { href: '/categorias/monetizacion-contenido/', label: 'Monetización de contenido' },
    ],
  },
  {
    title: 'Guías',
    links: [
      { href: '/guias/programas-afiliados-argentina/', label: 'Elegir un programa de afiliados' },
      { href: '/guias/como-monetizar-una-web/', label: 'Monetizar una página web' },
      { href: '/guias/modelos-monetizacion-digital/', label: 'Elegir un modelo' },
      { href: '/guias/cobrar-plataformas-internacionales-argentina/', label: 'Cobrar desde Argentina' },
    ],
  },
  {
    title: 'Transparencia',
    links: [
      { href: '/metodologia/', label: 'Metodología' },
      { href: '/transparencia/', label: 'Transparencia' },
      { href: '/sobre-mapadeingresos/', label: 'Sobre el directorio' },
      { href: '/contacto/', label: 'Contacto' },
      { href: '/privacidad/', label: 'Privacidad' },
    ],
  },
] as const;
