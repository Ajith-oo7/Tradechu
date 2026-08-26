import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text } from "react-native";
import { router } from "expo-router";
import { Field, PrimaryButton, Screen, SecondaryButton, Subtitle, Title } from "../../components/ui";
import { useAuth } from "../../providers/AuthProvider";
import { colors } from "../../constants/Colors";

export default function LoginScreen() {
  const { sendOtp, demoLogin, setPendingNames, backendOnline } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingTop: 48, paddingBottom: 40 }}>
          <Text style={{ color: colors.pikachu, fontWeight: "900", fontSize: 28, marginBottom: 4 }}>
            Tradechu
          </Text>
          <Title>Sign in</Title>
          <Subtitle>
            Enter your name and phone. We&apos;ll text a one-time code (OTP).{"\n"}
            {!backendOnline
              ? "Demo mode: after Send code, enter 123456 (add Supabase + Twilio for real SMS)."
              : "SMS via Supabase Phone Auth."}
          </Subtitle>

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

          {!backendOnline && (
            <SecondaryButton
              label="Continue in demo mode (skip SMS)"
              onPress={async () => {
                if (!firstName.trim() || !lastName.trim()) {
                  Alert.alert("Name required", "Enter first and last name.");
                  return;
                }
                await demoLogin(firstName.trim(), lastName.trim(), phone.trim() || "+15555550100");
                router.replace("/(tabs)");
              }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
