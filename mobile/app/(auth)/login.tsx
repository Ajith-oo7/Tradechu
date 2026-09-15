import { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  Field,
  GlassPanel,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Subtitle,
  Title,
} from "../../components/ui";
import { ParticleField } from "../../components/pokeball";
import { useAuth } from "../../providers/AuthProvider";
import { colors, fonts } from "../../constants/Colors";

export default function LoginScreen() {
  const { sendOtp, demoLogin, setPendingNames } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const onSend = async () => {
    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      Alert.alert("Missing info", "Enter first name, last name, and phone number.");
      return;
    }
    setLoading(true);
    setPendingNames({ firstName: firstName.trim(), lastName: lastName.trim() });
    const { error } = await sendOtp(phone.trim());
    setLoading(false);
    if (error) {
      Alert.alert("Could not send code", error);
      return;
    }
    router.push({
      pathname: "/(auth)/otp",
      params: {
        phone: phone.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      },
    });
  };

  const onDemo = async () => {
    const first = firstName.trim() || "Demo";
    const last = lastName.trim() || "Trainer";
    setDemoLoading(true);
    try {
      await demoLogin(first, last, phone.trim() || "+15555550100");
      router.replace("/(tabs)");
    } catch (e) {
      Alert.alert("Demo login failed", e instanceof Error ? e.message : "Unknown error");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <Screen style={{ paddingHorizontal: 0 }}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <ParticleField density={22} intensity="low" />
      </View>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../../assets/images/tradechu-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.brand}>Tradechu</Text>
          <Title centered>Sign in</Title>
          <Subtitle centered>
            Enter your name and phone for a local demo session.{"\n"}
            Tap Continue in demo mode, or Send code and enter 123456.
          </Subtitle>

          <GlassPanel>
            <Field
              placeholder="First name"
              autoCapitalize="words"
              value={firstName}
              onChangeText={setFirstName}
            />
            <Field
              placeholder="Last name"
              autoCapitalize="words"
              value={lastName}
              onChangeText={setLastName}
            />
            <Field
              placeholder="Phone (+1…)"
              keyboardType="phone-pad"
              autoComplete="tel"
              value={phone}
              onChangeText={setPhone}
            />
            <PrimaryButton label="Send code" onPress={onSend} loading={loading} />
          </GlassPanel>

          <SecondaryButton
            label={demoLoading ? "Starting demo…" : "Continue in demo mode (skip SMS)"}
            onPress={() => void onDemo()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 40,
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: "center",
    marginBottom: 8,
  },
  brand: {
    color: colors.primary,
    fontFamily: fonts.headlineExtra,
    fontSize: 32,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 12,
  },
});
