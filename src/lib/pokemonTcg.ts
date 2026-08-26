import type { Rarity } from "@/types";
import {
  ensureCardIndex,
  peekCardIndex,
  searchIndex,
  suggestFromOcr,
  type IndexedCard,
} from "@/lib/cardIndex";

export interface ApiCard {
  id: string;
  name: string;
  setName: string;
  cardNumber: string;
  rarity: Rarity;
  imageSmall: string;
  imageLarge: string;
}

// TCGdex: open-source card database, no API key required.
const API_BASE = "https://api.tcgdex.net/v2";
const GRAPHQL_URL = `${API_BASE}/graphql`;

function mapRarity(raw?: string): Rarity {
  if (!raw || raw === "None") return "Rare";
  const r = raw.toLowerCase();
  if (r.includes("secret")) return "Secret Rare";
  if (r.includes("ultra") || r.includes("hyper") || r.includes("rainbow") || r.includes("double"))
    return "Ultra Rare";
  if (r.includes("holo") || r.includes("illustration")) return "Holo";
  if (r.includes("promo")) return "Promo";
  if (r.includes("uncommon")) return "Uncommon";
  if (r.includes("common")) return "Common";
  return "Rare";
}

function indexedToApiCard(c: IndexedCard): ApiCard {
  return {
    id: c.id,
    name: c.name,
    setName: c.setName,
    cardNumber: c.localId,
    // Real rarity is filled in by getCardDetail() when the user selects the card.
    rarity: "Rare",
    imageSmall: c.image ? `${c.image}/low.webp` : "",
    imageLarge: c.image ? `${c.image}/high.webp` : "",
  };
}

/**
 * Search all released cards. Uses the instant local index when it's loaded;
 * falls back to the remote GraphQL API while the index is still downloading.
 */
export async function searchCards(query: string, signal?: AbortSignal): Promise<ApiCard[]> {
  const index = peekCardIndex();
  if (index) {
    return searchIndex(index, query).map(indexedToApiCard);
  }
  void ensureCardIndex();
  return searchCardsRemote(query, signal);
}

interface RawGqlCard {
  id: string;
  localId?: string;
  name: string;
  rarity?: string;
  image?: string | null;
  set?: { name?: string } | null;
}

async function searchCardsRemote(query: string, signal?: AbortSignal): Promise<ApiCard[]> {
  const q = query.trim().replace(/["\\]/g, "");
  if (q.length < 2) return [];

  const gqlQuery = `query {
    cards(filters: { name: "${q}" }, pagination: { page: 1, itemsPerPage: 80 }) {
      id localId name rarity image
      set { name }
    }
  }`;

  try {
    const timeout = AbortSignal.timeout(10000);
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: gqlQuery }),
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
    if (!res.ok) return [];
    const json: { data?: { cards?: RawGqlCard[] } } = await res.json();
    const ql = q.toLowerCase();
    const score = (c: RawGqlCard) => {
      const n = c.name.toLowerCase();
      return n === ql ? 0 : n.startsWith(ql) ? 1 : 2;
    };
    return (json.data?.cards ?? [])
      .filter((c) => c.image)
      .sort((a, b) => score(a) - score(b))
      .slice(0, 24)
      .map((c) => ({
        id: c.id,
        name: c.name,
        setName: c.set?.name ?? "",
        cardNumber: c.localId ?? "",
        rarity: mapRarity(c.rarity),
        imageSmall: `${c.image}/low.webp`,
        imageLarge: `${c.image}/high.webp`,
      }));
  } catch {
    return [];
  }
}

/**
 * Fetch full details (real rarity, set name) for a selected card.
 * Returns null on failure; callers keep the placeholder values.
 */
export async function getCardDetail(
  id: string
): Promise<{ rarity: Rarity; setName: string } | null> {
  try {
    const res = await fetch(`${API_BASE}/en/cards/${encodeURIComponent(id)}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json: { rarity?: string; set?: { name?: string } } = await res.json();
    return {
      rarity: mapRarity(json.rarity),
      setName: json.set?.name ?? "",
    };
  } catch {
    return null;
  }
}

/**
 * Given noisy OCR text from a card photo, return ranked card suggestions.
 * Fuzzy-matches every OCR token (and adjacent pairs) against all known
 * card names, so partial or garbled reads still surface the right card.
 */
export async function identifyFromOcrText(
  text: string
): Promise<{ query: string; results: ApiCard[] }> {
  const index = peekCardIndex() ?? (await ensureCardIndex());
  if (index) {
    const { query, cards } = suggestFromOcr(index, text);
    return { query, results: cards.map(indexedToApiCard) };
  }

  // Offline / index unavailable: try a remote search on the longest word.
  const words = text
    .replace(/[^a-zA-Z'\-\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3)
    .sort((a, b) => b.length - a.length);
  for (const word of words.slice(0, 3)) {
    const results = await searchCardsRemote(word);
    if (results.length > 0) return { query: word, results };
  }
  return { query: words[0] ?? "", results: [] };
}
