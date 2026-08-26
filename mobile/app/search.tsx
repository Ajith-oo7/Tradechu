import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Field, Screen, Subtitle } from "../components/ui";
import { searchCards, type ApiCard } from "../lib/tcgdex";
import { useApp } from "../providers/AppProvider";
import { colors } from "../constants/Colors";
import type { CardListType } from "../lib/types";

export default function SearchScreen() {
  const { list } = useLocalSearchParams<{ list?: string }>();
  const listType: CardListType = list === "binder" ? "binder" : "wishlist";
  const { addIdentifiedCard } = useApp();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      void searchCards(q).then((cards) => {
        setResults(cards);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <Screen>
      <Subtitle>Search the live card database, then tap to add.</Subtitle>
      <Field
        placeholder="Search any Pokémon card…"
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      {loading ? <ActivityIndicator color={colors.pikachu} /> : null}
      <FlatList
        data={results}
        keyExtractor={(c) => c.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <Pressable
            style={{ width: "48%", marginBottom: 12 }}
            onPress={() => {
              addIdentifiedCard(item, listType);
              router.back();
            }}
          >
            <Image
              source={{ uri: item.imageSmall }}
              style={{ width: "100%", aspectRatio: 3 / 4, borderRadius: 10 }}
            />
            <Text numberOfLines={1} style={{ color: colors.white, fontWeight: "700", fontSize: 11, marginTop: 4 }}>
              {item.name}
            </Text>
            <Text numberOfLines={1} style={{ color: colors.muted2, fontSize: 10 }}>
              {item.setName}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          !loading && query.length >= 2 ? (
            <Text style={{ color: colors.muted, textAlign: "center", marginTop: 24 }}>
              No cards found
            </Text>
          ) : null
        }
      />
    </Screen>
  );
}
