import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Link, useFocusEffect } from "expo-router";
import { Screen, Subtitle, Title } from "../../components/ui";
import { formatEventDate, getNearbyEvents, RADIUS_MILES } from "../../lib/events";
import type { PokemonEvent } from "../../lib/types";
import { useApp } from "../../providers/AppProvider";
import { colors } from "../../constants/Colors";

export default function EventsTab() {
  const [events, setEvents] = useState<PokemonEvent[]>([]);
  const { attendance } = useApp();

  useFocusEffect(
    useCallback(() => {
      void getNearbyEvents().then(setEvents);
    }, [])
  );

  return (
    <Screen>
      <Title>Events</Title>
      <Subtitle>Pokémon events within {RADIUS_MILES} miles of you.</Subtitle>
      <FlatList
        data={events}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => {
          const going = !!attendance[item.id];
          return (
            <Link href={`/events/${item.id}`} asChild>
              <Pressable
                style={{
                  backgroundColor: colors.glass,
                  borderRadius: 16,
                  padding: 14,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: colors.pikachu, fontWeight: "800", fontSize: 11 }}>
                    {formatEventDate(item.date)}
                  </Text>
                  {going ? (
                    <Text style={{ color: colors.success, fontWeight: "800", fontSize: 11 }}>
                      {attendance[item.id] === "confirmed" ? "CHECKED IN" : "RSVP"}
                    </Text>
                  ) : null}
                </View>
                <Text style={{ color: colors.white, fontWeight: "800", marginTop: 4 }}>
                  {item.title}
                </Text>
                <Text style={{ color: colors.muted, fontSize: 12, marginTop: 2 }}>
                  {item.venue} · {item.distanceMiles.toFixed(1)} mi · {item.category}
                </Text>
              </Pressable>
            </Link>
          );
        }}
      />
    </Screen>
  );
}
