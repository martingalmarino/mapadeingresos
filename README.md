# mapadeingresos.ar

Directorio estático, en español de Argentina, de oportunidades de monetización digital. El sitio se genera por completo en el build y se publica como archivos en `dist/`.

## Requisitos

- Node.js 22.12 o superior (versión par)
- npm 10 o superior
- TypeScript 5.9.x (fijado en el proyecto: `astro check` todavía no usa la API de TypeScript 7)

## Comandos

```bash
npm install
npm run dev
npm run check
npm run validate
npm run build
npm run preview
```

`npm run build` ejecuta la verificación de tipos de Astro, el validador del catálogo y la generación estática.

## Despliegue estático

El origen canónico de producción se configura en un solo lugar:

- `PUBLIC_SITE_ORIGIN` (por defecto `https://mapadeingresos.ar`)
- `src/data/site.ts` lee esa variable

Cualquier host que sirva `dist/` sirve: Vercel (sin adapter), Netlify, Cloudflare Pages o un servidor de archivos. En Vercel, importá el repositorio y dejá el preset de Astro; no hace falta adapter si `output` sigue en `static`.

### Indexación según entorno

- Producción: `PUBLIC_SITE_INDEXING=true` o sin definir. Las páginas editoriales se pueden indexar y el `robots.txt` apunta al sitemap.
- Preview/staging: `PUBLIC_SITE_INDEXING=false`. Todas las páginas emiten `noindex` y el `robots.txt` bloquea el rastreo. Eso no se reemplaza solo con un `Disallow`.
- En Vercel, `VERCEL_ENV=preview` también desactiva la indexación.

El sitemap incluye solo rutas canónicas indexables. `/comparar/` y el 404 quedan afuera. `lastmod` se carga desde `src/data/editorial-dates.ts` cuando hay una fecha editorial real.

## Cómo editar contenido

El catálogo vive una sola vez en Markdown:

- Fichas: `src/content/opportunities/*.md`
- Guías: `src/content/guides/*.md`
- Categorías: `src/content/categories/*.md`
- Perfiles: `src/content/profiles/*.md`
- Ajustes del sitio: `src/data/site.ts`
- Taxonomías: `src/data/taxonomies.ts`

Un cambio de contenido requiere un rebuild y un nuevo deploy. El sitio no consulta APIs de plataformas en runtime.

### Agregar la ficha 26

1. Copiá una ficha existente a `src/content/opportunities/nueva-plataforma.md`.
2. Usá un slug ASCII en minúsculas, igual al nombre del archivo.
3. Completá el frontmatter del esquema en `src/content.config.ts`. Dejá en `null` lo que no esté verificado. `affiliateUrl` debe ser `null` hasta que exista un enlace real.
4. Agregá `relatedSlugs` a fichas vecinas y, si corresponde, una fecha en `src/data/editorial-dates.ts`.
5. Corré `npm run validate` y `npm run build`.
6. Anotá en `CONTENT-REVIEW.md` lo que falte verificar.

### Estados de verificación

`argentinaEligibility` solo puede ser `confirmed` con una fuente oficial explícita. Un sitio en español no prueba disponibilidad argentina. `unverified` no es `unavailable`.

### Fuentes, logos y afiliados

- `sources[].checkedAt` se completa solo cuando esa URL se revisó de verdad.
- `contentUpdatedAt` cambia cuando edita el equipo editorial, no en cada build.
- Los logos locales van en `public/images/` y se referencian en `logo`. Si no hay marca autorizada, la ficha usa iniciales.
- Para un enlace de afiliado real, cargá `affiliateUrl`. El botón se etiquetará como patrocinado. No inventes códigos.

### Contacto

`PUBLIC_CONTACT_EMAIL` vacío o ausente deja `/contacto/` sin formulario. Cuando haya una casilla real, definí la variable y va a aparecer un `mailto` con asunto precargado.

## Limitaciones

No hay CMS, base de datos, autenticación ni endpoints de servidor. La búsqueda, los filtros y la comparación son mejoras ligeras sobre HTML ya renderizado.
