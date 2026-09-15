import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { colors, fonts } from "../../../constants/Colors";
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
      <View style={styles.root}>
        <Text style={styles.muted}>Loading…</Text>
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
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: "Event" }} />
      <Text style={styles.eyebrow}>
        {event.category} · {formatEventDate(event.date)}
      </Text>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.meta}>
        {event.venue}
        {"\n"}
        {event.address} · {event.distanceMiles.toFixed(1)} mi{"\n"}
        {event.startTime} – {event.endTime}
      </Text>
      <Subtitle>{event.description}</Subtitle>

      {event.details.map((d) => (
        <View key={d.label} style={styles.detailRow}>
          <Text style={styles.muted}>{d.label}</Text>
          <Text style={styles.detailValue}>{d.value}</Text>
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
            <Text style={styles.ok}>RSVP saved — check in when you’re within 1 mile</Text>
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
            <Text style={styles.hint}>
              RSVP (Répondez s’il vous plaît) means please respond — you will attend. Check in within
              1 mile to start matching.
            </Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  muted: { color: colors.muted, fontFamily: fonts.body },
  eyebrow: {
    color: colors.primary,
    fontFamily: fonts.label,
    fontSize: 12,
  },
  title: {
    color: colors.onSurface,
    fontFamily: fonts.headlineExtra,
    fontSize: 22,
    marginTop: 6,
  },
  meta: {
    color: colors.muted,
    marginTop: 8,
    fontFamily: fonts.body,
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailValue: {
    color: colors.onSurface,
    fontFamily: fonts.bodyBold,
  },
  ok: {
    color: colors.success,
    fontFamily: fonts.bodyBold,
    marginBottom: 8,
  },
  hint: {
    color: colors.muted2,
    fontSize: 11,
    textAlign: "center",
    marginTop: 10,
    fontFamily: fonts.body,
  },
});
