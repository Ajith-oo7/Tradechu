import { getSupabase, isSupabaseConfigured } from "./client";
import type { AttendanceStatus, CardListType, PokemonCard } from "@/types";

/** Ensure anonymous session + profile row. Returns user id or null if offline/local mode. */
export async function ensureAnonSession(username: string): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  const { data: sessionData } = await sb.auth.getSession();
  let userId = sessionData.session?.user.id;

  if (!userId) {
    const { data, error } = await sb.auth.signInAnonymously();
    if (error || !data.user) {
      console.warn("[supabase] anonymous sign-in failed:", error?.message);
      return null;
    }
    userId = data.user.id;
  }

  await sb.from("profiles").upsert({
    id: userId,
    username,
    avatar: username[0]?.toUpperCase() ?? "T",
  });

  return userId;
}

export async function syncCardToBackend(
  userId: string,
  card: PokemonCard,
  list: CardListType
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("cards").upsert({
    id: card.id,
    owner_id: userId,
    list,
    name: card.name,
    rarity: card.rarity,
    image_gradient: card.imageGradient,
    photo_url: card.photoUrl ?? null,
    api_image_url: card.apiImageUrl ?? null,
    set_name: card.setName ?? null,
    card_number: card.cardNumber ?? null,
    condition: card.condition ?? null,
    note: card.note ?? null,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteCardFromBackend(cardId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("cards").delete().eq("id", cardId);
}

export async function upsertRsvp(
  userId: string,
  eventId: string,
  status: AttendanceStatus
): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("event_rsvps").upsert({
    user_id: userId,
    event_id: eventId,
    status,
    updated_at: new Date().toISOString(),
  });
}

export async function deleteRsvp(userId: string, eventId: string): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;
  await sb.from("event_rsvps").delete().eq("user_id", userId).eq("event_id", eventId);
}

export async function fetchConfirmedAttendeeCards(
  eventId: string,
  excludeUserId: string
): Promise<{ userId: string; username: string; avatar: string; avatarGradient: string; wishlist: PokemonCard[]; tradeBinder: PokemonCard[] }[]> {
  const sb = getSupabase();
  if (!sb || !isSupabaseConfigured()) return [];

  const { data: rsvps } = await sb
    .from("event_rsvps")
    .select("user_id")
    .eq("event_id", eventId)
    .eq("status", "confirmed")
    .neq("user_id", excludeUserId);

  if (!rsvps?.length) return [];

  const ids = rsvps.map((r) => r.user_id as string);
  const { data: profiles } = await sb.from("profiles").select("*").in("id", ids);
  const { data: cards } = await sb.from("cards").select("*").in("owner_id", ids);

  return (profiles ?? []).map((p) => {
    const owned = (cards ?? []).filter((c) => c.owner_id === p.id);
    const toCard = (c: Record<string, unknown>): PokemonCard => ({
      id: String(c.id),
      name: String(c.name),
      rarity: (c.rarity as PokemonCard["rarity"]) ?? "Rare",
      imageGradient: String(c.image_gradient ?? "from-slate-700 to-slate-900"),
      photoUrl: (c.photo_url as string) || undefined,
      apiImageUrl: (c.api_image_url as string) || undefined,
      setName: (c.set_name as string) || undefined,
      cardNumber: (c.card_number as string) || undefined,
      condition: (c.condition as PokemonCard["condition"]) || undefined,
      note: (c.note as string) || undefined,
    });
    return {
      userId: p.id as string,
      username: p.username as string,
      avatar: (p.avatar as string) ?? "T",
      avatarGradient: (p.avatar_gradient as string) ?? "from-blue-500 to-cyan-500",
      wishlist: owned.filter((c) => c.list === "wishlist").map(toCard),
      tradeBinder: owned.filter((c) => c.list === "binder").map(toCard),
    };
  });
}

export async function savePushSubscription(
  userId: string,
  sub: PushSubscriptionJSON
): Promise<void> {
  const sb = getSupabase();
  if (!sb || !sub.endpoint || !sub.keys) return;
  await sb.from("push_subscriptions").upsert({
    user_id: userId,
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  });
}
