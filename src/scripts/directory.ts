import { matchesQuery, scoreQuery } from '../lib/search';
import { foldText } from '../lib/text';

interface CardEl extends HTMLElement {
  dataset: DOMStringMap & {
    slug: string;
    name: string;
    summary: string;
    models: string;
    channels: string;
    niches: string;
    search?: string;
    type: string;
    eligibility: string;
    featured: string;
  };
}

function selected(form: HTMLFormElement, name: string): string[] {
  return [...form.querySelectorAll<HTMLInputElement>(`[name="${name}"]:checked`)].map((input) => input.value);
}

function selectedLabels(form: HTMLFormElement, name: string): string[] {
  return [...form.querySelectorAll<HTMLInputElement>(`[name="${name}"]:checked`)].map((input) => {
    const label = input.closest('label')?.querySelector('span')?.textContent?.trim();
    return label || input.value;
  });
}

function readParams(): URLSearchParams {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash) return new URLSearchParams(hash);
  return new URLSearchParams(window.location.search);
}

function writeHash(form: HTMLFormElement) {
  const params = new URLSearchParams();
  const query = (form.elements.namedItem('q') as HTMLInputElement | null)?.value.trim();
  if (query) params.set('q', query);
  for (const key of ['model', 'channel', 'eligibility', 'type']) {
    const values = selected(form, key);
    if (values.length) params.set(key, values.join(','));
  }
  const sort = (form.elements.namedItem('sort') as HTMLSelectElement | null)?.value;
  if (sort && sort !== 'az') params.set('sort', sort);
  const next = params.toString();
  form.dataset.writingHash = 'true';
  history.replaceState(null, '', `${window.location.pathname}${next ? `#${next}` : ''}`);
  window.setTimeout(() => {
    form.dataset.writingHash = 'false';
  }, 0);
}

let hashTimer = 0;
function scheduleHash(form: HTMLFormElement) {
  window.clearTimeout(hashTimer);
  hashTimer = window.setTimeout(() => writeHash(form), 180);
}

function applyState(form: HTMLFormElement) {
  const params = readParams();
  const query = params.get('q') ?? '';
  const q = form.elements.namedItem('q') as HTMLInputElement | null;
  if (q) q.value = query;
  const sort = form.elements.namedItem('sort') as HTMLSelectElement | null;
  if (sort) sort.value = params.get('sort') ?? 'az';
  for (const key of ['model', 'channel', 'eligibility', 'type']) {
    const wanted = new Set((params.get(key) ?? '').split(',').filter(Boolean));
    form.querySelectorAll<HTMLInputElement>(`[name="${key}"]`).forEach((input) => {
      input.checked = wanted.has(input.value);
    });
  }
}

function matchesGroup(haystack: string[], selectedValues: string[]): boolean {
  if (selectedValues.length === 0) return true;
  return selectedValues.some((value) => haystack.includes(value));
}

function cardHaystack(card: CardEl): string {
  return (
    card.dataset.search ||
    [card.dataset.name, card.dataset.summary, card.dataset.slug, card.dataset.models, card.dataset.channels, card.dataset.niches, card.dataset.type].join(' ')
  );
}

function filterDirectory(options: { persist?: boolean } = {}) {
  const persist = options.persist !== false;
  const form = document.querySelector<HTMLFormElement>('[data-directory-filters]');
  const grid = document.querySelector<HTMLElement>('[data-directory-grid]');
  const empty = document.querySelector<HTMLElement>('[data-empty-state]');
  const count = document.querySelector('[data-result-count]');
  const chips = document.querySelector('[data-active-chips]');
  if (!form || !grid) return;

  const cards = [...grid.querySelectorAll<CardEl>('[data-opportunity-card]')];
  const rawQuery = (form.elements.namedItem('q') as HTMLInputElement | null)?.value ?? '';
  const models = selected(form, 'model');
  const channels = selected(form, 'channel');
  const eligibility = selected(form, 'eligibility');
  const types = selected(form, 'type');
  const sort = (form.elements.namedItem('sort') as HTMLSelectElement | null)?.value ?? 'az';
  const hasQuery = foldText(rawQuery).length > 0;

  const visible: CardEl[] = [];
  for (const card of cards) {
    const haystack = cardHaystack(card);
    const okQuery = matchesQuery(haystack, rawQuery);
    const okModel = matchesGroup(card.dataset.models.split(','), models);
    const okChannel = matchesGroup(card.dataset.channels.split(','), channels);
    const okElig = matchesGroup([card.dataset.eligibility], eligibility);
    const okType = matchesGroup([card.dataset.type], types);
    const show = okQuery && okModel && okChannel && okElig && okType;
    card.hidden = !show;
    if (show) visible.push(card);
  }

  visible.sort((a, b) => {
    if (hasQuery) {
      const score =
        scoreQuery(
          b.dataset.name,
          b.dataset.slug,
          `${b.dataset.models} ${b.dataset.channels} ${b.dataset.type}`,
          cardHaystack(b),
          rawQuery,
        ) -
        scoreQuery(
          a.dataset.name,
          a.dataset.slug,
          `${a.dataset.models} ${a.dataset.channels} ${a.dataset.type}`,
          cardHaystack(a),
          rawQuery,
        );
      if (score !== 0) return score;
    } else if (sort === 'editorial') {
      const featured = Number(b.dataset.featured === 'true') - Number(a.dataset.featured === 'true');
      if (featured !== 0) return featured;
    }
    return a.dataset.name.localeCompare(b.dataset.name, 'es');
  });
  visible.forEach((card, index) => {
    card.style.order = String(index);
  });
  cards.forEach((card) => {
    if (card.hidden) card.style.order = '9999';
  });

  if (count) {
    count.textContent =
      visible.length === cards.length
        ? `${visible.length} ficha${visible.length === 1 ? '' : 's'}`
        : `${visible.length} de ${cards.length} fichas`;
  }
  if (empty) empty.hidden = visible.length > 0;
  if (chips) {
    const labels: string[] = [];
    const trimmed = rawQuery.trim();
    if (trimmed) labels.push(`“${trimmed}”`);
    labels.push(
      ...selectedLabels(form, 'model'),
      ...selectedLabels(form, 'channel'),
      ...selectedLabels(form, 'eligibility'),
      ...selectedLabels(form, 'type'),
    );
    chips.replaceChildren(
      ...labels.map((label) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = label;
        return chip;
      }),
    );
  }
  if (persist) scheduleHash(form);
}

function enhanceSearchForms() {
  document.querySelectorAll<HTMLFormElement>('[data-enhanced-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[type="search"]') as HTMLInputElement | null;
      const value = input?.value.trim() ?? '';
      window.location.href = value ? `/oportunidades/#q=${encodeURIComponent(value)}` : '/oportunidades/';
    });
  });
}

const form = document.querySelector<HTMLFormElement>('[data-directory-filters]');
if (form) {
  applyState(form);
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', () => filterDirectory());
  form.addEventListener('change', () => filterDirectory());
  form.addEventListener('reset', () => {
    window.clearTimeout(hashTimer);
    window.setTimeout(() => {
      history.replaceState(null, '', window.location.pathname);
      filterDirectory({ persist: false });
    }, 0);
  });
  filterDirectory({ persist: false });
  if (window.location.search && !window.location.hash) writeHash(form);
  const queryField = form.elements.namedItem('q') as HTMLInputElement | null;
  if (queryField?.value.trim() && document.activeElement !== queryField) {
    queryField.focus({ preventScroll: true });
    queryField.setSelectionRange(queryField.value.length, queryField.value.length);
  }
  window.addEventListener('hashchange', () => {
    if (form.dataset.writingHash === 'true') return;
    applyState(form);
    filterDirectory({ persist: false });
  });
}

enhanceSearchForms();
