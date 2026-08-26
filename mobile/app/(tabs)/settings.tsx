import { Alert, Text, View } from "react-native";
import { Screen, PrimaryButton, SecondaryButton, Subtitle, Title } from "../../components/ui";
import { useAuth } from "../../providers/AuthProvider";
import { useApp } from "../../providers/AppProvider";
import { colors } from "../../constants/Colors";
import {
  ensureNotificationPermissions,
  notifyLocal,
  registerForPushAsync,
} from "../../lib/notifications";
import { router } from "expo-router";

export default function SettingsScreen() {
  const { profile, signOut, backendOnline } = useAuth();
  const { quietHours, setQuietHours, wishlist, tradeBinder } = useApp();

  return (
    <Screen>
      <Title>Settings</Title>
      <Subtitle>
        {profile?.firstName} {profile?.lastName}
        {"\n"}@{profile?.username} · {profile?.phone}
      </Subtitle>

      <View style={card}>
        <Text style={label}>Collection</Text>
        <Text style={value}>
          {wishlist.length} wishlist · {tradeBinder.length} binder
        </Text>
      </View>

      <View style={card}>
        <Text style={label}>Backend</Text>
        <Text style={value}>
          {backendOnline ? "Supabase connected" : "Local demo (set EXPO_PUBLIC_SUPABASE_*)"}
        </Text>
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
        onPress={() =>
          void notifyLocal("Trade still open?", "Trade with @TrainerY still open?")
        }
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

const card = {
  backgroundColor: colors.glass,
  borderRadius: 14,
  padding: 14,
  marginBottom: 10,
  borderWidth: 1,
  borderColor: colors.border,
};
const label = { color: colors.muted, fontSize: 11, fontWeight: "700" as const };
const value = { color: colors.white, fontWeight: "700" as const, marginTop: 4 };
