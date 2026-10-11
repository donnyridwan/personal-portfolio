// Case-study block registry shared by the page renderer, the CMS editor and the /api functions.
// Keep it framework-free: icons for the CMS live in BlockEditor.jsx.

export const BLOCK_TYPES = [
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
  { type: 'gallery', label: 'Gallery' },
  { type: 'video', label: 'Video' },
  { type: 'metrics', label: 'Metrics' },
  { type: 'quote', label: 'Quote' },
];

const KNOWN_TYPES = new Set(BLOCK_TYPES.map((b) => b.type));
const MAX_METRICS = 4;

const str = (v) => (typeof v === 'string' ? v : '');
const arr = (v) => (Array.isArray(v) ? v : []);

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `b-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createBlock(type) {
  const block = normalizeBlock({ id: newId(), type });
  if (block && type === 'metrics') {
    block.items = [{ value: '', label: '' }, { value: '', label: '' }];
  }
  return block;
}

// normalizeBlock rebuilds every nested array/object, so the copy shares nothing with the original
export function duplicateBlock(block) {
  return normalizeBlock({ ...block, id: newId() });
}

// Applies a patch to one block by id. A function patch is computed from the block's current
// value, so async callers (e.g. uploads finishing later) never overwrite newer edits.
export function patchBlock(blocks, id, patch) {
  return blocks.map((b) => {
    if (b.id !== id) return b;
    const changes = typeof patch === 'function' ? patch(b) : patch;
    return { ...b, ...changes };
  });
}

export function normalizeBlock(raw) {
  if (!raw || typeof raw !== 'object' || !KNOWN_TYPES.has(raw.type)) return null;
  const base = { id: str(raw.id) || newId(), type: raw.type };

  switch (raw.type) {
    case 'text':
      return { ...base, label: str(raw.label), heading: str(raw.heading), body: str(raw.body) };
    case 'image':
    case 'video':
      return { ...base, url: str(raw.url), caption: str(raw.caption) };
    case 'gallery':
      return {
        ...base,
        columns: raw.columns === 3 ? 3 : 2,
        images: arr(raw.images)
          .filter((img) => img && typeof img === 'object')
          .map((img) => ({ url: str(img.url), caption: str(img.caption) })),
      };
    case 'metrics':
      return {
        ...base,
        items: arr(raw.items)
          .filter((item) => item && typeof item === 'object')
          .slice(0, MAX_METRICS)
          .map((item) => ({ value: str(item.value), label: str(item.label) })),
      };
    case 'quote':
      return { ...base, text: str(raw.text), name: str(raw.name), role: str(raw.role) };
    default:
      return null;
  }
}

export function isRenderable(block) {
  if (!block) return false;
  switch (block.type) {
    case 'text':
      return Boolean(str(block.heading).trim() || str(block.body).trim());
    case 'image':
    case 'video':
      return Boolean(str(block.url).trim());
    case 'gallery':
      return arr(block.images).some((img) => str(img?.url).trim());
    case 'metrics':
      return arr(block.items).some((item) => str(item?.value).trim());
    case 'quote':
      return Boolean(str(block.text).trim());
    default:
      return false;
  }
}

// Detail-page cover, separate from the grid thumbnail; empty url means "use the grid cover"
function normalizeCover(raw) {
  const cover = raw && typeof raw === 'object' ? raw : {};
  return { url: str(cover.url), mediaType: cover.mediaType === 'video' ? 'video' : 'image' };
}

export function normalizeCaseStudy(raw) {
  let data = raw;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      data = null;
    }
  }
  if (!data || typeof data !== 'object') data = {};

  return {
    client: str(data.client),
    summary: str(data.summary),
    liveUrl: str(data.liveUrl),
    cover: normalizeCover(data.cover),
    blocks: arr(data.blocks).map(normalizeBlock).filter(Boolean),
  };
}
