import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = '/Users/martingalmarino/Downloads/mapa-de-ingresos-20-nuevas-oportunidades.json';
const outDir = path.join(root, 'src/content/opportunities');

const platformTypeByEntity = {
  affiliate_program: 'affiliate-program',
  marketplace: 'digital-commerce-platform',
  selling_platform: 'digital-commerce-platform',
  self_publishing: 'digital-commerce-platform',
  creator_monetization: 'creator-program',
  ad_platform: 'publisher-monetization-platform',
};

const allowedChannels = new Set([
  'web-blog',
  'redes-sociales',
  'youtube',
  'newsletter-comunidad',
  'cursos-productos',
  'fotografia-diseno',
  'aplicaciones',
]);

const badgeMap = {
  pending: 'unverified',
  conditional: 'conditional',
};

function yamlScalar(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean') return String(value);
  const text = String(value);
  return JSON.stringify(text);
}

function yamlList(items) {
  return `[${items.map((item) => JSON.stringify(item)).join(', ')}]`;
}

function formatTerm(term) {
  const unit = term.unit === 'percent' ? '%' : term.unit === 'USD' ? ' USD' : term.unit === 'EUR' ? ' EUR' : ` ${term.unit ?? ''}`.trimEnd();
  let amount;
  if (term.kind === 'commission_range' && term.value && typeof term.value === 'object') {
    amount = `${term.value.min}–${term.value.max}${unit}`;
  } else if (term.kind === 'monthly_fee' && term.value === 0 && term.unit === 'USD') {
    amount = 'USD 0 de cuota mensual documentada del plan (hay cargos de transacción y procesamiento)';
  } else if (term.value === 0 && term.unit === 'USD') {
    amount = 'USD 0 documentado; no implica ausencia de otros cargos';
  } else if (term.value == null) {
    amount = 'importe no verificado';
  } else {
    amount = `${term.value}${unit}`;
  }
  const kindLabel = {
    commission: 'Comisión',
    commission_range: 'Comisión',
    listing_fee: 'Cargo de publicación',
    transaction_fee: 'Cargo por transacción',
    monthly_fee: 'Cuota mensual',
    platform_transaction_fee: 'Comisión de plataforma',
  }[term.kind] ?? 'Condición observada';
  const extras = [term.basis, term.conditions].filter(Boolean).join('. ');
  return `${kindLabel}: ${amount}${extras ? ` (${extras})` : ''}. Consultado el ${term.observed_at}.`;
}

function formatRequirementsThreshold(metrics) {
  const parts = [];
  if (metrics.minimum_followers != null) parts.push(`${metrics.minimum_followers} seguidores documentados`);
  if (metrics.minimum_monthly_sessions != null) parts.push(`${metrics.minimum_monthly_sessions} sesiones mensuales documentadas`);
  if (metrics.minimum_published_posts != null) parts.push(`${metrics.minimum_published_posts} publicación(es) documentada(s)`);
  if (metrics.required_observation_days != null) parts.push(`${metrics.required_observation_days} días de observación documentados`);
  if (metrics.minimum_age != null) parts.push(`mayoría de edad ${metrics.minimum_age} documentada`);
  return parts.length ? parts.join('; ') : null;
}

function sourceFields(source) {
  const fields = [...(source.supports ?? [])];
  if (source.access === 'login_required') fields.push('acceso restringido: requiere inicio de sesión');
  if (source.access === 'official_search_excerpt') fields.push('extracto oficial indexado; documento completo no accesible');
  if ((source.limitations ?? '').toLowerCase().includes('históric')) fields.push('anuncio histórico, no prueba de requisitos actuales');
  return fields.length ? fields : ['officialUrl'];
}

function joinGuideLinks(paths) {
  const labels = {
    '/guias/programas-afiliados-argentina/': 'cómo elegir un programa de afiliados desde Argentina',
    '/guias/como-monetizar-una-web/': 'cómo monetizar una página web desde Argentina',
    '/guias/vender-productos-digitales-argentina/': 'cómo vender productos digitales desde Argentina',
    '/guias/alternativas-google-adsense/': 'alternativas a Google AdSense',
    '/guias/modelos-monetizacion-digital/': 'modelos de monetización digital',
    '/guias/cobrar-plataformas-internacionales-argentina/': 'qué verificar para cobrar de plataformas del exterior',
  };
  return (paths ?? [])
    .filter((href) => labels[href])
    .map((href) => `[${labels[href]}](${href})`);
}

function renderBody(op, sourceById) {
  const content = op.content;
  const argentina = op.argentina;
  const economics = op.economics;
  const evidence = op.evidence;
  const models = op.category_ids;
  const channels = (op.profile_ids ?? []).filter((id) => allowedChannels.has(id));
  const channelLabels = {
    'web-blog': 'web o blog',
    'redes-sociales': 'redes sociales',
    youtube: 'YouTube',
    'newsletter-comunidad': 'newsletter o comunidad',
    'cursos-productos': 'cursos y productos',
    'fotografia-diseno': 'fotografía y diseño',
    aplicaciones: 'aplicaciones',
  };
  const modelLabels = {
    afiliacion: 'afiliación',
    publicidad: 'publicidad',
    'membresias-aportes': 'membresías y aportes',
    'productos-digitales': 'productos digitales',
    'licencias-contenido': 'licencias de contenido',
    'monetizacion-contenido': 'monetización de contenido',
  };
  const editorialScope = String(content.editorial_scope ?? '').replace(
    /los hechos externos verificados están en evidence\.facts\.?/i,
    'los hechos verificados aparecen más abajo, con sus fuentes y limitaciones de acceso.',
  );
  const parentNote = ['Facebook', 'Instagram'].includes(op.parent_platform)
    ? ` Forma parte de ${op.parent_platform}, pero esta ficha cubre un producto distinto: no la mezcles con otras herramientas de la misma marca.`
    : '';
  const networkNote = (economics.payout_methods_general ?? []).some((item) => /impact/i.test(item))
    ? ' El pago puede transitar por Impact; eso no convierte a esta ficha en la red impact.com.'
    : (economics.payout_methods_general ?? []).some((item) => /partnerstack/i.test(item))
      ? ' El programa puede operar sobre PartnerStack; el alta en esa red no equivale a la ficha general de PartnerStack ni a la aceptación de cada anunciante.'
      : '';
  const facts = (evidence.facts ?? []).map((fact) => fact.statement);
  const missing = evidence.missing_information ?? [];
  const sourceNotes = (evidence.source_ids ?? [])
    .map((id) => sourceById[id])
    .filter(Boolean)
    .filter((source) => source.access !== 'full_page' || (source.limitations ?? '').toLowerCase().includes('históric'))
    .map((source) => {
      if (source.access === 'login_required') return `La fuente «${source.title}» requiere inicio de sesión; no se verificaron términos actuales en acceso público.`;
      if (source.access === 'official_search_excerpt') return `La fuente «${source.title}» se consultó como extracto oficial indexado; el documento completo no estuvo accesible.`;
      return `«${source.title}» es un anuncio o artículo histórico: no confirma requisitos, países ni cobros vigentes.`;
    });

  const joinLine = argentina.country_eligibility.note;
  const payoutNote = argentina.payout.note;
  const approvalNote = argentina.account_approval.note;
  const generalMethods = economics.payout_methods_general ?? [];
  const arDocumented = ['payhip', 'etsy-productos-digitales', 'medium-partner-program'].includes(op.slug);
  const excerptOnly = op.slug === 'instagram-gifts';

  let joinAnswer;
  if (op.argentina.directory_badge === 'conditional') {
    joinAnswer = excerptOnly
      ? `Hay una mención de país en un extracto oficial, pero no alcanza para afirmar el alta ni el cobro. ${joinLine}`
      : `Hay evidencia documental de país o integración, con condiciones. ${joinLine} ${approvalNote}`;
  } else {
    joinAnswer = `Pendiente de verificar. ${joinLine}`;
  }

  let payoutAnswer;
  if (arDocumented) {
    payoutAnswer = `${payoutNote} Los medios mencionados son condiciones documentadas del programa, no una prueba de retiro en tu cuenta. ${economics.notes ?? ''}`;
  } else if (generalMethods.length) {
    payoutAnswer = `${payoutNote} Los medios generales publicados (${generalMethods.join(', ')}) no confirman retiro para una cuenta argentina. ${economics.notes ?? ''}`;
  } else {
    payoutAnswer = `${payoutNote} ${economics.notes ?? ''}`.trim();
  }

  const terms = economics.observed_terms ?? [];
  const commissionLines = terms.length
    ? terms.map((term) => `- ${formatTerm(term)}`).join('\n')
    : '- No se verificó una tasa o importe único aplicable a esta ficha. Consultá las condiciones vigentes antes de proyectar resultados.';
  if (economics.minimum_payout) {
    // appended in frontmatter; body mentions it
  }

  const reqLines = (content.before_you_start ?? []).map((item) => `- ${item}`).join('\n');
  const threshold = formatRequirementsThreshold(op.requirements_metrics);
  const advantages = (content.advantages_editorial ?? []).map((item) => `- ${item}`).join('\n');
  const limitations = (content.limitations_editorial ?? []).map((item) => `- ${item}`).join('\n');
  const steps = (content.getting_started ?? []).map((item) => `${item.step}. ${item.text}`).join('\n');
  const best = (content.best_for ?? []).join('; ');
  const guideLinks = joinGuideLinks(op.internal_links.guide_paths);
  const guideSentence = guideLinks.length ? ` Para el proceso, consultá ${guideLinks.join(' y ')}.` : '';
  const sourceWarning = sourceNotes.length ? `\n\n${sourceNotes.join(' ')}` : '';
  const missingLine = missing.length
    ? `\n\nEn esta revisión sigue faltando: ${missing.map((item) => item.replace(/\.$/, '')).join('; ')}.`
    : '';

  return `## Qué es y cómo se gana dinero

${content.intro}

${content.what_it_is} ${content.how_you_earn}${parentNote}${networkNote} ${editorialScope}${guideSentence}

${facts.length ? `Hechos documentados en fuentes oficiales consultadas: ${facts.join(' ')}` : 'No hay hechos numéricos adicionales verificados más allá de la descripción general del programa.'}${sourceWarning}

## Para quién puede servir

Puede tener sentido para ${best || 'quien ya produce contenido afín a esta oferta'}. Canales de encaje editorial: ${channels.map((id) => channelLabels[id] ?? id).join(', ')}. Modelos: ${models.map((id) => modelLabels[id] ?? id).join(', ')}. El tamaño de audiencia no reemplaza la intención ni el cumplimiento de políticas.

## Disponibilidad desde Argentina

**1. ¿Puede unirse un residente en Argentina?** ${joinAnswer}

**2. ¿La oferta es relevante para una audiencia en Argentina o en el exterior?** Definí el mercado de tu audiencia antes de publicar. Un catálogo en español no prueba que un residente argentino pueda registrarse o retirar fondos.

**3. ¿Cómo puede cobrar un participante argentino?** ${payoutAnswer}

Separá siempre país, aprobación individual y retiro: son tres verificaciones distintas. Esta ficha no afirma un payout local comprobado.

## Requisitos para empezar

${reqLines || '- Confirmá requisitos vigentes en la documentación oficial. Lo no listado acá no equivale a “sin requisitos”.'}
${threshold ? `\nUmbrales documentados (no extrapolables a tu cuenta): ${threshold}.` : '\nNo se verificó un umbral numérico general. No conviertas un dato ausente en cero ni en acceso universal.'}
${missingLine}

## Comisiones, ingresos y costos

${commissionLines}
${economics.minimum_payout ? `\nMínimo de pago publicado: ${economics.minimum_payout.amount} ${economics.minimum_payout.currency}. Es una condición general del programa, no una prueba de cobro argentino.` : '\nEl mínimo de retiro, si existe, quedó pendiente de verificar.'}
${economics.payout_schedule_general ? `\nCalendario general publicado: ${economics.payout_schedule_general}.` : ''}

No hay promesa de ingresos. Usá datos propios y el ingreso neto, descontando cargos, validaciones y rechazos.

## Cómo se cobra

${payoutAnswer}

## Ventajas y limitaciones

${advantages}

${limitations}

## Pasos para empezar

${steps}
`;
}

const data = JSON.parse(await readFile(jsonPath, 'utf8'));
const sourceById = Object.fromEntries(data.sources.map((source) => [source.id, source]));
const existing = new Set(data.scope.existing_slugs_observed);
const written = [];

for (const op of data.opportunities) {
  const file = path.join(outDir, `${op.slug}.md`);
  if (existing.has(op.slug) || existsSync(file)) {
    console.error(`SKIP existing ${op.slug}`);
    continue;
  }
  const eligibility = badgeMap[op.argentina.directory_badge];
  if (!eligibility) throw new Error(`Unknown badge ${op.argentina.directory_badge} for ${op.slug}`);
  const platformType = platformTypeByEntity[op.entity_type];
  if (!platformType) throw new Error(`Unknown entity ${op.entity_type}`);
  const terms = op.economics.observed_terms ?? [];
  const commissionBits = terms.filter((term) => String(term.kind).includes('commission'));
  const feeBits = terms.filter((term) => !String(term.kind).includes('commission'));
  const related = op.internal_links.related_opportunity_slugs.slice(0, 4);
  if (related.length < 3) throw new Error(`Need 3 related for ${op.slug}`);
  const channels = (op.profile_ids ?? []).filter((id) => allowedChannels.has(id));
  if (!channels.length) throw new Error(`No valid channels for ${op.slug}`);

  const threshold = formatRequirementsThreshold(op.requirements_metrics);
  const mentionsSite = (op.content.before_you_start ?? []).some((item) => /sitio|web|página/i.test(item));
  const mentionsApproval = (op.content.before_you_start ?? []).some((item) => /aprob|solicitud|evalu/i.test(item));
  const sourceEntries = (op.evidence.source_ids ?? []).map((id) => sourceById[id]).filter(Boolean);
  if (!sourceEntries.length) throw new Error(`No sources for ${op.slug}`);

  const eligibilitySourceIds = op.argentina.country_eligibility.source_ids ?? [];
  const eligibilitySource = eligibilitySourceIds.length ? sourceById[eligibilitySourceIds[0]] : null;
  const arMethods = ['payhip', 'etsy-productos-digitales', 'medium-partner-program'].includes(op.slug)
    ? op.economics.payout_methods_general
    : null;

  const faqs = op.content.faqs.map((faq) => ({
    question: faq.question,
    answer: faq.answer,
  }));

  const seoTitle = op.seo.title;
  const seoDescription = op.seo.meta_description;
  if (seoTitle.length > 80) throw new Error(`seoTitle too long ${op.slug}`);
  if (seoDescription.length > 170) throw new Error(`seoDescription too long ${op.slug}`);

  const strengths = op.content.advantages_editorial?.length ? op.content.advantages_editorial : ['Modelo identificable y fácil de comparar con alternativas'];
  const limitations = op.content.limitations_editorial?.length ? op.content.limitations_editorial : ['Faltan datos verificados de alta o cobro para Argentina'];
  const gettingStarted = (op.content.getting_started ?? []).map((item) => item.text);
  const bestFor = op.content.best_for?.length ? op.content.best_for : [op.card.summary];
  const notIdealFor = ['Quien busca ingresos garantizados o no puede verificar el cobro antes de invertir'];

  const front = [
    '---',
    `name: ${yamlScalar(op.name)}`,
    `platformType: ${platformType}`,
    `summary: ${yamlScalar(op.card.summary)}`,
    `models: ${yamlList(op.category_ids)}`,
    `channels: ${yamlList(channels)}`,
    `niches: ${yamlList([op.brand, ...(op.tags ?? []).slice(0, 2)].filter((item, index, arr) => arr.indexOf(item) === index).slice(0, 3))}`,
    `officialUrl: ${yamlScalar(op.links.official_url)}`,
    'affiliateUrl: null',
    'logo: null',
    `argentinaEligibility: ${eligibility}`,
    `argentinaEligibilityNote: ${yamlScalar(op.argentina.country_eligibility.note)}`,
  ];
  if (eligibilitySource && eligibility !== 'unverified') {
    front.push('argentinaEligibilitySource:');
    front.push(`  title: ${yamlScalar(eligibilitySource.title)}`);
    front.push(`  url: ${yamlScalar(eligibilitySource.url)}`);
  } else {
    front.push('argentinaEligibilitySource: null');
  }
  front.push(
    `audienceMarkets: ${yamlList(['Argentina', 'Mercados internacionales según oferta'])}`,
    `audienceFit: ${yamlScalar(bestFor[0])}`,
    'requirements:',
    `  websiteRequired: ${mentionsSite ? 'true' : 'null'}`,
    `  audienceThreshold: ${yamlScalar(threshold)}`,
    `  approvalRequired: ${mentionsApproval ? 'true' : 'null'}`,
    `  contentConstraints: ${yamlScalar((op.content.before_you_start ?? []).join(' ') || 'Contenido original, derechos suficientes y cumplimiento de las políticas vigentes.')}`,
    `earningModel: ${yamlScalar(op.content.how_you_earn)}`,
    `commissionRate: ${yamlScalar(commissionBits.length ? commissionBits.map(formatTerm).join(' ') : null)}`,
    `recurrence: ${yamlScalar(/recurrente|renov/i.test(op.content.how_you_earn) ? op.content.how_you_earn : null)}`,
    `attributionPeriod: ${yamlScalar(commissionBits.find((term) => /12 meses/i.test(term.basis ?? ''))?.basis ?? null)}`,
    `platformFees: ${yamlScalar(feeBits.length ? feeBits.map(formatTerm).join(' ') : null)}`,
    `argentinaPayoutMethods: ${arMethods ? yamlList(arMethods) : 'null'}`,
    'payoutCurrency: null',
    `minimumPayout: ${yamlScalar(op.economics.minimum_payout ? `${op.economics.minimum_payout.amount} ${op.economics.minimum_payout.currency} (condición general publicada; no confirma retiro argentino)` : null)}`,
    `payoutTiming: ${yamlScalar(op.economics.payout_schedule_general)}`,
    `strengths: ${yamlList(strengths)}`,
    `limitations: ${yamlList(limitations)}`,
    `bestFor: ${yamlList(bestFor)}`,
    `notIdealFor: ${yamlList(notIdealFor)}`,
    `gettingStarted: ${yamlList(gettingStarted.length ? gettingStarted : ['Revisá requisitos y elegibilidad vigentes', 'Confirmá el método de cobro disponible para Argentina', 'Solicitá el alta o configurá una prueba acotada sin asumir aceptación'])}`,
    'sources:',
  );
  for (const source of sourceEntries) {
    front.push(`  - title: ${yamlScalar(source.title)}`);
    front.push(`    url: ${yamlScalar(source.url)}`);
    front.push(`    fields: ${yamlList(sourceFields(source))}`);
    front.push(`    checkedAt: ${source.reviewed_at}`);
  }
  front.push(
    `contentUpdatedAt: ${op.evidence.reviewed_at}`,
    `eligibilityCheckedAt: ${op.evidence.reviewed_at}`,
    'reviewStatus: published',
    `seoTitle: ${yamlScalar(seoTitle)}`,
    `seoDescription: ${yamlScalar(seoDescription)}`,
    `relatedSlugs: ${yamlList(related)}`,
    'featured: false',
    'featuredRationale: null',
    'faqs:',
  );
  for (const faq of faqs) {
    front.push(`  - question: ${yamlScalar(faq.question)}`);
    front.push(`    answer: ${yamlScalar(faq.answer)}`);
  }
  front.push('---', '');

  const body = renderBody(op, sourceById);
  await writeFile(file, `${front.join('\n')}\n${body.trim()}\n`);
  written.push(op.slug);
}

console.log(`Wrote ${written.length}: ${written.join(', ')}`);
