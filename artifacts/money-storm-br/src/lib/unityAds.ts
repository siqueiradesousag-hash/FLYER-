/**
 * Unity Ads Web Integration Layer
 * Wraps the Unity Ads JavaScript SDK with fallback support for PWA environments.
 * The SDK is loaded dynamically from Unity's CDN at runtime.
 */

// ─── Type Declarations ────────────────────────────────────────────────────────

interface UnityInitListener {
  onInitializationComplete?: () => void;
  onInitializationFailed?: (error: string, message: string) => void;
}

interface UnityLoadListener {
  onUnityAdsAdLoaded?: (placementId: string) => void;
  onUnityAdsFailedToLoad?: (placementId: string, error: string, message: string) => void;
}

interface UnityShowListener {
  onUnityAdsShowStart?: (placementId: string) => void;
  onUnityAdsShowComplete?: (placementId: string, result: "COMPLETED" | "SKIPPED" | "ERROR") => void;
  onUnityAdsShowFailure?: (placementId: string, error: string, message: string) => void;
  onUnityAdsShowClick?: (placementId: string) => void;
}

declare global {
  interface Window {
    UnityAds?: {
      initialize(gameId: string, testMode: boolean, listener?: UnityInitListener): void;
      load(placementId: string, listener?: UnityLoadListener): void;
      show(placementId: string, listener?: UnityShowListener): void;
      isReady(placementId: string): boolean;
    };
    _unityAdsReady?: boolean;
  }
}

// ─── Internal State ───────────────────────────────────────────────────────────

let _initPromise: Promise<boolean> | null = null;
let _sdkReady = false;
const UNITY_SCRIPT_URL = "https://ads-sdk.unityads.unity3d.com/webview/unity_ads.js";
const INIT_TIMEOUT_MS = 6000;
const TAG = "[UnityAds]";

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialize Unity Ads. Safe to call multiple times — returns cached promise.
 */
export function initUnityAds(gameId: string, testMode: boolean): Promise<boolean> {
  if (_initPromise) {
    console.log(`${TAG} Already initializing / initialized.`);
    return _initPromise;
  }

  _initPromise = new Promise((resolve) => {
    console.log(`${TAG} Loading SDK... gameId=${gameId} testMode=${testMode}`);

    const done = (success: boolean, reason?: string) => {
      if (!success) {
        console.warn(`${TAG} SDK unavailable: ${reason ?? "unknown"}. Fallback to direct link.`);
      }
      resolve(success);
    };

    // Check if already in DOM (e.g. hot-reload)
    if (window.UnityAds) {
      console.log(`${TAG} SDK already present in window. Initializing...`);
      callInitialize(gameId, testMode, done);
      return;
    }

    const script = document.createElement("script");
    script.src = UNITY_SCRIPT_URL;
    script.async = true;

    const timer = setTimeout(() => done(false, "script load timeout"), INIT_TIMEOUT_MS);

    script.onload = () => {
      clearTimeout(timer);
      if (!window.UnityAds) {
        done(false, "window.UnityAds not found after script load");
        return;
      }
      callInitialize(gameId, testMode, done);
    };

    script.onerror = () => {
      clearTimeout(timer);
      done(false, "script element error (network / CORS)");
    };

    document.head.appendChild(script);
  });

  return _initPromise;
}

function callInitialize(gameId: string, testMode: boolean, resolve: (ok: boolean) => void) {
  try {
    window.UnityAds!.initialize(gameId, testMode, {
      onInitializationComplete: () => {
        console.log(`${TAG} ✅ Initialization complete`);
        _sdkReady = true;
        window._unityAdsReady = true;
        resolve(true);
      },
      onInitializationFailed: (error, message) => {
        console.warn(`${TAG} ❌ Initialization failed: ${error} — ${message}`);
        resolve(false);
      },
    });
  } catch (e) {
    console.error(`${TAG} Exception during initialize:`, e);
    resolve(false);
  }
}

/**
 * Load an ad for the given placementId. Resolves true when ready.
 */
export function loadUnityAd(placementId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!window.UnityAds || !_sdkReady) {
      console.warn(`${TAG} load() called but SDK not ready — skipping`);
      resolve(false);
      return;
    }

    // If already loaded/ready, skip re-loading
    try {
      if (window.UnityAds.isReady(placementId)) {
        console.log(`${TAG} Placement "${placementId}" already ready ✅`);
        resolve(true);
        return;
      }
    } catch { /* isReady may throw */ }

    console.log(`${TAG} Loading placement: "${placementId}"`);
    const timer = setTimeout(() => {
      console.warn(`${TAG} Load timeout for "${placementId}"`);
      resolve(false);
    }, 8000);

    window.UnityAds.load(placementId, {
      onUnityAdsAdLoaded: (pid) => {
        clearTimeout(timer);
        console.log(`${TAG} ✅ Ad loaded: "${pid}"`);
        resolve(true);
      },
      onUnityAdsFailedToLoad: (pid, error, message) => {
        clearTimeout(timer);
        console.warn(`${TAG} ❌ Failed to load "${pid}": ${error} — ${message}`);
        resolve(false);
      },
    });
  });
}

/**
 * Show an ad. Calls onStart when display begins, onFinish(result) when done, onError on failure.
 */
export function showUnityAd(
  placementId: string,
  onStart: () => void,
  onFinish: (result: string) => void,
  onError: (msg: string) => void
): void {
  if (!window.UnityAds || !_sdkReady) {
    console.warn(`${TAG} show() called but SDK not ready`);
    onError("sdk_not_ready");
    return;
  }

  console.log(`${TAG} Showing ad for placement: "${placementId}"`);

  window.UnityAds.show(placementId, {
    onUnityAdsShowStart: (pid) => {
      console.log(`${TAG} ▶ Ad started: "${pid}"`);
      onStart();
    },
    onUnityAdsShowComplete: (pid, result) => {
      console.log(`${TAG} ✅ Ad completed: "${pid}" — result: ${result}`);
      onFinish(result);
    },
    onUnityAdsShowFailure: (pid, error, message) => {
      console.warn(`${TAG} ❌ Ad show failed: "${pid}" — ${error}: ${message}`);
      onError(message);
    },
    onUnityAdsShowClick: (pid) => {
      console.log(`${TAG} 👆 Ad clicked: "${pid}"`);
    },
  });
}

/** Returns true only when SDK is initialized and ready to show ads */
export function isUnityAdsSdkReady(): boolean {
  return _sdkReady && !!window.UnityAds;
}

/** Check if a specific placement is loaded and ready */
export function isPlacementReady(placementId: string): boolean {
  if (!window.UnityAds || !_sdkReady) return false;
  try {
    return window.UnityAds.isReady(placementId);
  } catch {
    return false;
  }
}
