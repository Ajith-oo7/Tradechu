import "react-native-gesture-handler";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "../providers/AuthProvider";
import { AppProvider } from "../providers/AppProvider";
import { colors } from "../constants/Colors";

export { ErrorBoundary } from "expo-router";

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
      <View style={{ flex: 1, backgroundColor: colors.slateDeep, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.pikachu} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppProvider>
          <AuthGate>
            <StatusBar style="light" />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.slateDeep } }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="events/[id]/index" options={{ headerShown: true, title: "Event", headerStyle: { backgroundColor: colors.slateDeep }, headerTintColor: colors.white }} />
              <Stack.Screen name="events/[id]/trades" options={{ headerShown: true, title: "Event Trades", headerStyle: { backgroundColor: colors.slateDeep }, headerTintColor: colors.white }} />
              <Stack.Screen name="binder/[list]" options={{ headerShown: true, headerStyle: { backgroundColor: colors.slateDeep }, headerTintColor: colors.white }} />
              <Stack.Screen name="scan" options={{ presentation: "modal", headerShown: true, title: "Scan card", headerStyle: { backgroundColor: colors.slateDeep }, headerTintColor: colors.white }} />
              <Stack.Screen name="search" options={{ presentation: "modal", headerShown: true, title: "Search cards", headerStyle: { backgroundColor: colors.slateDeep }, headerTintColor: colors.white }} />
            </Stack>
          </AuthGate>
        </AppProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
