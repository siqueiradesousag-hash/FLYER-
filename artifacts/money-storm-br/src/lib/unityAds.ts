/**
 * Unity Ads Integration Layer
 *
 * - On Android (Capacitor native): calls UnityAdsPlugin via Capacitor bridge
 *   → SDK native 4.x, gameId 6099759, placement "Rewarded_Android"
 * - On Web (PWA/browser): attempts web SDK fallback, gracefully degrades
 */

import { Capacitor, registerPlugin } from "@capacitor/core";

// ─── Capacitor plugin interface ───────────────────────────────────────────────

interface UnityAdsPluginInterface {
  initialize(options: { gameId: string; testMode: boolean }): Promise<void>;
  loadAd(options: { placementId: string }): Promise<{ loaded: boolean; placementId: string }>;
  showAd(options: { placementId: string }): Promise<{ placementId: string; state: string }>;
  isReady(): Promise<{ ready: boolean }>;
  addListener(
    eventName: "onInitialized",
    listener: (data: { initialized: boolean; error?: string }) => void
  ): Promise<{ remove: () => void }>;
}

const NativeUnityAds = registerPlugin<UnityAdsPluginInterface>("UnityAdsPlugin");

// ─── Web SDK types (browser fallback) ────────────────────────────────────────

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

// ─── Internal state ───────────────────────────────────────────────────────────

const TAG = "[UnityAds]";
const IS_NATIVE = Capacitor.isNativePlatform();

let _initPromise: Promise<boolean> | null = null;
let _sdkReady = false;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialize Unity Ads. Safe to call multiple times.
 * On native: delegates to the Java plugin.
 * On web:    loads the JS SDK (graceful fallback if unavailable).
 */
export function initUnityAds(gameId: string, testMode: boolean): Promise<boolean> {
  if (_initPromise) return _initPromise;

  if (IS_NATIVE) {
    console.log(`${TAG} Native mode — delegating initialize to Java plugin`);
    _initPromise = _initNative(gameId, testMode);
  } else {
    console.log(`${TAG} Web mode — attempting JS SDK`);
    _initPromise = _initWeb(gameId, testMode);
  }

  return _initPromise;
}

/**
 * Load an ad. Resolves true when ready to show.
 */
export async function loadUnityAd(placementId: string): Promise<boolean> {
  if (!_sdkReady) {
    console.warn(`${TAG} loadUnityAd() called before SDK is ready`);
    return false;
  }

  if (IS_NATIVE) {
    try {
      const result = await NativeUnityAds.loadAd({ placementId });
      console.log(`${TAG} loadAd result:`, result);
      return result.loaded ?? false;
    } catch (e) {
      console.warn(`${TAG} loadAd failed:`, e);
      return false;
    }
  } else {
    return _loadWeb(placementId);
  }
}

/**
 * Show a loaded ad.
 */
export async function showUnityAd(
  placementId: string,
  onStart: () => void,
  onFinish: (result: string) => void,
  onError: (msg: string) => void
): Promise<void> {
  if (!_sdkReady) {
    onError("sdk_not_ready");
    return;
  }

  if (IS_NATIVE) {
    onStart(); // UI overlay is already up — signal start immediately
    try {
      const result = await NativeUnityAds.showAd({ placementId });
      console.log(`${TAG} showAd result:`, result);
      onFinish(result.state ?? "COMPLETED");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.warn(`${TAG} showAd failed:`, msg);
      onError(msg);
    }
  } else {
    _showWeb(placementId, onStart, onFinish, onError);
  }
}

/** True only when SDK has fully initialized */
export function isUnityAdsSdkReady(): boolean {
  return _sdkReady;
}

/** Check if a specific placement is loaded and ready (web only) */
export function isPlacementReady(placementId: string): boolean {
  if (!_sdkReady) return false;
  if (IS_NATIVE) return true; // Native tracks this internally
  try {
    return window.UnityAds?.isReady(placementId) ?? false;
  } catch {
    return false;
  }
}

// ─── Native helpers ───────────────────────────────────────────────────────────

async function _initNative(gameId: string, testMode: boolean): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      // Listen for init result before calling initialize
      const listener = await NativeUnityAds.addListener(
        "onInitialized",
        (data) => {
          listener.remove();
          if (data.initialized) {
            console.log(`${TAG} ✅ Native SDK initialized`);
            _sdkReady = true;
            resolve(true);
          } else {
            console.warn(`${TAG} ❌ Native SDK init failed:`, data.error);
            resolve(false);
          }
        }
      );

      await NativeUnityAds.initialize({ gameId, testMode });
    } catch (e) {
      console.warn(`${TAG} Native initialize threw:`, e);
      resolve(false);
    }
  });
}

// ─── Web fallback helpers ─────────────────────────────────────────────────────

const UNITY_SCRIPT_URL = "https://ads-sdk.unityads.unity3d.com/webview/unity_ads.js";
const INIT_TIMEOUT_MS = 6000;

function _initWeb(gameId: string, testMode: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    const done = (ok: boolean, reason?: string) => {
      if (!ok) console.warn(`${TAG} SDK unavailable: ${reason}. Fallback to direct link.`);
      resolve(ok);
    };

    if (window.UnityAds) {
      _callWebInit(gameId, testMode, done);
      return;
    }

    const script = document.createElement("script");
    script.src = UNITY_SCRIPT_URL;
    script.async = true;

    const timer = setTimeout(() => done(false, "script timeout"), INIT_TIMEOUT_MS);

    script.onload = () => {
      clearTimeout(timer);
      if (!window.UnityAds) { done(false, "window.UnityAds missing after load"); return; }
      _callWebInit(gameId, testMode, done);
    };
    script.onerror = () => { clearTimeout(timer); done(false, "script element error (network / CORS)"); };

    document.head.appendChild(script);
  });
}

function _callWebInit(gameId: string, testMode: boolean, resolve: (ok: boolean) => void) {
  try {
    window.UnityAds!.initialize(gameId, testMode, {
      onInitializationComplete: () => {
        console.log(`${TAG} ✅ Web SDK initialized`);
        _sdkReady = true;
        window._unityAdsReady = true;
        resolve(true);
      },
      onInitializationFailed: (err, msg) => {
        console.warn(`${TAG} ❌ Web SDK init failed: ${err} — ${msg}`);
        resolve(false);
      },
    });
  } catch (e) {
    console.error(`${TAG} Exception during web initialize:`, e);
    resolve(false);
  }
}

function _loadWeb(placementId: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!window.UnityAds) { resolve(false); return; }
    try {
      if (window.UnityAds.isReady(placementId)) { resolve(true); return; }
    } catch { /* ignore */ }

    const timer = setTimeout(() => { console.warn(`${TAG} Load timeout`); resolve(false); }, 8000);

    window.UnityAds.load(placementId, {
      onUnityAdsAdLoaded: (pid) => { clearTimeout(timer); console.log(`${TAG} ✅ Web ad loaded: "${pid}"`); resolve(true); },
      onUnityAdsFailedToLoad: (pid, err, msg) => { clearTimeout(timer); console.warn(`${TAG} ❌ Web load failed: "${pid}" — ${err}: ${msg}`); resolve(false); },
    });
  });
}

function _showWeb(
  placementId: string,
  onStart: () => void,
  onFinish: (r: string) => void,
  onError: (m: string) => void
) {
  if (!window.UnityAds) { onError("sdk_not_ready"); return; }
  window.UnityAds.show(placementId, {
    onUnityAdsShowStart: (pid) => { console.log(`${TAG} ▶ Web ad started: "${pid}"`); onStart(); },
    onUnityAdsShowComplete: (pid, result) => { console.log(`${TAG} ✅ Web ad done: "${pid}" — ${result}`); onFinish(result); },
    onUnityAdsShowFailure: (pid, err, msg) => { console.warn(`${TAG} ❌ Web ad failed: "${pid}" — ${err}: ${msg}`); onError(msg); },
    onUnityAdsShowClick: (pid) => { console.log(`${TAG} 👆 Web ad clicked: "${pid}"`); },
  });
}
