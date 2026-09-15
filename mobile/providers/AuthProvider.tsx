import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Profile } from "../lib/types";

interface AuthContextValue {
  loading: boolean;
  sessionReady: boolean;
  profile: Profile | null;
  sendOtp: (phone: string) => Promise<{ error?: string }>;
  verifyOtp: (
    phone: string,
    token: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error?: string }>;
  demoLogin: (firstName: string, lastName: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  pendingPhone: string | null;
  pendingNames: { firstName: string; lastName: string } | null;
  setPendingNames: (n: { firstName: string; lastName: string }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PROFILE_KEY = "tradechu.profile";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  return digits.startsWith("1") && digits.length === 11 ? `+${digits}` : `+${digits}`;
}

function buildProfile(
  firstName: string,
  lastName: string,
  phone: string
): Profile {
  const normalized = normalizePhone(phone || "+15555550100");
  const username =
    `${firstName}${lastName}`.replace(/\s/g, "").toLowerCase() || "trainer";
  return {
    id: `local-${normalized}`,
    firstName,
    lastName,
    phone: normalized,
    username,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [pendingNames, setPendingNames] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw =
          (await AsyncStorage.getItem(PROFILE_KEY)) ??
          (await AsyncStorage.getItem("tradechu.demoProfile"));
        if (raw && mounted) setProfile(JSON.parse(raw));
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const persistProfile = useCallback(async (p: Profile) => {
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    } catch {
      // Still allow in-memory session if storage fails
    }
    setProfile(p);
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    setPendingPhone(normalizePhone(phone));
    return {};
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, token: string, firstName: string, lastName: string) => {
      if (token.trim() !== "123456") {
        return { error: "Use demo code 123456." };
      }
      await persistProfile(buildProfile(firstName, lastName, phone));
      return {};
    },
    [persistProfile]
  );

  const demoLogin = useCallback(
    async (firstName: string, lastName: string, phone: string) => {
      await persistProfile(buildProfile(firstName, lastName, phone));
    },
    [persistProfile]
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(PROFILE_KEY);
    setProfile(null);
    setPendingPhone(null);
    setPendingNames(null);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      sessionReady: !loading,
      profile,
      sendOtp,
      verifyOtp,
      demoLogin,
      signOut,
      pendingPhone,
      pendingNames,
      setPendingNames,
    }),
    [
      loading,
      profile,
      sendOtp,
      verifyOtp,
      demoLogin,
      signOut,
      pendingPhone,
      pendingNames,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
