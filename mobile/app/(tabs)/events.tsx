import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Subtitle, Title } from "../../components/ui";
import { formatEventDate, getNearbyEvents, RADIUS_MILES } from "../../lib/events";
import type { PokemonEvent } from "../../lib/types";
import { useApp } from "../../providers/AppProvider";
import { colors, fonts } from "../../constants/Colors";

export default function EventsTab() {
  const [events, setEvents] = useState<PokemonEvent[]>([]);
  const [query, setQuery] = useState("");
  const { attendance } = useApp();

  useFocusEffect(
    useCallback(() => {
      void getNearbyEvents().then(setEvents);
    }, [])
  );

  const filtered = events.filter((e) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      e.title.toLowerCase().includes(q) ||
      e.venue.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q)
    );
  });

  return (
    <Screen>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          placeholder="Find nearby events…"
          placeholderTextColor={colors.muted2}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.titleRow}>
        <Title>Nearby Gatherings</Title>
        <View style={styles.radiusChip}>
          <Text style={styles.radiusText}>Within {RADIUS_MILES} mi</Text>
        </View>
      </View>
      <Subtitle>RSVP, then check in within 1 mile to unlock trades.</Subtitle>
      <FlatList
        data={filtered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const going = !!attendance[item.id];
          return (
            <Link href={`/events/${item.id}`} asChild>
              <Pressable style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.date}>{formatEventDate(item.date)}</Text>
                  <View style={styles.catChip}>
                    <Text style={styles.catText}>{item.category}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>
                  {item.venue} · {item.distanceMiles.toFixed(1)} mi
                </Text>
                <View style={styles.cardBottom}>
                  {going ? (
                    <Text style={styles.status}>
                      {attendance[item.id] === "confirmed" ? "CHECKED IN" : "RSVP"}
                    </Text>
                  ) : (
                    <View style={styles.rsvpPill}>
                      <Text style={styles.rsvpText}>RSVP</Text>
                    </View>
                  )}
                  <Text style={styles.detailsLink}>Details →</Text>
                </View>
              </Pressable>
            </Link>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.onSurface,
    fontFamily: fonts.bodyBold,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  radiusChip: {
    backgroundColor: "rgba(27,91,184,0.12)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  radiusText: { color: colors.secondary, fontFamily: fonts.label, fontSize: 11 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#1b1c1c",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  date: { color: colors.primary, fontFamily: fonts.label, fontSize: 11 },
  catChip: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  catText: { fontFamily: fonts.label, fontSize: 10, color: colors.muted },
  cardTitle: {
    color: colors.onSurface,
    fontFamily: fonts.headline,
    fontSize: 16,
  },
  cardMeta: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    marginTop: 4,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  status: { color: colors.success, fontFamily: fonts.label, fontSize: 11 },
  rsvpPill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rsvpText: { color: colors.onPrimary, fontFamily: fonts.headline, fontSize: 12 },
  detailsLink: { color: colors.secondary, fontFamily: fonts.label, fontSize: 12 },
});
