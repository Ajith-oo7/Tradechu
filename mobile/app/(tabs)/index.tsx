import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Subtitle } from "../../components/ui";
import { useAuth } from "../../providers/AuthProvider";
import { useApp } from "../../providers/AppProvider";
import { colors, fonts } from "../../constants/Colors";
import { todayStr } from "../../lib/events";
import { LevitatingPokeball, ParticleField } from "../../components/pokeball";

export default function HomeScreen() {
  const { profile } = useAuth();
  const { wishlist, tradeBinder, attendance } = useApp();
  const today = todayStr();
  const checkedInId = Object.entries(attendance).find(
    ([id, s]) => s === "confirmed" && id.includes(today)
  )?.[0];
  const activeTrades = Object.values(attendance).filter((s) => s === "confirmed").length;

  const tiles = [
    {
      href: "/binder/binder",
      title: "BINDER",
      count: tradeBinder.length,
      color: colors.secondary,
      bg: "rgba(27,91,184,0.12)",
      icon: "book" as const,
    },
    {
      href: "/binder/wishlist",
      title: "WISHLIST",
      count: wishlist.length,
      color: colors.primary,
      bg: "rgba(188,0,7,0.1)",
      icon: "heart" as const,
    },
    {
      href: "/(tabs)/events",
      title: "NEARBY EVENTS",
      count: "·",
      color: colors.tertiary,
      bg: "rgba(196,170,0,0.14)",
      icon: "location" as const,
    },
    {
      href: "/(tabs)/messages",
      title: "ACTIVE TRADES",
      count: activeTrades,
      color: colors.onSurface,
      bg: "rgba(233,188,182,0.25)",
      icon: "swap-horizontal" as const,
    },
  ];

  return (
    <View style={styles.root}>
      <ParticleField density={20} intensity="low" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetter}>
              {(profile?.firstName?.[0] || "T").toUpperCase()}
            </Text>
          </View>
          <Image
            source={require("../../assets/images/tradechu-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Ionicons name="notifications-outline" size={24} color={colors.onSurface} />
        </View>

        <View style={styles.hero}>
          <LevitatingPokeball size={160} dimmed={false} float />
          <ParticleField density={14} intensity="low" />
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarSm}>
            <Text style={styles.avatarLetter}>
              {(profile?.firstName?.[0] || "T").toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>
              {profile?.firstName} {profile?.lastName}
            </Text>
            <Text style={styles.profileBadge}>@{profile?.username}</Text>
          </View>
        </View>

        <Subtitle>
          Build lists, RSVP, check in nearby, then match.{"\n"}
          <Text style={{ fontFamily: fonts.bodyBold, color: colors.onSurface }}>RSVP</Text> ={" "}
          <Text style={{ fontStyle: "italic" }}>Répondez s’il vous plaît</Text>
        </Subtitle>

        <View style={styles.grid}>
          {tiles.map((t) => (
            <Pressable
              key={t.href}
              onPress={() => router.push(t.href as never)}
              style={[styles.tile, { backgroundColor: t.bg }]}
            >
              <View style={[styles.tileIcon, { backgroundColor: colors.surface }]}>
                <Ionicons name={t.icon} size={20} color={t.color} />
              </View>
              <Text style={styles.tileTitle}>{t.title}</Text>
              <Text style={[styles.tileCount, { color: t.color }]}>{t.count}</Text>
            </Pressable>
          ))}
        </View>

        {checkedInId ? (
          <Pressable onPress={() => router.push(`/events/${checkedInId}/trades` as never)}>
            <LinearGradient colors={["#f0eded", "#ffffff"]} style={styles.cta}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaEyebrow}>Local Trade Night</Text>
                <Text style={styles.ctaBody}>You’re checked in — open matches</Text>
              </View>
              <View style={styles.ctaBtn}>
                <Text style={styles.ctaBtnText}>Open</Text>
              </View>
            </LinearGradient>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push("/(tabs)/events")}>
            <LinearGradient colors={["#f0eded", "#ffffff"]} style={styles.cta}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ctaEyebrow}>Nearby gatherings</Text>
                <Text style={styles.ctaBody}>RSVP and check in within 1 mile</Text>
              </View>
              <View style={styles.ctaBtn}>
                <Text style={styles.ctaBtnText}>Events</Text>
              </View>
            </LinearGradient>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarSm: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: {
    color: colors.white,
    fontFamily: fonts.headline,
    fontSize: 16,
  },
  logo: { width: 120, height: 36 },
  hero: {
    height: 200,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surfaceLow,
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  profileName: {
    fontFamily: fonts.headline,
    fontSize: 16,
    color: colors.onSurface,
  },
  profileBadge: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.muted,
    marginTop: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  tile: {
    width: "47%",
    borderRadius: 20,
    padding: 14,
    minHeight: 110,
  },
  tileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  tileTitle: {
    fontFamily: fonts.label,
    fontSize: 11,
    letterSpacing: 0.6,
    color: colors.muted,
  },
  tileCount: {
    fontFamily: fonts.headlineExtra,
    fontSize: 28,
    marginTop: 4,
  },
  cta: {
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ctaEyebrow: {
    fontFamily: fonts.label,
    fontSize: 11,
    color: colors.primary,
    marginBottom: 4,
  },
  ctaBody: {
    fontFamily: fonts.bodyBold,
    color: colors.onSurface,
    fontSize: 14,
  },
  ctaBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ctaBtnText: {
    color: colors.onPrimary,
    fontFamily: fonts.headline,
    fontSize: 13,
  },
});
