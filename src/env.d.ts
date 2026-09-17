interface ImportMetaEnv {
  readonly PUBLIC_SITE_ORIGIN?: string;
  readonly PUBLIC_SITE_INDEXING?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly VERCEL_ENV?: string;
  readonly SITE_NOINDEX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
