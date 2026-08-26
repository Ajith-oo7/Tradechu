import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { PrimaryButton, SecondaryButton, Subtitle } from "../../../components/ui";
import {
  formatEventDate,
  GEOFENCE_MILES,
  getEventById,
  milesBetween,
  regenerateAround,
} from "../../../lib/events";
import type { PokemonEvent } from "../../../lib/types";
import { useApp } from "../../../providers/AppProvider";
import { colors } from "../../../constants/Colors";
import {
  ensureNotificationPermissions,
  notifyLocal,
} from "../../../lib/notifications";

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<PokemonEvent | null>(null);
  const { attendance, attendEvent, cancelAttendance, confirmAttendance, quietHours } =
    useApp();

  useEffect(() => {
    void getEventById(id!).then((e) => setEvent(e ?? null));
  }, [id]);

  if (!event) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.slateDeep, padding: 16 }}>
        <Text style={{ color: colors.muted }}>Loading…</Text>
      </View>
    );
  }

  const status = attendance[event.id];

  const tryCheckIn = async () => {
    const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    if (locStatus !== "granted") {
      Alert.alert("Location needed", "Allow location to check in within 1 mile.");
      return;
    }
    const pos = await Location.getCurrentPositionAsync({});
    const dist = milesBetween(
      pos.coords.latitude,
      pos.coords.longitude,
      event.lat,
      event.lng
    );
    if (dist > GEOFENCE_MILES) {
      Alert.alert(
        "Not close enough",
        `You're about ${dist.toFixed(1)} mi away. Come within ${GEOFENCE_MILES} mile, or simulate arrival for demo.`
      );
      return;
    }
    await finishCheckIn();
  };

  const finishCheckIn = async () => {
    confirmAttendance(event.id);
    if (!quietHours) {
      await ensureNotificationPermissions();
      await notifyLocal(
        "Checked in!",
        `Finding traders at ${event.title}`,
        `/events/${event.id}/trades`
      );
    }
    router.push(`/events/${event.id}/trades`);
  };

  const simulateNearby = async () => {
    await regenerateAround({ lat: event.lat, lng: event.lng });
    await finishCheckIn();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.slateDeep }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <Stack.Screen options={{ title: "Event" }} />
      <Text style={{ color: colors.pikachu, fontWeight: "800", fontSize: 12 }}>
        {event.category} · {formatEventDate(event.date)}
      </Text>
      <Text style={{ color: colors.white, fontWeight: "900", fontSize: 22, marginTop: 6 }}>
        {event.title}
      </Text>
      <Text style={{ color: colors.muted, marginTop: 8 }}>
        {event.venue}
        {"\n"}
        {event.address} · {event.distanceMiles.toFixed(1)} mi{"\n"}
        {event.startTime} – {event.endTime}
      </Text>
      <Subtitle>{event.description}</Subtitle>

      {event.details.map((d) => (
        <View
          key={d.label}
          style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}
        >
          <Text style={{ color: colors.muted }}>{d.label}</Text>
          <Text style={{ color: colors.white, fontWeight: "700" }}>{d.value}</Text>
        </View>
      ))}

      <View style={{ marginTop: 16 }}>
        {status === "confirmed" ? (
          <>
            <PrimaryButton
              label="Open event trades"
              onPress={() => router.push(`/events/${event.id}/trades`)}
            />
            <SecondaryButton label="Cancel check-in" onPress={() => cancelAttendance(event.id)} />
          </>
        ) : status === "going" ? (
          <>
            <Text style={{ color: colors.success, fontWeight: "700", marginBottom: 8 }}>
              RSVP saved — check in when you’re within 1 mile
            </Text>
            <PrimaryButton label="I'm here — check in" onPress={() => void tryCheckIn()} />
            <SecondaryButton label="Simulate nearby (demo)" onPress={() => void simulateNearby()} />
            <SecondaryButton label="Cancel RSVP" onPress={() => cancelAttendance(event.id)} />
          </>
        ) : (
          <>
            <PrimaryButton
              label="RSVP — I am attending"
              onPress={() => {
                attendEvent(event.id, event.title);
                void ensureNotificationPermissions();
              }}
            />
            <Text style={{ color: colors.muted2, fontSize: 11, textAlign: "center", marginTop: 10 }}>
              RSVP (Répondez s’il vous plaît) means please respond — you will attend. Check in within 1
              mile to start matching.
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}
