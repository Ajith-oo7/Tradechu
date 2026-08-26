import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Link, useLocalSearchParams, Stack } from "expo-router";
import { CardViewer } from "../../components/CardViewer";
import {
  CardRevealDeck,
  LevitatingPokeball,
  ShrineBackdrop,
  usePokeballOpen,
} from "../../components/pokeball";
import { useApp } from "../../providers/AppProvider";
import { colors } from "../../constants/Colors";
import type { CardListType, PokemonCard } from "../../lib/types";

export default function BinderScreen() {
  const { list } = useLocalSearchParams<{ list: string }>();
  const listType: CardListType = list === "binder" ? "binder" : "wishlist";
  const { wishlist, tradeBinder, removeCard, updateCard } = useApp();
  const cards = listType === "wishlist" ? wishlist : tradeBinder;
  const title = listType === "wishlist" ? "Wishlist" : "Trade Binder";
  const [selected, setSelected] = useState<PokemonCard | null>(null);
  const hasCards = cards.length > 0;
  const opened = usePokeballOpen(hasCards);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title }} />

      <View style={styles.chips}>
        <Link href={{ pathname: "/search", params: { list: listType } }} asChild>
          <Pressable style={chip}>
            <Text style={chipText}>Search a Card</Text>
          </Pressable>
        </Link>
        <Link href={{ pathname: "/scan", params: { list: listType } }} asChild>
          <Pressable style={[chip, { borderColor: "rgba(238,21,21,0.4)" }]}>
            <Text style={[chipText, { color: colors.pokeball }]}>Scan a Card</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.stage}>
        {hasCards ? <ShrineBackdrop intensity="high" /> : null}

        {/* Ball sits above shrine; halves split around the smaller card */}
        <View style={styles.ballAnchor} pointerEvents="none">
          <LevitatingPokeball
            size={hasCards ? 300 : 220}
            opened={opened}
            float={!hasCards}
          />
        </View>

        <CardRevealDeck
          cards={cards}
          opened={opened}
          cardScale={0.52}
          onPressCard={setSelected}
          onLongPressCard={(card) =>
            Alert.alert("Remove card?", card.name, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Remove",
                style: "destructive",
                onPress: () => removeCard(card.id, listType),
              },
            ])
          }
        />
      </View>

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
    backgroundColor: colors.slateDeep,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  chips: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    zIndex: 3,
  },
  stage: {
    flex: 1,
    position: "relative",
    // Allow open halves to extend toward edges
    overflow: "visible",
  },
  ballAnchor: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
});

const chip = {
  flex: 1,
  borderWidth: 1,
  borderColor: "rgba(255,203,5,0.35)",
  backgroundColor: "rgba(255,203,5,0.08)",
  borderRadius: 12,
  paddingVertical: 12,
  alignItems: "center" as const,
};
const chipText = { color: colors.pikachu, fontWeight: "800" as const, fontSize: 13 };
