import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const opportunitiesDir = path.join(root, 'src/content/opportunities');
const requiredExisting = [
  'mercado-libre-afiliados',
  'hotmart',
  'amazon-associates',
  'hostinger-afiliados',
  'siteground-afiliados',
  'semrush-afiliados',
  'adobe-afiliados',
  'tiendanube-socios',
  'awin',
  'impact',
  'cj',
  'partnerstack',
  'travelpayouts',
  'google-adsense',
  'the-moneytizer',
  'ezoic',
  'youtube-partners',
  'cafecito',
  'patreon',
  'gumroad',
  'udemy',
  'adobe-stock',
  'google-admob',
  'ko-fi',
  'shutterstock-contributor',
];

const requiredNew = [
  'shopify-afiliados',
  'fiverr-afiliados',
  'elementor-afiliados',
  'hubspot-afiliados',
  'systeme-io-afiliados',
  'brevo-afiliados',
  'getresponse-afiliados',
  'civitatis-afiliados',
  'nordvpn-afiliados',
  'payhip',
  'etsy-productos-digitales',
  'amazon-kdp',
  'twitch',
  'medium-partner-program',
  'journey-mediavine',
  'facebook-content-monetization',
  'facebook-stars',
  'instagram-gifts',
  'instagram-suscripciones',
  'facebook-suscripciones',
];

function extractFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) throw new Error('Missing frontmatter');
  return match[1];
}

function getScalar(frontmatter, key) {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, 'm'));
  return match ? match[1].trim() : undefined;
}

function getList(frontmatter, key) {
  const inline = frontmatter.match(new RegExp(`^${key}:\\s*\\[(.*)\\]\\s*$`, 'm'));
  if (inline) {
    return inline[1]
      .split(',')
      .map((item) => item.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  const block = frontmatter.match(new RegExp(`^${key}:\\n((?:\\s+- .*(?:\\n|$))+`, 'm'));
  if (!block) return [];
  return block[1]
    .split('\n')
    .map((line) => line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);
}

const files = (await readdir(opportunitiesDir)).filter((file) => file.endsWith('.md')).sort();
const slugs = files.map((file) => file.replace(/\.md$/, ''));
const errors = [];

if (slugs.length !== 45) errors.push(`Expected 45 opportunities, found ${slugs.length}`);
if (new Set(slugs).size !== slugs.length) errors.push('Duplicate slugs');
for (const slug of [...requiredExisting, ...requiredNew]) {
  if (!slugs.includes(slug)) errors.push(`Missing ${slug}`);
}
const slugSet = new Set(slugs);

const affiliateUrls = [];
const relatedMissing = [];
const confirmedWithoutSource = [];
const featured = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const raw = await readFile(path.join(opportunitiesDir, file), 'utf8');
  const frontmatter = extractFrontmatter(raw);
  const affiliateUrl = getScalar(frontmatter, 'affiliateUrl');
  if (affiliateUrl && affiliateUrl !== 'null') affiliateUrls.push(`${slug}: ${affiliateUrl}`);
  if (getScalar(frontmatter, 'featured') === 'true') featured.push(slug);
  const related = getList(frontmatter, 'relatedSlugs');
  for (const item of related) {
    if (!slugSet.has(item) || item === slug) relatedMissing.push(`${slug} -> ${item}`);
  }
  if (getScalar(frontmatter, 'argentinaEligibility') === 'confirmed') {
    if (!frontmatter.includes('argentinaEligibilitySource:') || frontmatter.includes('argentinaEligibilitySource: null')) {
      confirmedWithoutSource.push(slug);
    }
  }
}

if (affiliateUrls.length) errors.push(`Invented affiliate URLs: ${affiliateUrls.join(', ')}`);
if (relatedMissing.length) errors.push(`Invalid relatedSlugs: ${relatedMissing.join(', ')}`);
if (confirmedWithoutSource.length) errors.push(`Confirmed eligibility without source: ${confirmedWithoutSource.join(', ')}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`OK: ${slugs.length} unique opportunities, ${featured.length} featured, no affiliate URLs.`);
