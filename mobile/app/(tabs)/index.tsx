import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Subtitle, Title } from "../../components/ui";
import { useAuth } from "../../providers/AuthProvider";
import { useApp } from "../../providers/AppProvider";
import { colors } from "../../constants/Colors";
import { todayStr } from "../../lib/events";
import { LevitatingPokeball, ParticleField } from "../../components/pokeball";

const links = [
  { href: "/binder/wishlist", title: "Wishlist", subtitle: "Cards you’re hunting", icon: "heart" as const },
  { href: "/binder/binder", title: "Trade Binder", subtitle: "Cards you’ll trade away", icon: "book" as const },
  { href: "/(tabs)/messages", title: "Messages", subtitle: "Negotiate trades", icon: "chatbubbles" as const },
  { href: "/(tabs)/events", title: "Events", subtitle: "Nearby shows & meetups", icon: "calendar" as const },
  { href: "/(tabs)/settings", title: "Settings", subtitle: "Profile & preferences", icon: "settings" as const },
];

export default function HomeScreen() {
  const { profile } = useAuth();
  const { wishlist, tradeBinder, attendance } = useApp();
  const today = todayStr();
  const checkedInId = Object.entries(attendance).find(
    ([id, s]) => s === "confirmed" && id.includes(today)
  )?.[0];

  return (
    <View style={styles.root}>
      {/* Atmosphere */}
      <View style={styles.ballLayer} pointerEvents="none">
        <LevitatingPokeball size={300} dimmed float />
      </View>
      <ParticleField density={28} intensity="low" />
      <LinearGradient
        colors={["rgba(15,23,42,0.55)", "rgba(15,23,42,0.25)", "rgba(15,23,42,0.85)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.handle}>@{profile?.username}</Text>
        <Title>Find Your Next Trade</Title>
        <Subtitle>
          Build lists, RSVP to events, check in nearby, then match.{"\n"}
          <Text style={{ color: colors.white, fontWeight: "700" }}>RSVP</Text> ={" "}
          <Text style={{ fontStyle: "italic" }}>Répondez s’il vous plaît</Text> (“Please respond”).
        </Subtitle>
        <Text style={styles.counts}>
          {wishlist.length} wishlist · {tradeBinder.length} binder
        </Text>

        {checkedInId ? (
          <Link href={`/events/${checkedInId}/trades`} asChild>
            <Pressable style={styles.checkedIn}>
              <Ionicons name="navigate" size={22} color={colors.success} />
              <View style={{ flex: 1 }}>
                <Text style={styles.checkedLabel}>CHECKED IN</Text>
                <Text style={styles.checkedTitle}>Open event trades</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </Link>
        ) : null}

        {links.map((item) => (
          <Link key={item.href} href={item.href as never} asChild>
            <Pressable style={styles.hubRow}>
              <View style={styles.hubIcon}>
                <Ionicons name={item.icon} size={20} color={colors.pikachu} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hubTitle}>{item.title}</Text>
                <Text style={styles.hubSub}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.muted} />
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.slateDeep,
  },
  ballLayer: {
    ...(StyleSheet.absoluteFill as object),
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 48,
  },
  handle: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 4,
  },
  counts: {
    color: colors.muted2,
    marginBottom: 16,
    fontSize: 12,
  },
  checkedIn: {
    backgroundColor: "rgba(134,239,172,0.12)",
    borderColor: "rgba(134,239,172,0.3)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkedLabel: {
    color: colors.success,
    fontWeight: "800",
    fontSize: 11,
  },
  checkedTitle: {
    color: colors.white,
    fontWeight: "700",
  },
  hubRow: {
    backgroundColor: "rgba(30,41,59,0.78)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  hubIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,203,5,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  hubTitle: {
    color: colors.white,
    fontWeight: "800",
  },
  hubSub: {
    color: colors.muted,
    fontSize: 12,
  },
});
