import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PokemonEvent, EventCategory } from "./types";

export const RADIUS_MILES = 50;
export const GEOFENCE_MILES = 1;
const EVENTS_KEY = "tradechu.events.v2";
const DEFAULT_ORIGIN = { lat: 30.2672, lng: -97.7431 };

interface Template {
  title: string;
  category: EventCategory;
  venue: string;
  address: string;
  dayOffset: number;
  startTime: string;
  endTime: string;
  distanceMiles: number;
  bearingDeg: number;
  attendees: number;
  description: string;
  details: { label: string; value: string }[];
  gradient: string;
}

const TEMPLATES: Template[] = [
  {
    title: "Pokémon TCG League Challenge",
    category: "Tournament",
    venue: "GameHaven Cards & Comics",
    address: "412 Maple Ave",
    dayOffset: 0,
    startTime: "6:00 PM",
    endTime: "9:30 PM",
    distanceMiles: 0.4,
    bearingDeg: 35,
    attendees: 28,
    description:
      "Weekly League Challenge with Swiss rounds. Casual traders welcome — bring your binder!",
    details: [
      { label: "Format", value: "Standard" },
      { label: "Entry", value: "$5" },
    ],
    gradient: "from-red-600 to-yellow-500",
  },
  {
    title: "Collectors Trade Night",
    category: "Trade Meetup",
    venue: "Northside Community Center",
    address: "89 Elmwood Blvd",
    dayOffset: 0,
    startTime: "7:00 PM",
    endTime: "10:00 PM",
    distanceMiles: 7.8,
    bearingDeg: 110,
    attendees: 54,
    description: "Open trading tables for collectors of all levels. Free entry.",
    details: [{ label: "Entry", value: "Free" }],
    gradient: "from-blue-500 to-teal-600",
  },
  {
    title: "Prerelease: Stellar Crown",
    category: "Prerelease",
    venue: "Dragon's Den Games",
    address: "1550 Commerce St",
    dayOffset: 2,
    startTime: "12:00 PM",
    endTime: "4:00 PM",
    distanceMiles: 12.4,
    bearingDeg: 200,
    attendees: 40,
    description: "Play the newest set early. Build & Battle box included.",
    details: [{ label: "Entry", value: "$30" }],
    gradient: "from-purple-500 to-indigo-700",
  },
  {
    title: "Regional Card Show & Expo",
    category: "Card Show",
    venue: "Lakeview Convention Hall",
    address: "2000 Exposition Way",
    dayOffset: 7,
    startTime: "10:00 AM",
    endTime: "6:00 PM",
    distanceMiles: 22.6,
    bearingDeg: 45,
    attendees: 850,
    description: "100+ vendor booths, grading drop-off, and a trading zone.",
    details: [{ label: "Entry", value: "$12" }],
    gradient: "from-yellow-400 to-orange-400",
  },
];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function localDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayStr() {
  return localDateStr(new Date());
}

export function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function offsetLatLng(lat: number, lng: number, miles: number, bearingDeg: number) {
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = (miles / 69.0) * Math.cos(rad);
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const dLng = cosLat === 0 ? 0 : (miles / (69.0 * cosLat)) * Math.sin(rad);
  return { lat: lat + dLat, lng: lng + dLng };
}

function generate(origin = DEFAULT_ORIGIN): PokemonEvent[] {
  const now = new Date();
  return TEMPLATES.map((t, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + t.dayOffset);
    const date = localDateStr(d);
    const pos = offsetLatLng(origin.lat, origin.lng, t.distanceMiles, t.bearingDeg);
    return {
      id: `ev-${date}-${i}`,
      title: t.title,
      category: t.category,
      venue: t.venue,
      address: t.address,
      date,
      startTime: t.startTime,
      endTime: t.endTime,
      distanceMiles: t.distanceMiles,
      lat: pos.lat,
      lng: pos.lng,
      attendees: t.attendees,
      description: t.description,
      details: t.details,
      gradient: t.gradient,
    };
  });
}

export async function getNearbyEvents(origin?: { lat: number; lng: number }): Promise<PokemonEvent[]> {
  const today = todayStr();
  try {
    const raw = await AsyncStorage.getItem(EVENTS_KEY);
    if (raw) {
      const stored = (JSON.parse(raw) as PokemonEvent[]).filter((e) => e.date >= today);
      if (stored.length >= 3) return stored.sort((a, b) => a.date.localeCompare(b.date));
    }
  } catch {
    // ignore
  }
  const fresh = generate(origin ?? DEFAULT_ORIGIN).filter((e) => e.distanceMiles <= RADIUS_MILES);
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(fresh));
  return fresh.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getEventById(id: string): Promise<PokemonEvent | undefined> {
  const all = await getNearbyEvents();
  return all.find((e) => e.id === id);
}

export function formatEventDate(dateStr: string) {
  if (dateStr === todayStr()) return "Today";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export async function regenerateAround(origin: { lat: number; lng: number }) {
  const fresh = generate(origin);
  await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(fresh));
  return fresh;
}
