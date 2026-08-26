import { useState } from "react";
import { Alert, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Field, PrimaryButton, Screen, SecondaryButton, Subtitle, Title } from "../../components/ui";
import { useAuth } from "../../providers/AuthProvider";
import { colors } from "../../constants/Colors";

export default function OtpScreen() {
  const { verifyOtp, pendingNames } = useAuth();
  const params = useLocalSearchParams<{
    phone?: string;
    firstName?: string;
    lastName?: string;
  }>();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const phone = params.phone ?? "";
  const firstName = params.firstName ?? pendingNames?.firstName ?? "";
  const lastName = params.lastName ?? pendingNames?.lastName ?? "";

  const onVerify = async () => {
    if (!code.trim()) {
      Alert.alert("Enter the code", "Check your SMS for the 6-digit OTP.");
      return;
    }
    setLoading(true);
    const { error } = await verifyOtp(phone, code, firstName, lastName);
    setLoading(false);
    if (error) {
      Alert.alert("Verification failed", error);
      return;
    }
    router.replace("/(tabs)");
  };

  return (
    <Screen>
      <Text style={{ marginTop: 48, color: colors.pikachu, fontWeight: "800" }}>OTP</Text>
      <Title>Enter code</Title>
      <Subtitle>
        We sent a code to {phone || "your phone"}.{"\n"}
        Demo without Twilio: use <Text style={{ color: colors.white, fontWeight: "700" }}>123456</Text>.
      </Subtitle>
      <Field
        placeholder="6-digit code"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />
      <PrimaryButton label="Verify & continue" onPress={onVerify} loading={loading} />
      <SecondaryButton label="Back" onPress={() => router.back()} />
    </Screen>
  );
}
