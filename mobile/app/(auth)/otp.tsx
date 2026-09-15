import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  GlassPanel,
  PrimaryButton,
  Screen,
  SecondaryButton,
  Subtitle,
  Title,
} from "../../components/ui";
import { useAuth } from "../../providers/AuthProvider";
import { colors, fonts } from "../../constants/Colors";

export default function OtpScreen() {
  const { verifyOtp, pendingNames } = useAuth();
  const params = useLocalSearchParams<{
    phone?: string;
    firstName?: string;
    lastName?: string;
  }>();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(28);
  const inputs = useRef<(TextInput | null)[]>([]);

  const phone = params.phone ?? "";
  const firstName = params.firstName ?? pendingNames?.firstName ?? "";
  const lastName = params.lastName ?? pendingNames?.lastName ?? "";

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const onChangeDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = v;
    setDigits(next);
    if (v && index < 5) inputs.current[index + 1]?.focus();
  };

  const onVerify = async () => {
    const code = digits.join("");
    if (code.length < 6) {
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
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>←</Text>
      </Pressable>

      <View style={styles.center}>
        <GlassPanel style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={{ fontSize: 28 }}>📱</Text>
          </View>
          <Title centered>Verify Phone</Title>
          <Subtitle centered>
            We sent a 6-digit code to{"\n"}
            <Text style={{ fontFamily: fonts.bodyBold, color: colors.onSurface }}>
              {phone || "your phone"}
            </Text>
          </Subtitle>

          <View style={styles.row}>
            {digits.map((d, i) => (
              <TextInput
                key={i}
                ref={(r) => {
                  inputs.current[i] = r;
                }}
                value={d}
                onChangeText={(t) => onChangeDigit(i, t)}
                keyboardType="number-pad"
                maxLength={1}
                style={[styles.box, i === digits.findIndex((x) => !x) && styles.boxActive]}
                selectTextOnFocus
              />
            ))}
          </View>

          <Text style={styles.resend}>
            Didn&apos;t receive code?{" "}
            <Text style={{ color: colors.primary, fontFamily: fonts.label }}>
              {seconds > 0 ? `Resend in 0:${String(seconds).padStart(2, "0")}` : "Resend"}
            </Text>
          </Text>

          <PrimaryButton
            label="Verify & Enter →"
            onPress={onVerify}
            loading={loading}
          />
          <Text style={styles.demo}>Demo: use 123456</Text>
        </GlassPanel>
        <SecondaryButton label="Back" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backText: { fontSize: 18, color: colors.onSurface },
  center: { flex: 1, justifyContent: "center", paddingBottom: 40 },
  card: { alignItems: "center" },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(188,0,7,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  row: { flexDirection: "row", gap: 8, marginBottom: 16 },
  box: {
    width: 44,
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    textAlign: "center",
    fontSize: 22,
    fontFamily: fonts.headline,
    color: colors.onSurface,
  },
  boxActive: { borderColor: colors.secondary },
  resend: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 13,
    marginBottom: 8,
    textAlign: "center",
  },
  demo: {
    color: colors.muted2,
    fontSize: 12,
    marginTop: 12,
    fontFamily: fonts.body,
  },
});
