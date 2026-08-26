/**
 * Local card database: downloads the full TCGdex English catalog once
 * (~23k cards, ~2.3MB), caches it in IndexedDB for 7 days, and provides
 * instant fuzzy search over every card ever released.
 */

const CARDS_URL = "https://api.tcgdex.net/v2/en/cards";
const SETS_URL = "https://api.tcgdex.net/v2/en/sets";
const DB_NAME = "tradechu";
const STORE = "kv";
const CACHE_KEY = "cardIndex.v2";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface RawIndexCard {
  id: string;
  localId?: string;
  name: string;
  image?: string;
}

interface RawSet {
  id: string;
  name: string;
}

interface StoredCatalog {
  fetchedAt: number;
  cards: RawIndexCard[];
  sets: RawSet[];
}

export interface IndexedCard {
  id: string;
  localId: string;
  name: string;
  /** TCGdex image base URL (append /low.webp or /high.webp); some cards have none */
  image?: string;
  setName: string;
  /** Position of the set in the chronological sets list (higher = newer) */
  setOrder: number;
}

interface NameEntry {
  raw: string;
  norm: string;
  words: string[];
  /** setOrder of the newest printing, for recency tie-breaks */
  newestOrder: number;
}

export interface CardIndex {
  printingsByNorm: Map<string, IndexedCard[]>;
  names: NameEntry[];
}

// ---------- IndexedDB helpers ----------

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function idbPut(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Cache write failure is non-fatal; the index still works in memory.
  }
}

// ---------- Normalization ----------

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------- Index build / load ----------

let indexPromise: Promise<CardIndex | null> | null = null;
let builtIndex: CardIndex | null = null;

async function fetchCatalog(): Promise<StoredCatalog> {
  const [cardsRes, setsRes] = await Promise.all([fetch(CARDS_URL), fetch(SETS_URL)]);
  if (!cardsRes.ok || !setsRes.ok) throw new Error("catalog fetch failed");
  const cards: RawIndexCard[] = await cardsRes.json();
  const sets: RawSet[] = await setsRes.json();
  return {
    fetchedAt: Date.now(),
    // Keep every card, including ones without images (shown as placeholders).
    cards: cards.map((c) => ({ id: c.id, localId: c.localId, name: c.name, image: c.image })),
    sets: sets.map((s) => ({ id: s.id, name: s.name })),
  };
}

function buildIndex(catalog: StoredCatalog): CardIndex {
  const setName = new Map<string, string>();
  const setOrder = new Map<string, number>();
  catalog.sets.forEach((s, i) => {
    setName.set(s.id, s.name);
    setOrder.set(s.id, i);
  });

  const printingsByNorm = new Map<string, IndexedCard[]>();
  const rawByNorm = new Map<string, string>();

  for (const c of catalog.cards) {
    const setId = c.id.includes("-") ? c.id.slice(0, c.id.lastIndexOf("-")) : c.id;
    const card: IndexedCard = {
      id: c.id,
      localId: c.localId ?? "",
      name: c.name,
      image: c.image,
      setName: setName.get(setId) ?? "",
      setOrder: setOrder.get(setId) ?? -1,
    };
    const norm = normalizeName(c.name);
    if (!norm) continue;
    const list = printingsByNorm.get(norm);
    if (list) list.push(card);
    else {
      printingsByNorm.set(norm, [card]);
      rawByNorm.set(norm, c.name);
    }
  }

  const names: NameEntry[] = [];
  for (const [norm, printings] of printingsByNorm) {
    printings.sort((a, b) => b.setOrder - a.setOrder);
    names.push({
      raw: rawByNorm.get(norm)!,
      norm,
      words: norm.split(" "),
      newestOrder: printings[0].setOrder,
    });
  }

  return { printingsByNorm, names };
}

/** Load the index (IndexedDB cache first, network otherwise). Safe to call repeatedly. */
export function ensureCardIndex(): Promise<CardIndex | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!indexPromise) {
    indexPromise = (async () => {
      try {
        const cached = await idbGet<StoredCatalog>(CACHE_KEY);
        if (cached && Date.now() - cached.fetchedAt < MAX_AGE_MS) {
          builtIndex = buildIndex(cached);
          return builtIndex;
        }
        try {
          const fresh = await fetchCatalog();
          void idbPut(CACHE_KEY, fresh);
          builtIndex = buildIndex(fresh);
        } catch {
          // Network failed: fall back to a stale cache if we have one.
          if (cached) builtIndex = buildIndex(cached);
        }
        return builtIndex;
      } catch {
        return null;
      }
    })();
  }
  return indexPromise;
}

/** Synchronous access: returns the index only if it has finished loading. */
export function peekCardIndex(): CardIndex | null {
  return builtIndex;
}

// ---------- Fuzzy matching ----------

/** Levenshtein distance with early exit once it exceeds maxDist. */
function boundedEditDistance(a: string, b: string, maxDist: number): number {
  if (Math.abs(a.length - b.length) > maxDist) return maxDist + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  const curr = new Array<number>(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
      if (curr[j] < rowMin) rowMin = curr[j];
    }
    if (rowMin > maxDist) return maxDist + 1;
    prev = curr.slice();
  }
  return prev[b.length];
}

/** Lower score = better match. Infinity = no match. */
function scoreName(entry: NameEntry, q: string): number {
  if (entry.norm === q) return 0;
  if (entry.norm.startsWith(q)) return 1;
  if (entry.words.some((w) => w.startsWith(q))) return 2;
  if (entry.norm.includes(q)) return 3;
  if (q.length >= 4) {
    const maxDist = q.length >= 7 ? 2 : 1;
    let best = maxDist + 1;
    for (const w of [entry.norm, ...entry.words]) {
      const d = boundedEditDistance(w, q, maxDist);
      if (d < best) best = d;
      if (best === 1) break;
    }
    if (best <= maxDist) return 4 + best;
  }
  return Infinity;
}

export interface LocalSearchOptions {
  limit?: number;
  /** Cap printings per distinct card name (diversity for scanner suggestions). */
  maxPerName?: number;
}

/** Instant fuzzy search over all card names. Results are newest-set-first per name. */
export function searchIndex(
  index: CardIndex,
  query: string,
  { limit = 2000, maxPerName = 2000 }: LocalSearchOptions = {}
): IndexedCard[] {
  const q = normalizeName(query);
  if (q.length < 2) return [];

  const scored: { entry: NameEntry; score: number }[] = [];
  for (const entry of index.names) {
    const s = scoreName(entry, q);
    if (s !== Infinity) scored.push({ entry, score: s });
  }
  scored.sort((a, b) => a.score - b.score || b.entry.newestOrder - a.entry.newestOrder);

  const results: IndexedCard[] = [];
  for (const { entry } of scored) {
    const printings = index.printingsByNorm.get(entry.norm) ?? [];
    for (const card of printings.slice(0, maxPerName)) {
      results.push(card);
      if (results.length >= limit) return results;
    }
  }
  return results;
}

// ---------- OCR text matching ----------

const OCR_STOPWORDS = new Set([
  "basic", "stage", "evolves", "from", "the", "and", "put", "onto", "your",
  "bench", "hand", "this", "card", "when", "you", "may", "pokemon", "trainer",
  "item", "supporter", "ability", "attack", "damage", "coin", "flip", "each",
  "with", "that", "into", "them", "then", "for", "all", "one", "two",
]);

/**
 * Match noisy OCR text against every known card name. Generates unigram and
 * bigram candidates from the OCR tokens, fuzzy-scores each against the name
 * index, and returns diverse ranked suggestions (top printings per name).
 */
export function suggestFromOcr(
  index: CardIndex,
  text: string,
  limit = 12
): { query: string; cards: IndexedCard[] } {
  const cleaned = normalizeName(text.replace(/\bhp\s*\d+|\d+\s*hp\b/gi, " "));
  const tokens = cleaned
    .split(" ")
    .filter((t) => t.length >= 3 && !OCR_STOPWORDS.has(t) && !/^\d+$/.test(t));

  if (tokens.length === 0) return { query: "", cards: [] };

  // Bigrams first (multi-word names like "iron hands"), then single tokens.
  const candidates: { text: string; weight: number }[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    candidates.push({ text: `${tokens[i]} ${tokens[i + 1]}`, weight: 0 });
  }
  for (const t of tokens) candidates.push({ text: t, weight: 0.5 });

  const bestByNorm = new Map<string, { entry: NameEntry; score: number; query: string }>();
  for (const cand of candidates.slice(0, 24)) {
    for (const entry of index.names) {
      const s = scoreName(entry, cand.text);
      if (s === Infinity) continue;
      const weighted = s + cand.weight;
      const existing = bestByNorm.get(entry.norm);
      if (!existing || weighted < existing.score) {
        bestByNorm.set(entry.norm, { entry, score: weighted, query: cand.text });
      }
    }
  }

  const ranked = [...bestByNorm.values()].sort(
    (a, b) => a.score - b.score || b.entry.newestOrder - a.entry.newestOrder
  );

  const cards: IndexedCard[] = [];
  for (const { entry } of ranked) {
    const printings = index.printingsByNorm.get(entry.norm) ?? [];
    // Prefer printings with artwork for the visual suggestion picker.
    const withArt = printings.filter((p) => p.image);
    for (const card of (withArt.length > 0 ? withArt : printings).slice(0, 2)) {
      cards.push(card);
      if (cards.length >= limit) break;
    }
    if (cards.length >= limit) break;
  }

  return { query: ranked[0]?.query ?? tokens[0], cards };
}
