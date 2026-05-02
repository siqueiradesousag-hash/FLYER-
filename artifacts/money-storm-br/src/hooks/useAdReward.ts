import { useState, useRef, useCallback, useEffect } from "react";
import { ref as dbRef, runTransaction, push, serverTimestamp } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";

// ESTE É O EXPORT QUE ESTAVA FALTANDO E CAUSOU O ERRO
export function useAdReward() {
  const { user, refreshUserData } = useAuth();
  const { config } = useAppConfig();
  const [adState, setAdState] = useState<"idle" | "watching" | "can_close" | "cooldown">("idle");
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [timerRemaining, setTimerRemaining] = useState(0);
  const timerRef = useRef<any>(null);

  // Recuperar Cooldown Persistente
  useEffect(() => {
    if (!user?.uid) return;
    const savedEnd = localStorage.getItem(`cd_end_${user.uid}`);
    if (savedEnd) {
      const remaining = Math.floor((Number(savedEnd) - Date.now()) / 1000);
      if (remaining > 0) {
        setAdState("cooldown");
        setCooldownRemaining(remaining);
      }
    }
  }, [user?.uid]);

  // Contador do Cooldown
  useEffect(() => {
    let int: any;
    if (adState === "cooldown" && cooldownRemaining > 0) {
      int = setInterval(() => {
        setCooldownRemaining(p => {
          if (p <= 1) {
            localStorage.removeItem(`cd_end_${user?.uid}`);
            setAdState("idle");
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => clearInterval(int);
  }, [adState, cooldownRemaining, user?.uid]);

  const watchAd = useCallback(() => {
    if (adState !== "idle" || !user) return;
    if (config?.adLink) window.open(config.adLink, "_blank");
    setAdState("watching");
    setTimerRemaining(config?.adTimer || 15);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimerRemaining(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setAdState("can_close");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [adState, user, config]);

  const completeWatch = useCallback(async () => {
    if (adState !== "can_close" || !user?.uid) return;

    try {
      const userPath = `users/${user.uid}`;

      await runTransaction(dbRef(db, userPath), (userData) => {
        if (userData) {
          // Atualiza o saldo financeiro detectado no Firebase
          const reward = Number(config?.recompensaVideo || 0);
          userData.balance = (Number(userData.balance) || 0) + reward;
          userData.totalEarned = (Number(userData.totalEarned) || 0) + reward;

          // ATUALIZAÇÃO DOS CONTADORES (Sincroniza sua tela e a do usuário)
          // Na foto o ADM está em 5 e o Usuário em 4
          userData.tasksToday = (userData.tasksToday || 0) + 1; 
          userData.viewsToday = (userData.viewsToday || 0) + 1;
          userData.vistos = (userData.vistos || 0) + 1;
          userData.tasksTotal = (userData.tasksTotal || 0) + 1;

          userData.lastVideoAt = serverTimestamp();
        }
        return userData;
      });

      await push(dbRef(db, `transactions/${user.uid}`), {
        type: "video",
        amount: config?.recompensaVideo || 0,
        timestamp: Date.now(),
        status: "paid"
      });

      await refreshUserData();

      const options = [config?.cooldown1, config?.cooldown2, config?.cooldown3].filter(Boolean);
      const chosen = Number(options[Math.floor(Math.random() * options.length)]) || 60;

      localStorage.setItem(`cd_end_${user.uid}`, (Date.now() + chosen * 1000).toString());
      setAdState("cooldown");
      setCooldownRemaining(chosen);
    } catch (e) {
      console.error("Erro:", e);
      setAdState("idle");
    }
  }, [adState, user, config, refreshUserData]);

  return { adState, cooldownRemaining, timerRemaining, watchAd, completeWatch };
}