import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Screen, Subtitle } from "../../../components/ui";
import { useApp } from "../../../providers/AppProvider";
import { useAuth } from "../../../providers/AuthProvider";
import { computeTradeOpportunities, DEMO_OTHERS } from "../../../lib/cards";
import { getEventById } from "../../../lib/events";
import { colors, fonts } from "../../../constants/Colors";
import type { PokemonEvent } from "../../../lib/types";

export default function EventTradesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const { wishlist, tradeBinder, attendance } = useApp();
  const [event, setEvent] = useState<PokemonEvent | null>(null);

  useEffect(() => {
    void getEventById(id!).then((e) => setEvent(e ?? null));
  }, [id]);

  useEffect(() => {
    if (event && attendance[event.id] !== "confirmed") {
      router.replace(`/events/${id}`);
    }
  }, [event, attendance, id]);

  const opportunities = useMemo(() => {
    const me = {
      id: profile?.id ?? "me",
      username: profile?.username ?? "me",
      avatar: profile?.firstName?.[0] ?? "T",
      avatarGradient: "from-yellow-400 to-orange-500",
      wishlist,
      tradeBinder,
    };
    return computeTradeOpportunities(me, DEMO_OTHERS);
  }, [profile, wishlist, tradeBinder]);

  return (
    <Screen>
      <Stack.Screen options={{ title: "Mutual Matches" }} />
      <Text style={styles.ok}>YOU&apos;RE CHECKED IN</Text>
      <Text style={styles.title}>{event?.title ?? "Event"}</Text>
      <Subtitle>
        Mutual matches from wishlist ↔ binder. Demo traders shown until live attendees sync.
      </Subtitle>

      <FlatList
        data={opportunities}
        keyExtractor={(o) => o.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No matches yet — add cards or wait for other collectors.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarLetter}>{item.username[0]}</Text>
              </View>
              <Text style={styles.user}>@{item.username}</Text>
            </View>
            <View style={styles.swap}>
              <View style={styles.side}>
                <Text style={styles.sideLabel}>They have</Text>
                <Text style={styles.sideName}>{item.theyHave.name}</Text>
              </View>
              <Text style={styles.arrows}>⇄</Text>
              <View style={styles.side}>
                <Text style={styles.sideLabel}>You have</Text>
                <Text style={styles.sideName}>{item.youHave.name}</Text>
              </View>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/messages")} style={styles.msgBtn}>
              <Text style={styles.msgText}>Message {item.username}</Text>
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  ok: { color: colors.success, fontFamily: fonts.label, fontSize: 12 },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.headlineExtra,
    fontSize: 18,
    marginTop: 4,
  },
  empty: {
    color: colors.muted,
    textAlign: "center",
    marginTop: 24,
    fontFamily: fonts.body,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: colors.onSecondary, fontFamily: fonts.headline },
  user: { color: colors.onSurface, fontFamily: fonts.headline, fontSize: 15 },
  swap: { flexDirection: "row", alignItems: "center", gap: 8 },
  side: { flex: 1 },
  sideLabel: { color: colors.muted, fontSize: 11, fontFamily: fonts.label },
  sideName: { color: colors.onSurface, fontFamily: fonts.bodyBold, marginTop: 2 },
  arrows: { color: colors.primary, fontSize: 20, fontFamily: fonts.headline },
  msgBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  msgText: { color: colors.onPrimary, fontFamily: fonts.headline, fontSize: 14 },
});
