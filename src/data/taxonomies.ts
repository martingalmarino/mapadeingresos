export const modelIds = [
  'afiliacion',
  'publicidad',
  'membresias-aportes',
  'productos-digitales',
  'licencias-contenido',
  'monetizacion-contenido',
] as const;

export type ModelId = (typeof modelIds)[number];

export const channelIds = [
  'web-blog',
  'redes-sociales',
  'youtube',
  'newsletter-comunidad',
  'cursos-productos',
  'fotografia-diseno',
  'aplicaciones',
] as const;

export type ChannelId = (typeof channelIds)[number];

export const profileIds = [...channelIds, 'principiantes'] as const;
export type ProfileId = (typeof profileIds)[number];

export const platformTypeIds = [
  'affiliate-program',
  'platform',
  'partner-program',
  'affiliate-network',
  'affiliate-network-platform',
  'advertising-platform',
  'publisher-monetization-platform',
  'creator-program',
  'community-support-platform',
  'creator-platform',
  'digital-commerce-platform',
  'course-marketplace',
  'content-licensing-marketplace',
  'app-advertising-platform',
  'creator-support-commerce-platform',
] as const;

export type PlatformTypeId = (typeof platformTypeIds)[number];

export const eligibilityIds = ['confirmed', 'conditional', 'unverified', 'unavailable'] as const;
export type EligibilityId = (typeof eligibilityIds)[number];

export const reviewStatusIds = ['draft', 'published', 'needs-review'] as const;
export type ReviewStatusId = (typeof reviewStatusIds)[number];

export const models: Record<
  ModelId,
  { label: string; shortLabel: string; description: string; href: string }
> = {
  afiliacion: {
    label: 'Afiliación',
    shortLabel: 'Afiliación',
    description: 'Comisiones por recomendar productos o servicios de terceros con seguimiento.',
    href: '/categorias/afiliacion/',
  },
  publicidad: {
    label: 'Publicidad',
    shortLabel: 'Publicidad',
    description: 'Ingresos por mostrar anuncios en una web, app o canal, sujetos a admisión.',
    href: '/categorias/publicidad/',
  },
  'membresias-aportes': {
    label: 'Membresías y aportes',
    shortLabel: 'Comunidad',
    description: 'Aportes, membresías o suscripciones pagas de una audiencia propia.',
    href: '/categorias/membresias-aportes/',
  },
  'productos-digitales': {
    label: 'Productos digitales',
    shortLabel: 'Productos',
    description: 'Venta de cursos, descargas u otros bienes digitales propios o de terceros.',
    href: '/categorias/productos-digitales/',
  },
  'licencias-contenido': {
    label: 'Licencias de contenido',
    shortLabel: 'Licencias',
    description: 'Regalías por licenciar fotos, videos, ilustraciones u otros archivos aceptados.',
    href: '/categorias/licencias-contenido/',
  },
  'monetizacion-contenido': {
    label: 'Monetización de contenido',
    shortLabel: 'Contenido',
    description: 'Programas que remuneran contenido original según lecturas, interacción u otras métricas elegibles.',
    href: '/categorias/monetizacion-contenido/',
  },
};

export const channels: Record<ChannelId, { label: string; href: string }> = {
  'web-blog': { label: 'Web o blog', href: '/perfiles/web-blog/' },
  'redes-sociales': { label: 'Redes sociales', href: '/perfiles/redes-sociales/' },
  youtube: { label: 'YouTube', href: '/perfiles/youtube/' },
  'newsletter-comunidad': { label: 'Newsletter o comunidad', href: '/perfiles/newsletter-comunidad/' },
  'cursos-productos': { label: 'Cursos y productos', href: '/perfiles/cursos-productos/' },
  'fotografia-diseno': { label: 'Fotografía y diseño', href: '/perfiles/fotografia-diseno/' },
  aplicaciones: { label: 'Aplicaciones', href: '/perfiles/aplicaciones/' },
};

export const profiles: Record<ProfileId, { label: string; href: string }> = {
  ...channels,
  principiantes: { label: 'Principiantes', href: '/perfiles/principiantes/' },
};

export const platformTypes: Record<PlatformTypeId, { label: string; isNetwork: boolean }> = {
  'affiliate-program': { label: 'Programa de afiliados', isNetwork: false },
  platform: { label: 'Plataforma', isNetwork: false },
  'partner-program': { label: 'Programa de socios', isNetwork: false },
  'affiliate-network': { label: 'Red de afiliación', isNetwork: true },
  'affiliate-network-platform': { label: 'Red / plataforma de afiliación', isNetwork: true },
  'advertising-platform': { label: 'Plataforma de publicidad', isNetwork: false },
  'publisher-monetization-platform': { label: 'Plataforma para editores', isNetwork: false },
  'creator-program': { label: 'Programa para creadores', isNetwork: false },
  'community-support-platform': { label: 'Plataforma de aportes', isNetwork: false },
  'creator-platform': { label: 'Plataforma para creadores', isNetwork: false },
  'digital-commerce-platform': { label: 'Plataforma de comercio digital', isNetwork: false },
  'course-marketplace': { label: 'Marketplace de cursos', isNetwork: false },
  'content-licensing-marketplace': { label: 'Marketplace de licencias', isNetwork: false },
  'app-advertising-platform': { label: 'Publicidad para apps', isNetwork: false },
  'creator-support-commerce-platform': { label: 'Aportes y comercio para creadores', isNetwork: false },
};

export const eligibilityLabels: Record<
  EligibilityId,
  { label: string; shortLabel: string; hint: string }
> = {
  confirmed: {
    label: 'Alta en Argentina: confirmada',
    shortLabel: 'Confirmada',
    hint: 'Hay evidencia oficial de que una persona residente en Argentina puede solicitar unirse. La admisión individual sigue dependiendo de cada plataforma.',
  },
  conditional: {
    label: 'Alta en Argentina: condicional',
    shortLabel: 'Condicional',
    hint: 'Existe una vía plausible, pero hay condiciones, matices o evidencia incompleta. Revisá los términos vigentes.',
  },
  unverified: {
    label: 'Alta en Argentina: pendiente de verificar',
    shortLabel: 'Pendiente',
    hint: 'Todavía no hay evidencia suficiente en este directorio para afirmar o descartar la elegibilidad.',
  },
  unavailable: {
    label: 'Alta en Argentina: no disponible',
    shortLabel: 'No disponible',
    hint: 'La evidencia actual indica que el programa no admite a residentes en Argentina, o no existe un programa local equivalente.',
  },
};

export const networkSlugs = ['awin', 'impact', 'cj', 'partnerstack', 'travelpayouts'] as const;
