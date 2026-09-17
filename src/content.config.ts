import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import {
  channelIds,
  eligibilityIds,
  modelIds,
  platformTypeIds,
  reviewStatusIds,
} from './data/taxonomies';

const sourceSchema = z.object({
  title: z.string(),
  url: z.url(),
  fields: z.array(z.string()),
  checkedAt: z.coerce.date().nullable(),
});

const opportunitySchema = z.object({
  name: z.string(),
  platformType: z.enum(platformTypeIds),
  summary: z.string().max(280),
  models: z.array(z.enum(modelIds)).min(1),
  channels: z.array(z.enum(channelIds)).min(1),
  niches: z.array(z.string()).min(1),
  officialUrl: z.url(),
  affiliateUrl: z.url().nullable(),
  logo: z.string().nullable(),
  argentinaEligibility: z.enum(eligibilityIds),
  argentinaEligibilityNote: z.string(),
  argentinaEligibilitySource: z
    .object({
      title: z.string(),
      url: z.url(),
    })
    .nullable(),
  audienceMarkets: z.array(z.string()).min(1),
  audienceFit: z.string(),
  requirements: z.object({
    websiteRequired: z.boolean().nullable(),
    audienceThreshold: z.string().nullable(),
    approvalRequired: z.boolean().nullable(),
    contentConstraints: z.string().nullable(),
  }),
  earningModel: z.string(),
  commissionRate: z.string().nullable(),
  recurrence: z.string().nullable(),
  attributionPeriod: z.string().nullable(),
  platformFees: z.string().nullable(),
  argentinaPayoutMethods: z.array(z.string()).nullable(),
  payoutCurrency: z.string().nullable(),
  minimumPayout: z.string().nullable(),
  payoutTiming: z.string().nullable(),
  strengths: z.array(z.string()).min(1),
  limitations: z.array(z.string()).min(1),
  bestFor: z.array(z.string()).min(1),
  notIdealFor: z.array(z.string()).min(1),
  gettingStarted: z.array(z.string()).min(1),
  sources: z.array(sourceSchema).min(1),
  contentUpdatedAt: z.coerce.date(),
  eligibilityCheckedAt: z.coerce.date().nullable(),
  reviewStatus: z.enum(reviewStatusIds),
  seoTitle: z.string().max(70),
  seoDescription: z.string().max(170),
  relatedSlugs: z.array(z.string()).min(3).max(4),
  featured: z.boolean(),
  featuredRationale: z.string().nullable(),
  faqs: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    }),
  ),
});

const guideSchema = z.object({
  title: z.string(),
  summary: z.string(),
  seoTitle: z.string().max(70),
  seoDescription: z.string().max(170),
  publishedAt: z.coerce.date(),
  contentUpdatedAt: z.coerce.date(),
  relatedOpportunitySlugs: z.array(z.string()),
  relatedGuideSlugs: z.array(z.string()),
  sources: z.array(sourceSchema),
});

const taxonomyPageSchema = z.object({
  title: z.string(),
  eyebrow: z.string(),
  summary: z.string(),
  seoTitle: z.string().max(70),
  seoDescription: z.string().max(170),
  selectionTips: z.array(z.string()).min(2),
  contentUpdatedAt: z.coerce.date(),
});

const opportunities = defineCollection({
  loader: glob({ base: './src/content/opportunities', pattern: '**/*.md' }),
  schema: opportunitySchema,
});

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.md' }),
  schema: guideSchema,
});

const categories = defineCollection({
  loader: glob({ base: './src/content/categories', pattern: '**/*.md' }),
  schema: taxonomyPageSchema,
});

const profiles = defineCollection({
  loader: glob({ base: './src/content/profiles', pattern: '**/*.md' }),
  schema: taxonomyPageSchema,
});

export const collections = {
  opportunities,
  guides,
  categories,
  profiles,
};
