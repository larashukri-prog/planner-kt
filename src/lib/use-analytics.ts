import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST =
  (import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined) ??
  "https://us.i.posthog.com";

let initAttempted = false;

/**
 * Initialize PostHog once on the client. Safe no-op if the key is missing
 * or we're running on the server.
 */
export function initAnalytics() {
  if (initAttempted) return;
  initAttempted = true;
  if (typeof window === "undefined") return;
  if (!POSTHOG_KEY) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info(
        "[analytics] VITE_PUBLIC_POSTHOG_KEY not set — analytics disabled.",
      );
    }
    return;
  }
  // Guard against double-init (e.g. HMR).
  // posthog-js sets __loaded after init.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((posthog as any).__loaded) return;
  try {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: true,
      person_profiles: "identified_only",
    });
  } catch (err) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn("[analytics] PostHog init failed", err);
    }
  }
}

function isReady() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof window !== "undefined" && !!(posthog as any).__loaded;
}

/**
 * Fire-and-forget event capture. Never throws, never blocks the caller.
 */
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  queueMicrotask(() => {
    try {
      if (!isReady()) return;
      posthog.capture(event, props);
    } catch {
      // swallow — analytics must never break the app
    }
  });
}

/**
 * Capture an event at most once per browser session.
 */
export function trackOncePerSession(
  event: string,
  props?: Record<string, unknown>,
) {
  if (typeof window === "undefined") return;
  try {
    const key = `__analytics_session:${event}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    // sessionStorage unavailable — fall through and still capture
  }
  track(event, props);
}

/**
 * Hook form for component callers.
 */
export function useAnalytics() {
  return { track, trackOncePerSession };
}
