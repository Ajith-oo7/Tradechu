"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { ensureCardIndex } from "@/lib/cardIndex";
import type {
  ActivityItem,
  AttendanceStatus,
  CardCondition,
  CardListType,
  PokemonCard,
  UserStats,
} from "@/types";
import { currentUser as initialUser, recentActivity as initialActivity } from "@/data/mock";
import { createCard, createCardFromApi, gradientForName } from "@/lib/cardUtils";
import type { ApiCard } from "@/lib/pokemonTcg";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  deleteCardFromBackend,
  deleteRsvp,
  ensureAnonSession,
  syncCardToBackend,
  upsertRsvp,
} from "@/lib/supabase/api";
import type { CardEditPatch } from "@/components/binder/EditCardSheet";

interface AppState {
  username: string;
  avatar: string;
  avatarGradient: string;
  wishlist: PokemonCard[];
  tradeBinder: PokemonCard[];
  stats: UserStats;
  activity: ActivityItem[];
  darkMode: boolean;
  quietHours: boolean;
  userId: string | null;
  backendOnline: boolean;
}

const ATTENDANCE_KEY = "tradechu.attendance.v1";
const QUIET_KEY = "tradechu.quietHours.v1";
const CARDS_KEY = "tradechu.cards.v1";

interface AppContextValue extends AppState {
  addToWishlist: (card: PokemonCard) => void;
  removeFromWishlist: (id: string) => void;
  addToBinder: (card: PokemonCard) => void;
  removeFromBinder: (id: string) => void;
  addCardFromCamera: (name: string, photoUrl: string, list: CardListType) => void;
  addIdentifiedCard: (apiCard: ApiCard, list: CardListType, photoUrl?: string) => void;
  updateCardName: (id: string, name: string, list: CardListType) => void;
  updateCard: (id: string, patch: CardEditPatch, list: CardListType) => void;
  completeTrade: (wishlistCardId: string, binderCardId: string) => void;
  addActivity: (text: string, type: ActivityItem["type"]) => void;
  attendance: Record<string, AttendanceStatus>;
  attendEvent: (eventId: string, eventTitle: string) => void;
  cancelAttendance: (eventId: string) => void;
  confirmAttendance: (eventId: string) => void;
  setDarkMode: (v: boolean) => void;
  setQuietHours: (v: boolean) => void;
  clearWishlist: () => void;
  clearBinder: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    username: initialUser.username,
    avatar: initialUser.avatar,
    avatarGradient: initialUser.avatarGradient,
    wishlist: [...initialUser.wishlist],
    tradeBinder: [...initialUser.tradeBinder],
    stats: { ...initialUser.stats },
    activity: [...initialActivity],
    darkMode: true,
    quietHours: false,
    userId: null,
    backendOnline: false,
  });

  const userIdRef = useRef<string | null>(null);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const attendanceLoaded = useRef(false);

  useEffect(() => {
    void ensureCardIndex();
  }, []);

  // Restore local cards / quiet hours / attendance, then optional Supabase session.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ATTENDANCE_KEY);
      if (raw) setAttendance(JSON.parse(raw));
      const quiet = localStorage.getItem(QUIET_KEY);
      if (quiet === "1") setState((s) => ({ ...s, quietHours: true }));
      const cardsRaw = localStorage.getItem(CARDS_KEY);
      if (cardsRaw) {
        const parsed = JSON.parse(cardsRaw) as {
          wishlist?: PokemonCard[];
          tradeBinder?: PokemonCard[];
        };
        setState((s) => ({
          ...s,
          wishlist: parsed.wishlist?.length ? parsed.wishlist : s.wishlist,
          tradeBinder: parsed.tradeBinder?.length ? parsed.tradeBinder : s.tradeBinder,
        }));
      }
    } catch {
      // ignore
    }
    attendanceLoaded.current = true;

    if (isSupabaseConfigured()) {
      void ensureAnonSession(initialUser.username).then((id) => {
        if (id) {
          userIdRef.current = id;
          setState((s) => ({ ...s, userId: id, backendOnline: true }));
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!attendanceLoaded.current) return;
    try {
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendance));
    } catch {
      // ignore
    }
  }, [attendance]);

  useEffect(() => {
    try {
      localStorage.setItem(
        CARDS_KEY,
        JSON.stringify({ wishlist: state.wishlist, tradeBinder: state.tradeBinder })
      );
    } catch {
      // ignore
    }
  }, [state.wishlist, state.tradeBinder]);

  const persistCard = useCallback((card: PokemonCard, list: CardListType) => {
    const uid = userIdRef.current;
    if (uid) void syncCardToBackend(uid, card, list);
  }, []);

  const addActivity = useCallback((text: string, type: ActivityItem["type"]) => {
    setState((s) => ({
      ...s,
      activity: [{ id: `a-${Date.now()}`, text, timestamp: "Just now", type }, ...s.activity],
    }));
  }, []);

  const addToWishlist = useCallback(
    (card: PokemonCard) => {
      const withCond: PokemonCard = { condition: "NM" as CardCondition, ...card };
      setState((s) => ({
        ...s,
        wishlist: [...s.wishlist, withCond],
        stats: { ...s.stats, wishlistCount: s.wishlist.length + 1 },
      }));
      persistCard(withCond, "wishlist");
      addActivity(`Added ${card.name} to Wishlist`, "wishlist");
    },
    [addActivity, persistCard]
  );

  const removeFromWishlist = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      wishlist: s.wishlist.filter((c) => c.id !== id),
      stats: { ...s.stats, wishlistCount: Math.max(0, s.wishlist.length - 1) },
    }));
    void deleteCardFromBackend(id);
  }, []);

  const addToBinder = useCallback(
    (card: PokemonCard) => {
      const withCond: PokemonCard = { condition: "NM" as CardCondition, ...card };
      setState((s) => ({
        ...s,
        tradeBinder: [...s.tradeBinder, withCond],
        stats: { ...s.stats, binderCount: s.tradeBinder.length + 1 },
      }));
      persistCard(withCond, "binder");
      addActivity(`Added ${card.name} to Trade Binder`, "binder");
    },
    [addActivity, persistCard]
  );

  const removeFromBinder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      tradeBinder: s.tradeBinder.filter((c) => c.id !== id),
      stats: { ...s.stats, binderCount: Math.max(0, s.tradeBinder.length - 1) },
    }));
    void deleteCardFromBackend(id);
  }, []);

  const addCardFromCamera = useCallback(
    (name: string, photoUrl: string, list: CardListType) => {
      const card = createCard(name, photoUrl);
      if (list === "wishlist") addToWishlist(card);
      else addToBinder(card);
    },
    [addToWishlist, addToBinder]
  );

  const addIdentifiedCard = useCallback(
    (apiCard: ApiCard, list: CardListType, photoUrl?: string) => {
      const card = createCardFromApi(apiCard, photoUrl);
      if (list === "wishlist") addToWishlist(card);
      else addToBinder(card);
    },
    [addToWishlist, addToBinder]
  );

  const updateCardName = useCallback((id: string, name: string, list: CardListType) => {
    const update = (cards: PokemonCard[]) =>
      cards.map((c) =>
        c.id === id ? { ...c, name, imageGradient: gradientForName(name) } : c
      );
    setState((s) => {
      const nextList = list === "wishlist" ? update(s.wishlist) : update(s.tradeBinder);
      const card = nextList.find((c) => c.id === id);
      if (card) persistCard(card, list);
      return {
        ...s,
        wishlist: list === "wishlist" ? nextList : s.wishlist,
        tradeBinder: list === "binder" ? nextList : s.tradeBinder,
      };
    });
  }, [persistCard]);

  const updateCard = useCallback(
    (id: string, patch: CardEditPatch, list: CardListType) => {
      const update = (cards: PokemonCard[]) =>
        cards.map((c) =>
          c.id === id
            ? {
                ...c,
                name: patch.name,
                condition: patch.condition,
                note: patch.note,
                imageGradient: gradientForName(patch.name),
              }
            : c
        );
      setState((s) => {
        const nextList = list === "wishlist" ? update(s.wishlist) : update(s.tradeBinder);
        const card = nextList.find((c) => c.id === id);
        if (card) persistCard(card, list);
        return {
          ...s,
          wishlist: list === "wishlist" ? nextList : s.wishlist,
          tradeBinder: list === "binder" ? nextList : s.tradeBinder,
        };
      });
    },
    [persistCard]
  );

  const completeTrade = useCallback(
    (wishlistCardId: string, binderCardId: string) => {
      setState((s) => ({
        ...s,
        wishlist: s.wishlist.filter((c) => c.id !== wishlistCardId),
        tradeBinder: s.tradeBinder.filter((c) => c.id !== binderCardId),
        stats: {
          ...s.stats,
          cardsTraded: s.stats.cardsTraded + 2,
          successfulTrades: s.stats.successfulTrades + 1,
          wishlistCount: Math.max(0, s.wishlist.length - 1),
          binderCount: Math.max(0, s.tradeBinder.length - 1),
        },
      }));
      void deleteCardFromBackend(wishlistCardId);
      void deleteCardFromBackend(binderCardId);
      addActivity("Completed a trade", "trade");
    },
    [addActivity]
  );

  const attendEvent = useCallback(
    (eventId: string, eventTitle: string) => {
      setAttendance((a) => ({ ...a, [eventId]: "going" }));
      addActivity(`RSVP — attending ${eventTitle}`, "event");
      const uid = userIdRef.current;
      if (uid) void upsertRsvp(uid, eventId, "going");
      try {
        const raw = sessionStorage.getItem("tradechu.attendedThisSession");
        const ids: string[] = raw ? JSON.parse(raw) : [];
        sessionStorage.setItem(
          "tradechu.attendedThisSession",
          JSON.stringify([...ids, eventId])
        );
      } catch {
        // Non-fatal.
      }
    },
    [addActivity]
  );

  const cancelAttendance = useCallback((eventId: string) => {
    setAttendance((a) => {
      const next = { ...a };
      delete next[eventId];
      return next;
    });
    const uid = userIdRef.current;
    if (uid) void deleteRsvp(uid, eventId);
  }, []);

  const confirmAttendance = useCallback(
    (eventId: string) => {
      setAttendance((a) => ({ ...a, [eventId]: "confirmed" }));
      addActivity("Checked in at an event — finding traders", "event");
      const uid = userIdRef.current;
      if (uid) void upsertRsvp(uid, eventId, "confirmed");
    },
    [addActivity]
  );

  const setDarkMode = useCallback((v: boolean) => {
    setState((s) => ({ ...s, darkMode: v }));
  }, []);

  const setQuietHours = useCallback((v: boolean) => {
    setState((s) => ({ ...s, quietHours: v }));
    try {
      localStorage.setItem(QUIET_KEY, v ? "1" : "0");
    } catch {
      // ignore
    }
  }, []);

  const clearWishlist = useCallback(() => {
    setState((s) => {
      s.wishlist.forEach((c) => void deleteCardFromBackend(c.id));
      return { ...s, wishlist: [], stats: { ...s.stats, wishlistCount: 0 } };
    });
  }, []);

  const clearBinder = useCallback(() => {
    setState((s) => {
      s.tradeBinder.forEach((c) => void deleteCardFromBackend(c.id));
      return { ...s, tradeBinder: [], stats: { ...s.stats, binderCount: 0 } };
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        addToWishlist,
        removeFromWishlist,
        addToBinder,
        removeFromBinder,
        addCardFromCamera,
        addIdentifiedCard,
        updateCardName,
        updateCard,
        completeTrade,
        addActivity,
        attendance,
        attendEvent,
        cancelAttendance,
        confirmAttendance,
        setDarkMode,
        setQuietHours,
        clearWishlist,
        clearBinder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
