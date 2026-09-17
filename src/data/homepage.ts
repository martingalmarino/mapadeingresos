export const featuredSlugs = [
  'mercado-libre-afiliados',
  'hotmart',
  'google-adsense',
  'hostinger-afiliados',
  'travelpayouts',
  'cafecito',
  'gumroad',
  'adobe-stock',
] as const;

export const curatedLists = [
  {
    title: 'Afiliación',
    href: '/categorias/afiliacion/',
    slugs: ['mercado-libre-afiliados', 'hostinger-afiliados', 'amazon-associates', 'semrush-afiliados', 'awin'],
  },
  {
    title: 'Publicidad',
    href: '/categorias/publicidad/',
    slugs: ['google-adsense', 'the-moneytizer', 'ezoic', 'google-admob', 'youtube-partners'],
  },
  {
    title: 'Comunidad',
    href: '/categorias/membresias-aportes/',
    slugs: ['cafecito', 'patreon', 'ko-fi', 'youtube-partners'],
  },
  {
    title: 'Productos y recursos',
    href: '/categorias/productos-digitales/',
    slugs: ['hotmart', 'gumroad', 'udemy', 'adobe-stock', 'shutterstock-contributor'],
  },
] as const;

export const profileTiles = [
  { slug: 'web-blog', title: 'Web o blog', text: 'Publicidad, afiliación y productos propios en un sitio.' },
  { slug: 'redes-sociales', title: 'Redes sociales', text: 'Recomendaciones, aportes y catálogos sin web propia.' },
  { slug: 'youtube', title: 'YouTube', text: 'Anuncios, membresías y programas alrededor del video.' },
  { slug: 'newsletter-comunidad', title: 'Newsletter o comunidad', text: 'Relación directa, aportes y productos para suscriptores.' },
  { slug: 'cursos-productos', title: 'Cursos y productos', text: 'Vender descargas, formaciones o recursos digitales.' },
  { slug: 'fotografia-diseno', title: 'Fotografía y diseño', text: 'Licenciar archivos aceptados en bancos de contenido.' },
  { slug: 'aplicaciones', title: 'Aplicaciones', text: 'Publicidad dentro de una app, no en un sitio común.' },
  { slug: 'principiantes', title: 'Estoy empezando', text: 'Qué hace falta antes de pedir el alta en un programa.' },
] as const;
