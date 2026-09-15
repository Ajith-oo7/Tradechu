import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen, Subtitle, Title } from "../../components/ui";
import { colors, fonts } from "../../constants/Colors";

const DEMO = [
  {
    id: "1",
    user: "MistyWater",
    preview: "I can trade my Blastoise for your Charizard?",
    trade: "Trade Offer",
    unread: 1,
    time: "12:45 PM",
  },
  {
    id: "2",
    user: "AshK_99",
    preview: "Thanks for the smooth trade yesterday!",
    trade: "Completed",
    unread: 0,
    time: "Yesterday",
  },
  {
    id: "3",
    user: "BugCatcher_Tim",
    preview: "Do you have any Caterpie still?",
    trade: "Chat",
    unread: 0,
    time: "Mon",
  },
];

export default function MessagesScreen() {
  const [query, setQuery] = useState("");
  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEMO;
    return DEMO.filter((m) => m.user.toLowerCase().includes(q) || m.preview.toLowerCase().includes(q));
  }, [query]);
  const unread = DEMO.reduce((n, m) => n + m.unread, 0);

  return (
    <Screen>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          placeholder="Search trainers or messages…"
          placeholderTextColor={colors.muted2}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.titleRow}>
        <Title>Messages</Title>
        <Text style={styles.unread}>{unread} Unread</Text>
      </View>
      <Subtitle>Trade chats (demo — local only).</Subtitle>
      <FlatList
        data={data}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarLetter}>{item.user[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.user}>@{item.user}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{item.trade}</Text>
              </View>
              <Text style={styles.preview} numberOfLines={1}>
                {item.preview}
              </Text>
            </View>
            {item.unread > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            ) : null}
          </Pressable>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push("/(tabs)/events")}>
        <Ionicons name="create-outline" size={24} color={colors.onPrimary} />
      </Pressable>
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  unread: { color: colors.primary, fontFamily: fonts.label, fontSize: 12 },
  card: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { color: colors.onSecondary, fontFamily: fonts.headline },
  row: { flexDirection: "row", justifyContent: "space-between" },
  user: { color: colors.onSurface, fontFamily: fonts.headline, fontSize: 15 },
  time: { color: colors.muted2, fontSize: 11, fontFamily: fonts.body },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: colors.tertiaryBright,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  tagText: { fontFamily: fonts.label, fontSize: 10, color: colors.onTertiary },
  preview: { color: colors.muted, marginTop: 4, fontFamily: fonts.body, fontSize: 13 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: { color: colors.onPrimary, fontSize: 11, fontFamily: fonts.label },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
