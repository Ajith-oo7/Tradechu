import type { PokemonCard } from "./types";

export interface ApiCard {
  id: string;
  name: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  imageSmall: string;
  imageLarge: string;
}

const GRAPHQL_URL = "https://api.tcgdex.net/v2/graphql";

export async function searchCards(query: string): Promise<ApiCard[]> {
  const q = query.trim().replace(/["\\]/g, "");
  if (q.length < 2) return [];
  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query {
          cards(filters: { name: "${q}" }, pagination: { page: 1, itemsPerPage: 40 }) {
            id localId name rarity image
            set { name }
          }
        }`,
      }),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const cards = (json.data?.cards ?? []).filter((c: { image?: string }) => c.image);
    return cards.slice(0, 24).map((c: {
      id: string;
      localId?: string;
      name: string;
      rarity?: string;
      image: string;
      set?: { name?: string };
    }) => ({
      id: c.id,
      name: c.name,
      setName: c.set?.name ?? "",
      cardNumber: c.localId ?? "",
      rarity: c.rarity ?? "Rare",
      imageSmall: `${c.image}/low.webp`,
      imageLarge: `${c.image}/high.webp`,
    }));
  } catch {
    return [];
  }
}

export function apiCardToPokemon(api: ApiCard, photoUrl?: string): PokemonCard {
  return {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: api.name,
    rarity: (api.rarity as PokemonCard["rarity"]) || "Rare",
    imageGradient: "from-slate-700 to-slate-900",
    photoUrl,
    apiImageUrl: api.imageLarge || api.imageSmall,
    setName: api.setName,
    cardNumber: api.cardNumber,
    condition: "NM",
  };
}
