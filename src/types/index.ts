export type Rarity = "Common" | "Uncommon" | "Rare" | "Holo" | "Ultra Rare" | "Secret Rare" | "Promo" | "Vintage";

export type CardCondition = "NM" | "LP" | "MP" | "HP" | "DMG" | "Sealed";

export interface PokemonCard {
  id: string;
  name: string;
  rarity: Rarity;
  imageGradient: string;
  /** User's own photo of the card (from the camera flow) */
  photoUrl?: string;
  /** Official card artwork from the Pokémon TCG API */
  apiImageUrl?: string;
  setName?: string;
  cardNumber?: string;
  /** Near Mint / Lightly Played / … / Sealed */
  condition?: CardCondition;
  /** Short owner note (~120 chars) */
  note?: string;
}

export type HomeTab = "wishlist" | "binder" | "opportunities";

export type CardListType = "wishlist" | "binder";

export interface User {
  id: string;
  username: string;
  avatar: string;
  avatarGradient: string;
  wishlist: PokemonCard[];
  tradeBinder: PokemonCard[];
}

export interface TradeOpportunity {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  avatarGradient: string;
  theyHave: PokemonCard;
  youHave: PokemonCard;
  mutual: boolean;
}

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
  type: "match" | "wishlist" | "binder" | "trade" | "event";
}

export type EventCategory =
  | "Tournament"
  | "Prerelease"
  | "Trade Meetup"
  | "Card Show"
  | "Community Day"
  | "League Night";

export interface PokemonEvent {
  id: string;
  title: string;
  category: EventCategory;
  venue: string;
  address: string;
  /** Local date in YYYY-MM-DD */
  date: string;
  startTime: string;
  endTime: string;
  distanceMiles: number;
  /** Venue coordinates for proximity check-in */
  lat: number;
  lng: number;
  attendees: number;
  description: string;
  details: { label: string; value: string }[];
  gradient: string;
}

/** "going" = RSVP'd; "confirmed" = checked in at the venue */
export type AttendanceStatus = "going" | "confirmed";

export interface Conversation {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  avatarGradient: string;
  tradeGive: string;
  tradeReceive: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  startedAt: string;
  archived?: boolean;
  muted?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "me" | "them";
  text: string;
  timestamp: string;
}

export interface UserStats {
  cardsTraded: number;
  successfulTrades: number;
  wishlistCount: number;
  binderCount: number;
  eventsAttended: number;
  memberSince: string;
}

export interface CurrentUser extends User {
  stats: UserStats;
}
