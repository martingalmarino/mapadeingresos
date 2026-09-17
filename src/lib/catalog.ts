import { getCollection, type CollectionEntry } from 'astro:content';
import {
  channels,
  models,
  platformTypes,
  type ChannelId,
  type EligibilityId,
  type ModelId,
  type PlatformTypeId,
} from '../data/taxonomies';
import { searchAliases } from './search';
import { opportunityPath } from './urls';

export type OpportunityEntry = CollectionEntry<'opportunities'>;
export type GuideEntry = CollectionEntry<'guides'>;

export interface OpportunityCardData {
  slug: string;
  name: string;
  summary: string;
  models: ModelId[];
  modelLabels: string[];
  channels: string[];
  niches: string[];
  searchText: string;
  platformType: PlatformTypeId;
  platformTypeLabel: string;
  isNetwork: boolean;
  argentinaEligibility: EligibilityId;
  featured: boolean;
  href: string;
}

export function slugOf(entry: OpportunityEntry | GuideEntry): string {
  return entry.id.replace(/\.md$/, '');
}

export function buildSearchText(entry: OpportunityEntry): string {
  const slug = slugOf(entry);
  const channelLabels = entry.data.channels.map((id) => channels[id as ChannelId]?.label ?? id);
  return [
    entry.data.name,
    entry.data.summary,
    slug.replace(/-/g, ' '),
    ...entry.data.models.flatMap((id) => [id.replace(/-/g, ' '), models[id].label, models[id].shortLabel]),
    ...entry.data.channels.map((id) => id.replace(/-/g, ' ')),
    ...channelLabels,
    entry.data.platformType.replace(/-/g, ' '),
    platformTypes[entry.data.platformType].label,
    ...entry.data.niches,
    searchAliases[slug] ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function toCardData(entry: OpportunityEntry): OpportunityCardData {
  const slug = slugOf(entry);
  return {
    slug,
    name: entry.data.name,
    summary: entry.data.summary,
    models: entry.data.models,
    modelLabels: entry.data.models.map((model) => models[model].label),
    channels: entry.data.channels,
    niches: entry.data.niches,
    searchText: buildSearchText(entry),
    platformType: entry.data.platformType,
    platformTypeLabel: platformTypes[entry.data.platformType].label,
    isNetwork: platformTypes[entry.data.platformType].isNetwork,
    argentinaEligibility: entry.data.argentinaEligibility,
    featured: entry.data.featured,
    href: opportunityPath(slug),
  };
}

export async function getPublishedOpportunities(): Promise<OpportunityEntry[]> {
  const items = await getCollection('opportunities', ({ data }) => data.reviewStatus !== 'draft');
  return items.sort((a, b) => a.data.name.localeCompare(b.data.name, 'es'));
}

export async function getPublishedGuides(): Promise<GuideEntry[]> {
  const items = await getCollection('guides');
  return items.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function byModel(items: OpportunityEntry[], model: ModelId): OpportunityEntry[] {
  return items.filter((item) => item.data.models.includes(model));
}

export function byChannel(items: OpportunityEntry[], channel: string): OpportunityEntry[] {
  return items.filter((item) => item.data.channels.includes(channel as never));
}

export function featuredFirst(items: OpportunityEntry[]): OpportunityEntry[] {
  return [...items].sort((a, b) => Number(b.data.featured) - Number(a.data.featured) || a.data.name.localeCompare(b.data.name, 'es'));
}

export function relatedOpportunities(
  current: OpportunityEntry,
  catalog: OpportunityEntry[],
): OpportunityEntry[] {
  const wanted = new Set(current.data.relatedSlugs);
  const related = catalog.filter((item) => item.id !== current.id && wanted.has(slugOf(item)));
  return related.slice(0, 4);
}
