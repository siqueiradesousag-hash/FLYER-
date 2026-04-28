import { useState, useRef, useCallback } from "react";
import { ref as dbRef, runTransaction, push, get, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";

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

  const getCooldownDuration = useCallback(() => {
    const options = [config.cooldown1, config.cooldown2, config.cooldown3];
    return options[Math.floor(Math.random() * options.length)];
  }, [config]);

  const startCooldown = useCallback((duration: number) => {
    setCooldownRemaining(duration);
    setAdState("cooldown");
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current!);
          setAdState("idle");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const creditReward = useCallback(async () => {
    if (!user) return;
    const uid = user.uid;
    const lockRef = dbRef(db, `locks/${uid}/adReward`);
    const now = Date.now();

    const lockSnap = await get(lockRef);
    if (lockSnap.exists()) {
      const lockData = lockSnap.val();
      if (now - lockData.ts < 2000) {
        const fraudRef = dbRef(db, `fraudLogs/${uid}/${now}`);
        await set(fraudRef, { type: "double_credit", ts: now });
        return;
      }
    }
    await set(lockRef, { ts: now });

    const balanceRef = dbRef(db, `users/${uid}/balance`);
    const totalRef = dbRef(db, `users/${uid}/totalEarned`);
    const tasksTodayRef = dbRef(db, `users/${uid}/tasksToday`);
    const tasksTotalRef = dbRef(db, `users/${uid}/tasksTotal`);

    await runTransaction(balanceRef, (current) => {
      const prev = current ?? 0;
      const next = Math.round((prev + config.recompensaVideo) * 100) / 100;
      if (Math.abs(next - prev) > 1) {
        const fraudRef = dbRef(db, `fraudLogs/${uid}/${now}`);
        set(fraudRef, { type: "balance_jump", prev, next, ts: now });
        return;
      }
      return next;
    });

    await runTransaction(totalRef, (current) =>
      Math.round(((current ?? 0) + config.recompensaVideo) * 100) / 100
    );
    await runTransaction(tasksTodayRef, (current) => (current ?? 0) + 1);
    await runTransaction(tasksTotalRef, (current) => (current ?? 0) + 1);

    const txRef = dbRef(db, `transactions/${uid}`);
    await push(txRef, {
      type: "video",
      amount: config.recompensaVideo,
      description: "Assistir vídeo",
      status: "paid",
      timestamp: now,
    });

    await refreshUserData();
  }, [user, config, refreshUserData]);

  const watchAd = useCallback(() => {
    if (!config.buttonActive || adState !== "idle" || !user) return;

    const adUrl = config.adLink || config.monetagZone || "https://example.com";
    const win = window.open(adUrl, "_blank");
    adWindowRef.current = win;
    setAdState("watching");

    const totalTime = config.adTimer > 0 ? config.adTimer : 15;
    setTimerRemaining(totalTime);

    let count = totalTime;
    if (adTimerIntervalRef.current) clearInterval(adTimerIntervalRef.current);
    adTimerIntervalRef.current = setInterval(() => {
      count -= 1;
      setTimerRemaining(count);
      if (count <= 0) {
        clearInterval(adTimerIntervalRef.current!);
        setAdState("can_close");
      }
    }, 1000);
  }, [adState, user, config]);

  const completeWatch = useCallback(async () => {
    if (adState !== "can_close") return;
    // try to close the ad window
    try {
      if (adWindowRef.current && !adWindowRef.current.closed) {
        adWindowRef.current.close();
      }
    } catch { /* cross-origin, ignore */ }
    adWindowRef.current = null;

    await creditReward();
    const cooldown = getCooldownDuration();
    startCooldown(cooldown);
  }, [adState, creditReward, getCooldownDuration, startCooldown]);

  return { adState, cooldownRemaining, timerRemaining, watchAd, completeWatch };
}
