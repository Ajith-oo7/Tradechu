import type { PokemonCard, Rarity, User, TradeOpportunity } from "./types";

const GRADIENTS = [
  "from-yellow-400 via-amber-400 to-orange-400",
  "from-orange-600 via-red-600 to-yellow-500",
  "from-indigo-900 via-purple-800 to-slate-900",
  "from-green-500 via-emerald-600 to-teal-700",
  "from-blue-500 via-cyan-600 to-teal-600",
];

export function gradientForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function rarityForName(name: string): Rarity {
  if (name.includes("VMAX") || name.includes("VSTAR")) return "Secret Rare";
  if (name.includes("GX") || name.includes(" EX")) return "Ultra Rare";
  if (name.includes("V")) return "Holo";
  return "Rare";
}

export function createCard(name: string, photoUrl?: string): PokemonCard {
  return {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    rarity: rarityForName(name),
    imageGradient: gradientForName(name),
    photoUrl,
    condition: "NM",
  };
}

export function computeTradeOpportunities(user: User, others: User[]): TradeOpportunity[] {
  const opportunities: TradeOpportunity[] = [];
  for (const other of others) {
    for (const wanted of user.wishlist) {
      const theyHave = other.tradeBinder.find(
        (c) => c.name.toLowerCase() === wanted.name.toLowerCase()
      );
      if (!theyHave) continue;
      for (const theyWant of other.wishlist) {
        const youHave = user.tradeBinder.find(
          (c) => c.name.toLowerCase() === theyWant.name.toLowerCase()
        );
        if (!youHave) continue;
        opportunities.push({
          id: `opp-${other.id}-${wanted.id}-${theyWant.id}`,
          userId: other.id,
          username: other.username,
          avatar: other.avatar,
          avatarGradient: other.avatarGradient,
          theyHave,
          youHave,
          mutual: true,
        });
      }
    }
  }
  return opportunities;
}

export const DEMO_OTHERS: User[] = [
  {
    id: "u1",
    username: "TrainerY",
    avatar: "Y",
    avatarGradient: "from-blue-500 to-cyan-500",
    tradeBinder: [createCard("Meowth"), createCard("Pikachu ex")],
    wishlist: [createCard("Eevee")],
  },
  {
    id: "u2",
    username: "RareCollector",
    avatar: "R",
    avatarGradient: "from-pink-500 to-rose-500",
    tradeBinder: [createCard("Charizard ex")],
    wishlist: [createCard("Pikachu ex")],
  },
];
