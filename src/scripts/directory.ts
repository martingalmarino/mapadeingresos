import { foldText } from '../lib/text';

interface CardEl extends HTMLElement {
  dataset: DOMStringMap & {
    slug: string;
    name: string;
    summary: string;
    models: string;
    channels: string;
    niches: string;
    type: string;
    eligibility: string;
    featured: string;
  };
}

function selected(form: HTMLFormElement, name: string): string[] {
  return [...form.querySelectorAll<HTMLInputElement>(`[name="${name}"]:checked`)].map((input) => input.value);
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
  if (form) form.dataset.writingHash = 'true';
  history.replaceState(null, '', `${window.location.pathname}${next ? `#${next}` : ''}`);
  if (form) window.setTimeout(() => {
    form.dataset.writingHash = 'false';
  }, 0);
}

function applyHash(form: HTMLFormElement) {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
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

function filterDirectory() {
  const form = document.querySelector<HTMLFormElement>('[data-directory-filters]');
  const grid = document.querySelector<HTMLElement>('[data-directory-grid]');
  const empty = document.querySelector<HTMLElement>('[data-empty-state]');
  const count = document.querySelector('[data-result-count]');
  const chips = document.querySelector('[data-active-chips]');
  if (!form || !grid) return;

  const cards = [...grid.querySelectorAll<CardEl>('[data-opportunity-card]')];
  const query = foldText((form.elements.namedItem('q') as HTMLInputElement | null)?.value ?? '');
  const models = selected(form, 'model');
  const channels = selected(form, 'channel');
  const eligibility = selected(form, 'eligibility');
  const types = selected(form, 'type');
  const sort = (form.elements.namedItem('sort') as HTMLSelectElement | null)?.value ?? 'az';

  const visible: CardEl[] = [];
  for (const card of cards) {
    const haystack = foldText(
      [card.dataset.name, card.dataset.summary, card.dataset.models, card.dataset.niches, card.dataset.type].join(' '),
    );
    const okQuery = query.length === 0 || haystack.includes(query);
    const okModel = matchesGroup(card.dataset.models.split(','), models);
    const okChannel = matchesGroup(card.dataset.channels.split(','), channels);
    const okElig = matchesGroup([card.dataset.eligibility], eligibility);
    const okType = matchesGroup([card.dataset.type], types);
    const show = okQuery && okModel && okChannel && okElig && okType;
    card.hidden = !show;
    if (show) visible.push(card);
  }

  visible.sort((a, b) => {
    if (sort === 'editorial') {
      const featured = Number(b.dataset.featured === 'true') - Number(a.dataset.featured === 'true');
      if (featured !== 0) return featured;
    }
    return a.dataset.name.localeCompare(b.dataset.name, 'es');
  });
  visible.forEach((card) => grid.append(card));

  if (count) count.textContent = `${visible.length} oportunidad${visible.length === 1 ? '' : 'es'}`;
  if (empty) empty.hidden = visible.length > 0;
  if (chips) {
    const labels: string[] = [];
    if (query) labels.push(query);
    labels.push(...models, ...channels, ...eligibility, ...types);
    chips.replaceChildren(
      ...labels.map((label) => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = label;
        return chip;
      }),
    );
  }
  writeHash(form);
}

function enhanceSearchForms() {
  document.querySelectorAll<HTMLFormElement>('[data-enhanced-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const input = form.querySelector('input[type="search"]') as HTMLInputElement | null;
      const value = input?.value.trim() ?? '';
      if (!value) return;
      event.preventDefault();
      window.location.href = `/oportunidades/#q=${encodeURIComponent(value)}`;
    });
  });
}

const form = document.querySelector<HTMLFormElement>('[data-directory-filters]');
if (form) {
  applyHash(form);
  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', filterDirectory);
  form.addEventListener('reset', () => {
    window.setTimeout(() => {
      history.replaceState(null, '', window.location.pathname);
      filterDirectory();
    }, 0);
  });
  filterDirectory();
  window.addEventListener('hashchange', () => {
    if (form.dataset.writingHash === 'true') return;
    applyHash(form);
    filterDirectory();
  });
}

enhanceSearchForms();
