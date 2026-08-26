import { savePushSubscription } from "@/lib/supabase/api";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerTradechuServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!pushSupported()) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (e) {
    console.warn("[push] SW register failed", e);
    return null;
  }
}

/**
 * Ask for notification permission after a meaningful action (RSVP / check-in).
 * Respects quiet hours: still stores the subscription but callers should skip
 * local demo notifications when quietHours is on.
 */
export async function enablePushNotifications(
  userId: string | null,
  quietHours: boolean
): Promise<boolean> {
  if (!pushSupported()) return false;
  if (quietHours) return false;

  const reg = await registerTradechuServiceWorker();
  if (!reg) return false;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return false;

  if (VAPID_PUBLIC) {
    try {
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
      if (userId) await savePushSubscription(userId, sub.toJSON());
    } catch (e) {
      console.warn("[push] subscribe failed", e);
    }
  }

  return true;
}

/** Local/demo notification when a real push server isn't configured. */
export async function notifyLocal(title: string, body: string, url = "/"): Promise<void> {
  if (!pushSupported()) return;
  if (Notification.permission !== "granted") return;
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification(title, {
    body,
    icon: "/favicon.ico",
    data: { url },
    tag: `tradechu-${Date.now()}`,
  });
}

function urlBase64ToUint8Array(base64String: string): BufferSource {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}
