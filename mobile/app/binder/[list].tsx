import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { CardViewer } from "../../components/CardViewer";
import {
  CardRevealDeck,
  LevitatingPokeball,
  ParticleField,
  ShrineBackdrop,
  usePokeballOpen,
} from "../../components/pokeball";
import { conditionLabel } from "../../lib/conditions";
import { useApp } from "../../providers/AppProvider";
import { colors, fonts } from "../../constants/Colors";
import type { CardListType, PokemonCard } from "../../lib/types";

export default function BinderScreen() {
  const { list } = useLocalSearchParams<{ list: string }>();
  const listType: CardListType = list === "binder" ? "binder" : "wishlist";
  const { wishlist, tradeBinder, removeCard, updateCard } = useApp();
  const cards = listType === "wishlist" ? wishlist : tradeBinder;
  const title = listType === "wishlist" ? "My Wishlist" : "My Binder";
  const [selected, setSelected] = useState<PokemonCard | null>(null);
  const [query, setQuery] = useState("");
  const hasCards = cards.length > 0;
  const opened = usePokeballOpen(hasCards);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter((c) => c.name.toLowerCase().includes(q));
  }, [cards, query]);

  const confirmRemove = (card: PokemonCard) => {
    Alert.alert("Remove card?", card.name, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeCard(card.id, listType),
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title }} />

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            placeholder={listType === "wishlist" ? "Search Wishlist…" : "Search Binder…"}
            placeholderTextColor={colors.muted2}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
        <Link href={{ pathname: "/scan", params: { list: listType } }} asChild>
          <Pressable style={styles.scanBtn}>
            <Ionicons name="camera" size={20} color={colors.onPrimary} />
          </Pressable>
        </Link>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.heading}>{title.toUpperCase()}</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>{cards.length} Cards</Text>
        </View>
      </View>

      {listType === "binder" ? (
        <View style={styles.stage}>
          {hasCards ? <ShrineBackdrop intensity="high" /> : <ParticleField density={18} intensity="low" />}
          <View style={styles.ballAnchor} pointerEvents="none">
            <LevitatingPokeball size={hasCards ? 280 : 200} opened={opened} float={!hasCards} />
          </View>
          <CardRevealDeck
            cards={filtered}
            opened={opened}
            cardScale={0.52}
            onPressCard={setSelected}
            onLongPressCard={confirmRemove}
            emptyLabel="No cards yet — search or scan to add."
          />
          <Link href={{ pathname: "/search", params: { list: listType } }} asChild>
            <Pressable style={styles.searchLink}>
              <Text style={styles.searchLinkText}>Search a Card</Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <View style={styles.stage}>
          <ShrineBackdrop intensity="medium" />
          <FlatList
            data={filtered}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
            ListHeaderComponent={
              <View style={styles.wishHero}>
                <LevitatingPokeball size={120} opened={0.2} float />
              </View>
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>Add cards you want to hunt.</Text>
            }
            ListFooterComponent={
              <Link href={{ pathname: "/search", params: { list: listType } }} asChild>
                <Pressable style={styles.addDashed}>
                  <Ionicons name="add" size={28} color={colors.muted} />
                  <Text style={styles.addDashedText}>Add to Wishlist</Text>
                </Pressable>
              </Link>
            }
            renderItem={({ item }) => {
              const image = item.apiImageUrl || item.photoUrl;
              return (
                <Pressable
                  style={styles.wishRow}
                  onPress={() => setSelected(item)}
                  onLongPress={() => confirmRemove(item)}
                >
                  <View style={styles.wishArt}>
                    {image ? (
                      <Image source={{ uri: image }} style={styles.wishImg} resizeMode="cover" />
                    ) : (
                      <Text style={styles.wishLetter}>{item.name[0]}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wishName}>{item.name}</Text>
                    <Text style={styles.wishMeta}>
                      {item.setName || "Pokémon TCG"}
                      {item.condition ? ` · ${conditionLabel(item.condition)}` : ""}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
          <Link href={{ pathname: "/search", params: { list: listType } }} asChild>
            <Pressable style={styles.fab}>
              <Ionicons name="add" size={28} color={colors.onPrimary} />
            </Pressable>
          </Link>
        </View>
      )}

      {selected ? (
        <CardViewer
          card={selected}
          onClose={() => setSelected(null)}
          onSave={(patch) => {
            updateCard(selected.id, patch, listType);
            setSelected(null);
          }}
          onRemove={() => {
            removeCard(selected.id, listType);
            setSelected(null);
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchRow: { flexDirection: "row", gap: 8, marginBottom: 10, zIndex: 2 },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: colors.onSurface,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },
  scanBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  heading: {
    fontFamily: fonts.headlineExtra,
    fontSize: 18,
    color: colors.onSurface,
    letterSpacing: 0.5,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { fontFamily: fonts.label, fontSize: 12, color: colors.primary },
  stage: { flex: 1, position: "relative" },
  ballAnchor: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  searchLink: {
    alignSelf: "center",
    marginBottom: 12,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "rgba(188,0,7,0.08)",
    borderWidth: 1,
    borderColor: "rgba(188,0,7,0.25)",
  },
  searchLinkText: { color: colors.primary, fontFamily: fonts.headline, fontSize: 13 },
  wishHero: { alignItems: "center", height: 140, justifyContent: "center" },
  wishRow: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  wishArt: {
    width: 64,
    height: 88,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  wishImg: { width: "100%", height: "100%" },
  wishLetter: { fontFamily: fonts.headlineExtra, fontSize: 24, color: colors.primary },
  wishName: { fontFamily: fonts.headline, fontSize: 15, color: colors.onSurface },
  wishMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.muted, marginTop: 4 },
  addDashed: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: colors.outlineVariant,
    borderRadius: 18,
    paddingVertical: 28,
    alignItems: "center",
    marginTop: 4,
  },
  addDashedText: { marginTop: 6, fontFamily: fonts.label, color: colors.muted },
  fab: {
    position: "absolute",
    right: 8,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  emptyText: {
    color: colors.muted,
    fontFamily: fonts.body,
    textAlign: "center",
    marginTop: 24,
  },
});
