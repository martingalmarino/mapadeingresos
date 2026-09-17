const STORAGE_KEY = 'mapadeingresos:compare';
const LIMIT = 3;

function readHash(): string[] {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return (hash.get('compare') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, LIMIT);
}

function readStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, LIMIT) : [];
  } catch {
    return [];
  }
}

function writeStorage(slugs: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // Storage may be disabled.
  }
}

export function getCompareSlugs(): string[] {
  const fromHash = readHash();
  if (fromHash.length > 0) return fromHash;
  return readStorage();
}

export function setCompareSlugs(slugs: string[]) {
  const unique = [...new Set(slugs)].slice(0, LIMIT);
  writeStorage(unique);
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  if (unique.length > 0) params.set('compare', unique.join(','));
  else params.delete('compare');
  const next = params.toString();
  const url = `${window.location.pathname}${window.location.search}${next ? `#${next}` : ''}`;
  history.replaceState(null, '', url);
  syncUi(unique);
}

function syncUi(slugs: string[]) {
  document.querySelectorAll<HTMLButtonElement>('[data-compare-toggle]').forEach((button) => {
    const slug = button.dataset.compareToggle;
    const pressed = Boolean(slug && slugs.includes(slug));
    button.setAttribute('aria-pressed', String(pressed));
  });

  const tray = document.querySelector<HTMLElement>('[data-compare-tray]');
  const label = document.querySelector('[data-tray-label]');
  const link = document.querySelector<HTMLAnchorElement>('[data-tray-link]');
  if (!tray || !label || !link) return;
  tray.hidden = slugs.length === 0;
  label.textContent =
    slugs.length === 0
      ? 'Ninguna ficha seleccionada para comparar.'
      : `${slugs.length} de ${LIMIT} fichas listas para comparar.`;
  link.href = `/comparar/${slugs.length ? `#compare=${slugs.join(',')}` : ''}`;
}

function announce(message: string) {
  let live = document.getElementById('compare-live');
  if (!live) {
    live = document.createElement('div');
    live.id = 'compare-live';
    live.className = 'visually-hidden';
    live.setAttribute('aria-live', 'polite');
    document.body.append(live);
  }
  live.textContent = message;
}

document.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  const button = target?.closest<HTMLButtonElement>('[data-compare-toggle]');
  if (button) {
    const slug = button.dataset.compareToggle;
    if (!slug) return;
    const current = getCompareSlugs();
    if (current.includes(slug)) {
      setCompareSlugs(current.filter((item) => item !== slug));
      announce(`${slug} quitada de la comparación.`);
      return;
    }
    if (current.length >= LIMIT) {
      announce(`Podés comparar hasta ${LIMIT} fichas. Quitá una para agregar otra.`);
      return;
    }
    setCompareSlugs([...current, slug]);
    announce(`${slug} agregada a la comparación.`);
  }

  if (target?.closest('[data-tray-clear]')) {
    setCompareSlugs([]);
    announce('Comparación vaciada.');
  }
});

syncUi(getCompareSlugs());
