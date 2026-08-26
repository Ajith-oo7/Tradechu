import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import type { Profile } from "../lib/types";

interface AuthContextValue {
  loading: boolean;
  sessionReady: boolean;
  profile: Profile | null;
  backendOnline: boolean;
  sendOtp: (phone: string) => Promise<{ error?: string }>;
  verifyOtp: (
    phone: string,
    token: string,
    firstName: string,
    lastName: string
  ) => Promise<{ error?: string }>;
  /** Local demo login when Supabase/Twilio isn't configured */
  demoLogin: (firstName: string, lastName: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
  pendingPhone: string | null;
  pendingNames: { firstName: string; lastName: string } | null;
  setPendingNames: (n: { firstName: string; lastName: string }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_KEY = "tradechu.demoProfile";

function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+1${digits}`;
  return digits.startsWith("1") && digits.length === 11 ? `+${digits}` : `+${digits}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [pendingNames, setPendingNames] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);
  const backendOnline = isSupabaseConfigured();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const sb = getSupabase();
        if (sb) {
          const { data } = await sb.auth.getSession();
          if (data.session?.user && mounted) {
            const { data: row } = await sb
              .from("profiles")
              .select("*")
              .eq("id", data.session.user.id)
              .maybeSingle();
            if (row) {
              setProfile({
                id: row.id,
                firstName: row.first_name ?? "",
                lastName: row.last_name ?? "",
                phone: row.phone ?? data.session.user.phone ?? "",
                username: row.username ?? "trainer",
              });
            }
          }
        } else {
          const raw = await AsyncStorage.getItem(DEMO_KEY);
          if (raw && mounted) setProfile(JSON.parse(raw));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    const normalized = normalizePhone(phone);
    const sb = getSupabase();
    if (!sb) {
      setPendingPhone(normalized);
      return {};
    }
    const { error } = await sb.auth.signInWithOtp({ phone: normalized });
    if (error) return { error: error.message };
    setPendingPhone(normalized);
    return {};
  }, []);

  const upsertProfile = useCallback(
    async (
      userId: string,
      firstName: string,
      lastName: string,
      phone: string
    ) => {
      const username = `${firstName}${lastName}`.replace(/\s/g, "").toLowerCase() || "trainer";
      const p: Profile = {
        id: userId,
        firstName,
        lastName,
        phone,
        username,
      };
      const sb = getSupabase();
      if (sb) {
        await sb.from("profiles").upsert({
          id: userId,
          username,
          first_name: firstName,
          last_name: lastName,
          phone,
          avatar: firstName[0]?.toUpperCase() ?? "T",
        });
      } else {
        await AsyncStorage.setItem(DEMO_KEY, JSON.stringify(p));
      }
      setProfile(p);
    },
    []
  );

  const verifyOtp = useCallback(
    async (phone: string, token: string, firstName: string, lastName: string) => {
      const normalized = normalizePhone(phone);
      const sb = getSupabase();
      if (!sb) {
        // Demo: accept 123456
        if (token.trim() !== "123456") {
          return { error: "Demo mode: use code 123456 (or configure Supabase + Twilio)." };
        }
        await upsertProfile(`demo-${normalized}`, firstName, lastName, normalized);
        return {};
      }
      const { data, error } = await sb.auth.verifyOtp({
        phone: normalized,
        token: token.trim(),
        type: "sms",
      });
      if (error) return { error: error.message };
      const uid = data.user?.id;
      if (!uid) return { error: "No user returned from OTP verify." };
      await upsertProfile(uid, firstName, lastName, normalized);
      return {};
    },
    [upsertProfile]
  );

  const demoLogin = useCallback(
    async (firstName: string, lastName: string, phone: string) => {
      const normalized = normalizePhone(phone);
      await upsertProfile(`demo-${normalized}`, firstName, lastName, normalized);
    },
    [upsertProfile]
  );

  const signOut = useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    await AsyncStorage.removeItem(DEMO_KEY);
    setProfile(null);
    setPendingPhone(null);
    setPendingNames(null);
  }, []);

  const value = useMemo(
    () => ({
      loading,
      sessionReady: !loading,
      profile,
      backendOnline,
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
      backendOnline,
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
