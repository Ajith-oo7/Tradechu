import type { PokemonCard, Rarity } from "@/types";
import type { ApiCard } from "@/lib/pokemonTcg";

const GRADIENTS = [
  "from-yellow-400 via-amber-400 to-orange-400",
  "from-orange-600 via-red-600 to-yellow-500",
  "from-indigo-900 via-purple-800 to-slate-900",
  "from-green-500 via-emerald-600 to-teal-700",
  "from-blue-500 via-cyan-600 to-teal-600",
  "from-purple-500 via-violet-600 to-indigo-700",
  "from-red-600 via-orange-500 to-yellow-500",
  "from-teal-600 via-cyan-500 to-blue-600",
  "from-slate-700 via-slate-800 to-slate-900",
  "from-amber-400 via-orange-300 to-yellow-400",
];

export function gradientForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function rarityForName(name: string): Rarity {
  if (name.includes("VMAX") || name.includes("VSTAR")) return "Secret Rare";
  if (name.includes("GX") || name.includes(" EX")) return "Ultra Rare";
  if (name.includes("V")) return "Holo";
  if (name.includes("Ancient") || name.includes("Promo")) return "Promo";
  return "Rare";
}

function newCardId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createCard(name: string, photoUrl?: string): PokemonCard {
  return {
    id: newCardId(),
    name,
    rarity: rarityForName(name),
    imageGradient: gradientForName(name),
    photoUrl,
    condition: "NM",
  };
}

/** Build a PokemonCard from a real card identified via the Pokémon TCG API. */
export function createCardFromApi(apiCard: ApiCard, photoUrl?: string): PokemonCard {
  return {
    id: newCardId(),
    name: apiCard.name,
    rarity: apiCard.rarity,
    imageGradient: gradientForName(apiCard.name),
    photoUrl,
    apiImageUrl: apiCard.imageLarge || apiCard.imageSmall || undefined,
    setName: apiCard.setName,
    cardNumber: apiCard.cardNumber,
    condition: "NM",
  };
}
