import { useState, useRef, useCallback, useEffect } from "react";
import { ref as dbRef, runTransaction, push, get, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { loadUnityAd, showUnityAd, isUnityAdsSdkReady } from "@/lib/unityAds";

export type AdState = "idle" | "watching" | "can_close" | "cooldown";

export function useAdReward() {
  const { user, refreshUserData } = useAuth();
  const { config } = useAppConfig();
  const [adState, setAdState] = useState<AdState>("idle");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const adWindowRef = useRef<Window | null>(null);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const adTimerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialized = useRef(false);

  // --- Persistent cooldown: read from Firebase on mount ---
  useEffect(() => {
    if (!user || initialized.current) return;
    initialized.current = true;

    const run = async () => {
      const cooldownRef = dbRef(db, `users/${user.uid}/cooldownEndsAt`);
      const snap = await get(cooldownRef);
      if (snap.exists()) {
        const endsAt = snap.val() as number;
        const remaining = Math.round((endsAt - Date.now()) / 1000);
        if (remaining > 0) {
          startCooldownTimer(remaining);
        }
      }
    };
    run();
  }, [user]); // eslint-disable-line

  const getCooldownDuration = useCallback(() => {
    const options = [config.cooldown1, config.cooldown2, config.cooldown3];
    return options[Math.floor(Math.random() * options.length)];
  }, [config]);

  const startCooldownTimer = useCallback((durationSec: number) => {
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    setCooldownRemaining(durationSec);
    setAdState("cooldown");
    let count = durationSec;
    cooldownIntervalRef.current = setInterval(() => {
      count -= 1;
      setCooldownRemaining(count);
      if (count <= 0) {
        clearInterval(cooldownIntervalRef.current!);
        setAdState("idle");
        setCooldownRemaining(0);
        // clear firebase cooldown
        if (user) {
          set(dbRef(db, `users/${user.uid}/cooldownEndsAt`), 0).catch(() => {});
        }
      }
    }, 1000);
  }, [user]);

  const startCooldown = useCallback(async (duration: number) => {
    if (user) {
      const endsAt = Date.now() + duration * 1000;
      await set(dbRef(db, `users/${user.uid}/cooldownEndsAt`), endsAt);
    }
    startCooldownTimer(duration);
  }, [user, startCooldownTimer]);

  const creditReward = useCallback(async () => {
    if (!user) return;
    const uid = user.uid;
    const lockRef = dbRef(db, `locks/${uid}/adReward`);
    const now = Date.now();

    const lockSnap = await get(lockRef);
    if (lockSnap.exists()) {
      const lockData = lockSnap.val();
      if (now - lockData.ts < 2000) {
        await set(dbRef(db, `fraudLogs/${uid}/${now}`), { type: "double_credit", ts: now });
        return;
      }
    }
    await set(lockRef, { ts: now });

    await runTransaction(dbRef(db, `users/${uid}/balance`), (current) => {
      const prev = current ?? 0;
      const next = Math.round((prev + config.recompensaVideo) * 100) / 100;
      if (Math.abs(next - prev) > 1) {
        set(dbRef(db, `fraudLogs/${uid}/${now}`), { type: "balance_jump", prev, next, ts: now });
        return;
      }
      return next;
    });

    await runTransaction(dbRef(db, `users/${uid}/totalEarned`), (current) =>
      Math.round(((current ?? 0) + config.recompensaVideo) * 100) / 100
    );
    await runTransaction(dbRef(db, `users/${uid}/tasksToday`), (current) => (current ?? 0) + 1);
    await runTransaction(dbRef(db, `users/${uid}/tasksTotal`), (current) => (current ?? 0) + 1);

    await push(dbRef(db, `transactions/${uid}`), {
      type: "video",
      amount: config.recompensaVideo,
      description: "Assistir vídeo",
      status: "paid",
      timestamp: now,
    });

    await refreshUserData();
  }, [user, config, refreshUserData]);

  /** Start the 15s overlay countdown (used by all ad paths) */
  const startOverlayTimer = useCallback((totalTime: number) => {
    setTimerRemaining(totalTime);
    if (adTimerIntervalRef.current) clearInterval(adTimerIntervalRef.current);
    let count = totalTime;
    adTimerIntervalRef.current = setInterval(() => {
      count -= 1;
      setTimerRemaining(count);
      if (count <= 0) {
        clearInterval(adTimerIntervalRef.current!);
        setAdState("can_close");
      }
    }, 1000);
  }, []);

  const watchAd = useCallback(async () => {
    if (!config.buttonActive || adState !== "idle" || !user) return;

    // Activate overlay immediately — blocks UI, shows countdown
    setAdState("watching");
    const totalTime = config.adTimer > 0 ? config.adTimer : 15;
    startOverlayTimer(totalTime);

    const PLACEMENT_ID = "Rewarded_Android";
    const fallbackUrl = config.adLink || config.monetagZone || "https://example.com";

    if (config.unityAdsEnabled && isUnityAdsSdkReady()) {
      console.log("[useAdReward] Unity Ads enabled — loading placement:", PLACEMENT_ID);
      const adLoaded = await loadUnityAd(PLACEMENT_ID);

      if (adLoaded) {
        console.log("[useAdReward] Placement ready — showing Unity ad");
        showUnityAd(
          PLACEMENT_ID,
          () => console.log("[useAdReward] Unity ad display started"),
          (result) => console.log("[useAdReward] Unity ad finished:", result),
          (err) => {
            console.warn("[useAdReward] Unity show error, opening fallback URL:", err);
            adWindowRef.current = window.open(fallbackUrl, "_blank");
          }
        );
      } else {
        console.warn("[useAdReward] Unity placement not ready — opening fallback URL");
        adWindowRef.current = window.open(fallbackUrl, "_blank");
      }
    } else {
      if (config.unityAdsEnabled) {
        console.warn("[useAdReward] Unity enabled but SDK not initialized yet — opening fallback URL");
      } else {
        console.log("[useAdReward] Unity disabled — opening direct link");
      }
      adWindowRef.current = window.open(fallbackUrl, "_blank");
    }
  }, [adState, user, config, startOverlayTimer]);

  const completeWatch = useCallback(async () => {
    if (adState !== "can_close") return;
    try {
      if (adWindowRef.current && !adWindowRef.current.closed) {
        adWindowRef.current.close();
      }
    } catch { /* cross-origin */ }
    adWindowRef.current = null;
    await creditReward();
    const cooldown = getCooldownDuration();
    await startCooldown(cooldown);
  }, [adState, creditReward, getCooldownDuration, startCooldown]);

  return { adState, cooldownRemaining, timerRemaining, watchAd, completeWatch };
}
