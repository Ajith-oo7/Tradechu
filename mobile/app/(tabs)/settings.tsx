import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Screen, PrimaryButton, SecondaryButton, Subtitle, Title } from "../../components/ui";
import { useAuth } from "../../providers/AuthProvider";
import { useApp } from "../../providers/AppProvider";
import { colors, fonts } from "../../constants/Colors";
import {
  ensureNotificationPermissions,
  notifyLocal,
  registerForPushAsync,
} from "../../lib/notifications";

export default function SettingsScreen() {
  const { profile, signOut } = useAuth();
  const { quietHours, setQuietHours, wishlist, tradeBinder } = useApp();

  return (
    <Screen>
      <Title>Settings</Title>
      <Subtitle>
        {profile?.firstName} {profile?.lastName}
        {"\n"}@{profile?.username} · {profile?.phone}
      </Subtitle>

      <View style={styles.card}>
        <Text style={styles.label}>Collection</Text>
        <Text style={styles.value}>
          {wishlist.length} wishlist · {tradeBinder.length} binder
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Session</Text>
        <Text style={styles.value}>Local demo (on-device only)</Text>
      </View>

      <PrimaryButton
        label={quietHours ? "Quiet hours: ON (tap to disable)" : "Quiet hours: OFF (tap to enable)"}
        onPress={() => setQuietHours(!quietHours)}
      />

      <PrimaryButton
        label="Enable notifications"
        onPress={async () => {
          const ok = await ensureNotificationPermissions();
          const token = await registerForPushAsync();
          if (ok) {
            await notifyLocal(
              "Notifications on",
              token
                ? "Expo push token ready for device reminders."
                : "Local notifications enabled."
            );
          } else {
            Alert.alert("Permission denied", "Enable notifications in system settings.");
          }
        }}
      />

      <SecondaryButton
        label="Test open-trade reminder"
        onPress={() => void notifyLocal("Trade still open?", "Trade with @TrainerY still open?")}
      />

      <SecondaryButton
        label="Sign out"
        onPress={async () => {
          await signOut();
          router.replace("/(auth)/login");
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { color: colors.muted, fontSize: 11, fontFamily: fonts.label },
  value: {
    color: colors.onSurface,
    fontFamily: fonts.bodyBold,
    marginTop: 4,
  },
});
