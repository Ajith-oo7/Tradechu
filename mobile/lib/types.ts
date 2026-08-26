export type CardCondition = "NM" | "LP" | "MP" | "HP" | "DMG" | "Sealed";

export type Rarity =
  | "Common"
  | "Uncommon"
  | "Rare"
  | "Holo"
  | "Ultra Rare"
  | "Secret Rare"
  | "Promo"
  | "Vintage";

export interface PokemonCard {
  id: string;
  name: string;
  rarity: Rarity;
  imageGradient: string;
  photoUrl?: string;
  apiImageUrl?: string;
  setName?: string;
  cardNumber?: string;
  condition?: CardCondition;
  note?: string;
}

export type CardListType = "wishlist" | "binder";
export type AttendanceStatus = "going" | "confirmed";

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
  date: string;
  startTime: string;
  endTime: string;
  distanceMiles: number;
  lat: number;
  lng: number;
  attendees: number;
  description: string;
  details: { label: string; value: string }[];
  gradient: string;
}

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

export interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  username: string;
}
