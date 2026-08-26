import type { PokemonEvent, EventCategory } from "@/types";

/**
 * Nearby Pokémon events. In this prototype the "database" is on-device:
 * events are generated with real calendar dates and lat/lng relative to the
 * user's GPS (Chick-fil-A-style proximity check-in uses those coords).
 */

const EVENTS_KEY = "tradechu.events.v2";
const AREA_KEY = "tradechu.area.v1";
const ORIGIN_KEY = "tradechu.origin.v1";

export const RADIUS_MILES = 50;
/** Chick-fil-A-style pickup radius for "Are you at the event?" */
export const GEOFENCE_MILES = 1;

/** Fallback origin (Austin, TX) when GPS is unavailable. */
const DEFAULT_ORIGIN = { lat: 30.2672, lng: -97.7431 };

interface EventTemplate {
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

const TEMPLATES: EventTemplate[] = [
  {
    title: "Pokémon TCG League Challenge",
    category: "Tournament",
    venue: "GameHaven Cards & Comics",
    address: "412 Maple Ave",
    dayOffset: 0,
    startTime: "6:00 PM",
    endTime: "9:30 PM",
    // Within geofence so check-in is testable on a real phone near "home".
    distanceMiles: 0.4,
    bearingDeg: 35,
    attendees: 28,
    description:
      "Weekly League Challenge with Swiss rounds in the Standard format. Winners earn Championship Points and exclusive promo cards. Casual traders welcome before and after rounds — bring your binder!",
    details: [
      { label: "Format", value: "Standard, Swiss rounds" },
      { label: "Entry", value: "$5" },
      { label: "Organizer", value: "GameHaven Events" },
      { label: "Prizes", value: "Promos + booster packs" },
    ],
    gradient: "from-red-600 via-orange-500 to-yellow-500",
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
    description:
      "Open trading tables for Pokémon card collectors of all levels. Bring your trade binder and wishlist — dozens of local collectors show up every week. Free entry, snacks provided.",
    details: [
      { label: "Entry", value: "Free" },
      { label: "Tables", value: "20 open trading tables" },
      { label: "Organizer", value: "Northside Collectors Club" },
    ],
    gradient: "from-blue-500 via-cyan-600 to-teal-600",
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
    description:
      "Play with the newest set two weeks before release! Each player receives a Build & Battle box with an exclusive stamped promo. Seats are limited — arrive early.",
    details: [
      { label: "Format", value: "Prerelease sealed" },
      { label: "Entry", value: "$30 (includes Build & Battle box)" },
      { label: "Organizer", value: "Dragon's Den Games" },
      { label: "Seats", value: "40, first come first served" },
    ],
    gradient: "from-purple-500 via-violet-600 to-indigo-700",
  },
  {
    title: "Pokémon GO Community Day Meetup",
    category: "Community Day",
    venue: "Riverside Park Pavilion",
    address: "300 River Rd",
    dayOffset: 4,
    startTime: "2:00 PM",
    endTime: "5:00 PM",
    distanceMiles: 5.1,
    bearingDeg: 280,
    attendees: 120,
    description:
      "Monthly Community Day gathering — walk the park loop with the local raid group, then stick around for card trading at the pavilion tables afterward. Families welcome.",
    details: [
      { label: "Entry", value: "Free" },
      { label: "Organizer", value: "Riverside Raiders" },
      { label: "After-event", value: "Card trading at the pavilion" },
    ],
    gradient: "from-green-500 via-emerald-600 to-teal-700",
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
    description:
      "Over 100 vendor booths of Pokémon cards, graded slabs, vintage sealed product, and memorabilia. On-site grading drop-off, live auctions at 2 PM, and a dedicated trading zone.",
    details: [
      { label: "Entry", value: "$12 at the door, $8 online" },
      { label: "Vendors", value: "100+ booths" },
      { label: "Extras", value: "Live auction, grading drop-off" },
      { label: "Parking", value: "Free garage parking" },
    ],
    gradient: "from-yellow-400 via-amber-400 to-orange-400",
  },
  {
    title: "Friday League Night",
    category: "League Night",
    venue: "Critical Hit Gaming Lounge",
    address: "77 Arcade Row",
    dayOffset: 9,
    startTime: "5:30 PM",
    endTime: "9:00 PM",
    distanceMiles: 9.3,
    bearingDeg: 160,
    attendees: 35,
    description:
      "Casual league play for all ages — learn the game, practice decks, and earn league promo cards. Loaner decks available for newcomers. Trading corner open all night.",
    details: [
      { label: "Entry", value: "Free" },
      { label: "Skill level", value: "All welcome, loaner decks available" },
      { label: "Organizer", value: "Critical Hit Lounge" },
    ],
    gradient: "from-teal-600 via-cyan-500 to-blue-600",
  },
  {
    title: "Vintage Pokémon Collectors Swap",
    category: "Trade Meetup",
    venue: "The Card Vault",
    address: "640 Heritage Lane",
    dayOffset: 12,
    startTime: "1:00 PM",
    endTime: "5:00 PM",
    distanceMiles: 17.9,
    bearingDeg: 320,
    attendees: 45,
    description:
      "WOTC-era focus: Base Set through Neo Destiny. Authentication help on site, binder-to-binder trading, and a showcase table for grails. Modern cards welcome too.",
    details: [
      { label: "Entry", value: "$5" },
      { label: "Focus", value: "Vintage WOTC era (1999–2001)" },
      { label: "Extras", value: "Authentication table" },
    ],
    gradient: "from-slate-700 via-slate-800 to-slate-900",
  },
  {
    title: "League Cup Qualifier",
    category: "Tournament",
    venue: "Eastgate Mall Event Space",
    address: "4801 Eastgate Pkwy",
    dayOffset: 16,
    startTime: "11:00 AM",
    endTime: "7:00 PM",
    distanceMiles: 31.5,
    bearingDeg: 90,
    attendees: 96,
    description:
      "Competitive League Cup with best-of-three Swiss into top cut. Higher Championship Point payouts than League Challenges. Judges on staff; deck lists required.",
    details: [
      { label: "Format", value: "Standard, Bo3 Swiss + top cut" },
      { label: "Entry", value: "$15" },
      { label: "Cap", value: "96 players" },
      { label: "Requirement", value: "Written deck list" },
    ],
    gradient: "from-orange-600 via-red-600 to-yellow-500",
  },
  {
    title: "Family Pokémon Day",
    category: "Community Day",
    venue: "Westbrook Public Library",
    address: "150 Library Plaza",
    dayOffset: 20,
    startTime: "10:00 AM",
    endTime: "1:00 PM",
    distanceMiles: 14.2,
    bearingDeg: 250,
    attendees: 75,
    description:
      "Kid-friendly learn-to-play sessions, coloring corner, starter deck giveaways, and a supervised beginner trading table. Great first event for young collectors.",
    details: [
      { label: "Entry", value: "Free" },
      { label: "Ages", value: "Family friendly, 6+" },
      { label: "Giveaway", value: "Starter decks while supplies last" },
    ],
    gradient: "from-amber-400 via-orange-300 to-yellow-400",
  },
  {
    title: "Midnight Booster Draft",
    category: "Tournament",
    venue: "GameHaven Cards & Comics",
    address: "412 Maple Ave",
    dayOffset: 23,
    startTime: "10:00 PM",
    endTime: "1:00 AM",
    distanceMiles: 3.2,
    bearingDeg: 15,
    attendees: 24,
    description:
      "Late-night 8-pod booster draft — draft packs, build a 40-card deck, and play three rounds. All drafted cards are yours to keep. Pizza at midnight.",
    details: [
      { label: "Format", value: "Booster draft, 8-player pods" },
      { label: "Entry", value: "$25 (6 packs included)" },
      { label: "Organizer", value: "GameHaven Events" },
    ],
    gradient: "from-indigo-900 via-purple-800 to-slate-900",
  },
  {
    title: "Charity Tournament & Trade Fair",
    category: "Card Show",
    venue: "Summit High School Gymnasium",
    address: "900 Summit Dr",
    dayOffset: 27,
    startTime: "9:00 AM",
    endTime: "4:00 PM",
    distanceMiles: 41.7,
    bearingDeg: 135,
    attendees: 210,
    description:
      "Annual charity event: entry fees go to the children's hospital. Side events all day, raffle with sealed vintage prizes, and 30 trade-fair tables.",
    details: [
      { label: "Entry", value: "$10 donation" },
      { label: "Cause", value: "Children's hospital fundraiser" },
      { label: "Raffle", value: "Vintage sealed product" },
    ],
    gradient: "from-red-600 via-orange-500 to-yellow-500",
  },
  {
    title: "Prerelease Weekend: Stellar Crown",
    category: "Prerelease",
    venue: "Tabletop Kingdom",
    address: "310 Kingsway Ct",
    dayOffset: 30,
    startTime: "11:00 AM",
    endTime: "3:00 PM",
    distanceMiles: 26.8,
    bearingDeg: 300,
    attendees: 32,
    description:
      "Second-chance prerelease for the new set. Build & Battle box included with entry, plus a bonus pack for anyone who brings a filled trade binder.",
    details: [
      { label: "Format", value: "Prerelease sealed" },
      { label: "Entry", value: "$30 (includes Build & Battle box)" },
      { label: "Bonus", value: "Extra pack for binder traders" },
    ],
    gradient: "from-purple-500 via-violet-600 to-indigo-700",
  },
];

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayStr(): string {
  return localDateStr(new Date());
}

/** Great-circle distance in miles. */
export function milesBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Offset a point by `miles` along a compass bearing (degrees clockwise from north). */
export function offsetLatLng(
  lat: number,
  lng: number,
  miles: number,
  bearingDeg: number
): { lat: number; lng: number } {
  const rad = (bearingDeg * Math.PI) / 180;
  const dLat = (miles / 69.0) * Math.cos(rad);
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const dLng = cosLat === 0 ? 0 : (miles / (69.0 * cosLat)) * Math.sin(rad);
  return { lat: lat + dLat, lng: lng + dLng };
}

function hasCoords(e: PokemonEvent): boolean {
  return typeof e.lat === "number" && typeof e.lng === "number";
}

function generateEvents(origin: { lat: number; lng: number }): PokemonEvent[] {
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

function persistEvents(events: PokemonEvent[]) {
  try {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  } catch {
    // Persistence failure is non-fatal.
  }
}

function getCachedOrigin(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(ORIGIN_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as { lat: number; lng: number };
    if (typeof o.lat === "number" && typeof o.lng === "number") return o;
  } catch {
    // ignore
  }
  return null;
}

function setCachedOrigin(origin: { lat: number; lng: number }) {
  try {
    localStorage.setItem(ORIGIN_KEY, JSON.stringify(origin));
  } catch {
    // ignore
  }
}

/** Read persisted events without generating new ones. */
export function loadStoredEvents(): PokemonEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(EVENTS_KEY);
    const list = raw ? (JSON.parse(raw) as PokemonEvent[]) : [];
    return list.filter(hasCoords);
  } catch {
    return [];
  }
}

function sortEvents(events: PokemonEvent[]): PokemonEvent[] {
  return [...events]
    .filter((e) => e.distanceMiles <= RADIUS_MILES)
    .sort((a, b) => a.date.localeCompare(b.date) || a.distanceMiles - b.distanceMiles);
}

/**
 * Sync nearby events using a cached/default origin. Prefer `ensureNearbyEvents`
 * when GPS may still need to be resolved.
 */
export function getNearbyEvents(): PokemonEvent[] {
  const today = todayStr();
  const stored = loadStoredEvents().filter((e) => e.date >= today);
  if (stored.length >= 6) return sortEvents(stored);

  const origin = getCachedOrigin() ?? DEFAULT_ORIGIN;
  const fresh = generateEvents(origin);
  persistEvents(fresh);
  return sortEvents(fresh);
}

async function resolveOrigin(): Promise<{ lat: number; lng: number }> {
  const cached = getCachedOrigin();
  if (cached) return cached;

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 8000,
        maximumAge: 600000,
      });
    });
    const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    setCachedOrigin(origin);
    return origin;
  } catch {
    setCachedOrigin(DEFAULT_ORIGIN);
    return DEFAULT_ORIGIN;
  }
}

/**
 * Ensure events exist with coords relative to the device location.
 * Regenerates if the cache is empty or missing lat/lng.
 */
export async function ensureNearbyEvents(): Promise<PokemonEvent[]> {
  const today = todayStr();
  const stored = loadStoredEvents().filter((e) => e.date >= today);
  if (stored.length >= 6) return sortEvents(stored);

  const origin = await resolveOrigin();
  const fresh = generateEvents(origin);
  persistEvents(fresh);
  return sortEvents(fresh);
}

/**
 * Force-regenerate events around a given origin (used by "Simulate nearby"
 * so the nearest Today event lands inside the 1-mile geofence).
 */
export function regenerateEventsAround(origin: { lat: number; lng: number }): PokemonEvent[] {
  setCachedOrigin(origin);
  const fresh = generateEvents(origin);
  persistEvents(fresh);
  return sortEvents(fresh);
}

export function getEventById(id: string): PokemonEvent | undefined {
  return loadStoredEvents().find((e) => e.id === id);
}

/** "Today", "Tomorrow", or e.g. "Sat, Aug 15". */
export function formatEventDate(dateStr: string): string {
  const today = todayStr();
  if (dateStr === today) return "Today";
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === localDateStr(tomorrow)) return "Tomorrow";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Resolve a friendly area label ("near Austin, TX") from the device's real
 * location via reverse geocoding. Cached; falls back to "near you".
 */
export async function getAreaLabel(): Promise<string> {
  if (typeof window === "undefined") return "near you";
  try {
    const cached = localStorage.getItem(AREA_KEY);
    if (cached) return cached;
  } catch {
    // ignore
  }

  try {
    const origin = await resolveOrigin();
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${origin.lat}&lon=${origin.lng}&format=json&zoom=10`,
      { signal: AbortSignal.timeout(6000), headers: { Accept: "application/json" } }
    );
    if (!res.ok) return "near you";
    const json: {
      address?: { city?: string; town?: string; village?: string; state?: string };
    } = await res.json();
    const place = json.address?.city || json.address?.town || json.address?.village;
    const label = place
      ? `near ${place}${json.address?.state ? `, ${json.address.state}` : ""}`
      : "near you";
    try {
      localStorage.setItem(AREA_KEY, label);
    } catch {
      // ignore
    }
    return label;
  } catch {
    return "near you";
  }
}
