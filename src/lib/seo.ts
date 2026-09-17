import type { ModelId } from '../data/taxonomies';

export const brandName = 'Mapa de Ingresos';

export function formatPageTitle(title: string): string {
  if (/mapadeingresos\.ar|mapa de ingresos/i.test(title)) return title;
  if (title.length >= 48) return title;
  return `${title} | ${brandName}`;
}

export const relatedGuideByModel: Record<ModelId, { href: string; label: string }> = {
  afiliacion: {
    href: '/guias/programas-afiliados-argentina/',
    label: 'cómo elegir un programa de afiliados desde Argentina',
  },
  publicidad: {
    href: '/guias/alternativas-google-adsense/',
    label: 'alternativas a Google AdSense y otras redes',
  },
  'membresias-aportes': {
    href: '/guias/modelos-monetizacion-digital/',
    label: 'modelos de monetización digital y cómo elegir',
  },
  'productos-digitales': {
    href: '/guias/vender-productos-digitales-argentina/',
    label: 'cómo vender productos digitales desde Argentina',
  },
  'licencias-contenido': {
    href: '/guias/vender-productos-digitales-argentina/',
    label: 'cómo vender productos digitales y licenciar contenido',
  },
};
