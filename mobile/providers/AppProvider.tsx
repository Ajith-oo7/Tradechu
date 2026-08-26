import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createCard } from "../lib/cards";
import { apiCardToPokemon, type ApiCard } from "../lib/tcgdex";
import type {
  AttendanceStatus,
  CardListType,
  PokemonCard,
} from "../lib/types";
import { useAuth } from "./AuthProvider";

interface AppContextValue {
  wishlist: PokemonCard[];
  tradeBinder: PokemonCard[];
  attendance: Record<string, AttendanceStatus>;
  quietHours: boolean;
  addIdentifiedCard: (api: ApiCard, list: CardListType, photoUrl?: string) => void;
  addNamedCard: (name: string, list: CardListType, photoUrl?: string) => void;
  removeCard: (id: string, list: CardListType) => void;
  updateCard: (
    id: string,
    patch: Partial<PokemonCard>,
    list: CardListType
  ) => void;
  attendEvent: (eventId: string, title: string) => void;
  cancelAttendance: (eventId: string) => void;
  confirmAttendance: (eventId: string) => void;
  setQuietHours: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);
const CARDS_KEY = "tradechu.mobile.cards";
const ATT_KEY = "tradechu.mobile.attendance";
const QUIET_KEY = "tradechu.mobile.quiet";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const [wishlist, setWishlist] = useState<PokemonCard[]>([
    createCard("Charizard ex"),
    createCard("Ancient Mew"),
  ]);
  const [tradeBinder, setTradeBinder] = useState<PokemonCard[]>([
    createCard("Eevee"),
    createCard("Pikachu ex"),
  ]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [quietHours, setQuietHoursState] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(CARDS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.wishlist?.length) setWishlist(parsed.wishlist);
          if (parsed.tradeBinder?.length) setTradeBinder(parsed.tradeBinder);
        }
        const att = await AsyncStorage.getItem(ATT_KEY);
        if (att) setAttendance(JSON.parse(att));
        const q = await AsyncStorage.getItem(QUIET_KEY);
        if (q === "1") setQuietHoursState(true);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    void AsyncStorage.setItem(CARDS_KEY, JSON.stringify({ wishlist, tradeBinder }));
  }, [wishlist, tradeBinder]);

  useEffect(() => {
    void AsyncStorage.setItem(ATT_KEY, JSON.stringify(attendance));
  }, [attendance]);

  const addIdentifiedCard = useCallback((api: ApiCard, list: CardListType, photoUrl?: string) => {
    const card = apiCardToPokemon(api, photoUrl);
    if (list === "wishlist") setWishlist((w) => [...w, card]);
    else setTradeBinder((b) => [...b, card]);
  }, []);

  const addNamedCard = useCallback((name: string, list: CardListType, photoUrl?: string) => {
    const card = createCard(name, photoUrl);
    if (list === "wishlist") setWishlist((w) => [...w, card]);
    else setTradeBinder((b) => [...b, card]);
  }, []);

  const removeCard = useCallback((id: string, list: CardListType) => {
    if (list === "wishlist") setWishlist((w) => w.filter((c) => c.id !== id));
    else setTradeBinder((b) => b.filter((c) => c.id !== id));
  }, []);

  const updateCard = useCallback((id: string, patch: Partial<PokemonCard>, list: CardListType) => {
    const map = (cards: PokemonCard[]) =>
      cards.map((c) => (c.id === id ? { ...c, ...patch } : c));
    if (list === "wishlist") setWishlist(map);
    else setTradeBinder(map);
  }, []);

  const attendEvent = useCallback((eventId: string, _title: string) => {
    setAttendance((a) => ({ ...a, [eventId]: "going" }));
  }, []);

  const cancelAttendance = useCallback((eventId: string) => {
    setAttendance((a) => {
      const n = { ...a };
      delete n[eventId];
      return n;
    });
  }, []);

  const confirmAttendance = useCallback((eventId: string) => {
    setAttendance((a) => ({ ...a, [eventId]: "confirmed" }));
  }, []);

  const setQuietHours = useCallback((v: boolean) => {
    setQuietHoursState(v);
    void AsyncStorage.setItem(QUIET_KEY, v ? "1" : "0");
  }, []);

  const value = useMemo(
    () => ({
      wishlist,
      tradeBinder,
      attendance,
      quietHours,
      addIdentifiedCard,
      addNamedCard,
      removeCard,
      updateCard,
      attendEvent,
      cancelAttendance,
      confirmAttendance,
      setQuietHours,
    }),
    [
      wishlist,
      tradeBinder,
      attendance,
      quietHours,
      addIdentifiedCard,
      addNamedCard,
      removeCard,
      updateCard,
      attendEvent,
      cancelAttendance,
      confirmAttendance,
      setQuietHours,
      profile?.id,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
