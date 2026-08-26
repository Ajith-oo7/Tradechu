import type {
  ActivityItem,
  ChatMessage,
  Conversation,
  CurrentUser,
  PokemonCard,
  TradeOpportunity,
  User,
} from "@/types";

export const DETECTABLE_CARD_NAMES = [
  "Pikachu EX",
  "Charizard EX",
  "Terastal Charizard EX",
  "Rayquaza VMAX",
  "Lucario VSTAR",
  "Mega Zygarde EX",
  "Ancient Mew",
  "Umbreon VMAX",
  "Mewtwo GX",
  "Gengar EX",
  "Lugia V",
  "Blastoise EX",
  "Gyarados Holo",
  "Eevee Promo",
];

export const cards: Record<string, PokemonCard> = {
  meowth: {
    id: "c4",
    name: "Meowth",
    rarity: "Common",
    imageGradient: "from-amber-300 via-yellow-400 to-orange-300",
  },
  charizardEx: {
    id: "c5",
    name: "Charizard EX",
    rarity: "Ultra Rare",
    imageGradient: "from-orange-600 via-red-600 to-yellow-500",
  },
  ancientMew: {
    id: "c6",
    name: "Ancient Mew",
    rarity: "Promo",
    imageGradient: "from-teal-600 via-cyan-500 to-blue-600",
  },
  pikachuEx: {
    id: "c1",
    name: "Pikachu EX",
    rarity: "Ultra Rare",
    imageGradient: "from-yellow-400 via-amber-400 to-orange-400",
  },
  raichu: {
    id: "c2",
    name: "Raichu",
    rarity: "Rare",
    imageGradient: "from-orange-400 via-amber-500 to-yellow-500",
  },
  eevee: {
    id: "c3",
    name: "Eevee",
    rarity: "Uncommon",
    imageGradient: "from-amber-400 via-orange-300 to-yellow-400",
  },
  rayquazaVmax: {
    id: "c9",
    name: "Rayquaza VMAX",
    rarity: "Secret Rare",
    imageGradient: "from-green-500 via-emerald-600 to-teal-700",
  },
  umbreonVmax: {
    id: "c10",
    name: "Umbreon VMAX",
    rarity: "Secret Rare",
    imageGradient: "from-indigo-900 via-purple-800 to-slate-900",
  },
  mewtwoGx: {
    id: "c8",
    name: "Mewtwo GX",
    rarity: "Ultra Rare",
    imageGradient: "from-purple-500 via-violet-600 to-indigo-700",
  },
  blastoise: {
    id: "c7",
    name: "Blastoise EX",
    rarity: "Holo",
    imageGradient: "from-blue-500 via-cyan-600 to-teal-600",
  },
};

export const currentUser: CurrentUser = {
  id: "u0",
  username: "TradeMaster",
  avatar: "T",
  avatarGradient: "from-pikachu to-amber-400",
  wishlist: [cards.meowth, cards.charizardEx, cards.ancientMew],
  tradeBinder: [cards.pikachuEx, cards.raichu, cards.eevee],
  stats: {
    cardsTraded: 47,
    successfulTrades: 23,
    wishlistCount: 3,
    binderCount: 3,
    eventsAttended: 5,
    memberSince: "March 2025",
  },
};

export const otherUsers: User[] = [
  {
    id: "u1",
    username: "TrainerY",
    avatar: "Y",
    avatarGradient: "from-blue-500 to-cyan-500",
    tradeBinder: [cards.meowth, cards.pikachuEx, cards.raichu],
    wishlist: [cards.eevee],
  },
  {
    id: "u2",
    username: "RareCollector",
    avatar: "R",
    avatarGradient: "from-pink-500 to-rose-500",
    tradeBinder: [cards.charizardEx, cards.blastoise],
    wishlist: [cards.pikachuEx],
  },
  {
    id: "u3",
    username: "CardMaster",
    avatar: "C",
    avatarGradient: "from-violet-500 to-purple-600",
    tradeBinder: [cards.ancientMew, cards.mewtwoGx],
    wishlist: [cards.raichu, cards.rayquazaVmax],
  },
  {
    id: "u4",
    username: "ShinyHunter",
    avatar: "S",
    avatarGradient: "from-emerald-500 to-teal-500",
    tradeBinder: [cards.rayquazaVmax, cards.umbreonVmax],
    wishlist: [cards.ancientMew],
  },
];

export function computeTradeOpportunities(user: User, others: User[]): TradeOpportunity[] {
  const opportunities: TradeOpportunity[] = [];

  for (const other of others) {
    for (const wanted of user.wishlist) {
      const theyHave = other.tradeBinder.find((c) => c.id === wanted.id);
      if (!theyHave) continue;

      for (const theyWant of other.wishlist) {
        const youHave = user.tradeBinder.find((c) => c.id === theyWant.id);
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

export const recentActivity: ActivityItem[] = [
  { id: "a1", text: "Added Charizard EX to Wishlist", timestamp: "Today", type: "wishlist" },
  { id: "a2", text: "Matched with @TrainerY", timestamp: "Yesterday", type: "match" },
  { id: "a3", text: "Added Eevee to Trade Binder", timestamp: "Yesterday", type: "binder" },
];

export const conversations: Conversation[] = [
  {
    id: "conv1",
    userId: "u1",
    username: "TrainerY",
    avatar: "Y",
    avatarGradient: "from-blue-500 to-cyan-500",
    tradeGive: "Eevee",
    tradeReceive: "Meowth",
    lastMessage: "Yes, I'm interested in Eevee.",
    timestamp: "2:34 PM",
    unread: 1,
    startedAt: "2026-06-28T10:00:00Z",
  },
  {
    id: "conv2",
    userId: "u2",
    username: "RareCollector",
    avatar: "R",
    avatarGradient: "from-pink-500 to-rose-500",
    tradeGive: "Pikachu EX",
    tradeReceive: "Charizard EX",
    lastMessage: "Would you trade your Pikachu EX?",
    timestamp: "1:15 PM",
    unread: 0,
    startedAt: "2026-06-29T14:00:00Z",
  },
  {
    id: "conv3",
    userId: "u3",
    username: "CardMaster",
    avatar: "C",
    avatarGradient: "from-violet-500 to-purple-600",
    tradeGive: "Raichu",
    tradeReceive: "Ancient Mew",
    lastMessage: "Hey! Saw you have Ancient Mew on your wishlist.",
    timestamp: "11:42 AM",
    unread: 0,
    startedAt: "2026-06-30T09:00:00Z",
  },
];

export const chatMessages: Record<string, ChatMessage[]> = {
  conv1: [
    { id: "m1", sender: "me", text: "Hi, I noticed you have Meowth.", timestamp: "2:10 PM" },
    { id: "m2", sender: "them", text: "Yes, I'm interested in Eevee.", timestamp: "2:15 PM" },
    { id: "m3", sender: "me", text: "Would you like to trade?", timestamp: "2:20 PM" },
    { id: "m4", sender: "them", text: "Absolutely! Meowth for Eevee works for me.", timestamp: "2:34 PM" },
  ],
  conv2: [
    { id: "m1", sender: "them", text: "Hey! I have Charizard EX available.", timestamp: "12:30 PM" },
    { id: "m2", sender: "me", text: "Nice! I've been looking for one.", timestamp: "12:45 PM" },
    { id: "m3", sender: "them", text: "Would you trade your Pikachu EX?", timestamp: "1:15 PM" },
  ],
  conv3: [
    { id: "m1", sender: "them", text: "Hey! Saw you have Ancient Mew on your wishlist.", timestamp: "11:42 AM" },
  ],
};

export function getConversationById(id: string): Conversation | undefined {
  return conversations.find((c) => c.id === id);
}

export function suggestCardName(): string {
  const idx = Math.floor(Date.now() / 1000) % DETECTABLE_CARD_NAMES.length;
  return DETECTABLE_CARD_NAMES[idx];
}
