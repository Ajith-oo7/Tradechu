import { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { useEffect } from "react";
import { Screen, Subtitle } from "../../../components/ui";
import { useApp } from "../../../providers/AppProvider";
import { useAuth } from "../../../providers/AuthProvider";
import { computeTradeOpportunities, DEMO_OTHERS } from "../../../lib/cards";
import { getEventById } from "../../../lib/events";
import { colors } from "../../../constants/Colors";
import { useState } from "react";
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
      <Stack.Screen options={{ title: "Event Trades" }} />
      <Text style={{ color: colors.success, fontWeight: "800", fontSize: 12 }}>
        YOU&apos;RE CHECKED IN
      </Text>
      <Text style={{ color: colors.white, fontWeight: "800", fontSize: 18, marginTop: 4 }}>
        {event?.title ?? "Event"}
      </Text>
      <Subtitle>
        Live attendee matching uses Supabase confirmed RSVPs when connected; demo traders shown
        below.
      </Subtitle>

      <FlatList
        data={opportunities}
        keyExtractor={(o) => o.id}
        ListEmptyComponent={
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 24 }}>
            No matches yet — add cards or wait for other collectors.
          </Text>
        }
        renderItem={({ item }) => (
          <View
            style={{
              backgroundColor: colors.glass,
              borderRadius: 16,
              padding: 14,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.white, fontWeight: "800" }}>@{item.username}</Text>
            <Text style={{ color: colors.muted, marginTop: 6, fontSize: 13 }}>
              Has {item.theyHave.name} · wants {item.youHave.name}
            </Text>
            <Text
              onPress={() => router.push("/(tabs)/messages")}
              style={{ color: colors.pikachu, fontWeight: "800", marginTop: 10 }}
            >
              Message
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}
