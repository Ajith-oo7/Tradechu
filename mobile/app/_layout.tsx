import "react-native-gesture-handler";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useFonts,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";
import {
  Quicksand_500Medium,
  Quicksand_700Bold,
} from "@expo-google-fonts/quicksand";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { AppProvider } from "../providers/AppProvider";
import { colors } from "../constants/Colors";

export { ErrorBoundary } from "expo-router";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuth = segments[0] === "(auth)";
    if (!profile && !inAuth) {
      router.replace("/(auth)/login");
    } else if (profile && inAuth) {
      router.replace("/(tabs)");
    }
  }, [loading, profile, segments, router]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const headerOpts = {
  headerShown: true as const,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.onSurface,
  headerTitleStyle: { fontFamily: "Montserrat_700Bold" as const },
  headerShadowVisible: false,
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Quicksand_500Medium,
    Quicksand_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppProvider>
          <AuthGate>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
              }}
            >
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="events/[id]/index"
                options={{ ...headerOpts, title: "Event" }}
              />
              <Stack.Screen
                name="events/[id]/trades"
                options={{ ...headerOpts, title: "Mutual Matches" }}
              />
              <Stack.Screen name="binder/[list]" options={headerOpts} />
              <Stack.Screen
                name="scan"
                options={{
                  ...headerOpts,
                  presentation: "modal",
                  title: "Scan card",
                }}
              />
              <Stack.Screen
                name="search"
                options={{
                  ...headerOpts,
                  presentation: "modal",
                  title: "Search cards",
                }}
              />
            </Stack>
          </AuthGate>
        </AppProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
