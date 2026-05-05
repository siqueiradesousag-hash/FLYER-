import React, { useState } from 'react';
import { useAdReward } from "@/hooks/useAdReward";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { Capacitor, registerPlugin } from "@capacitor/core";

// ─── PLUGIN CAPACITOR (ATIVO NO ANDROID NATIVO) ───────────────────────────────────
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

// ─── TIPAGEM DO SDK WEB (FALLBACK NO NAVEGADOR) ──────────────────────────────────
declare global {
  interface Window {
    UnityAds?: {
      initialize(gameId: string, testMode: boolean, listener?: any): void;
      load(placementId: string, listener?: any): void;
      show(placementId: string, listener?: any): void;
      isReady(placementId: string): boolean;
    };
    _unityAdsReady?: boolean;
  }
}

export default function WatchButton() {
  const { adState, cooldownRemaining, timerRemaining, watchAd, completeWatch } = useAdReward();
  const { config } = useAppConfig();
  const [loadingAd, setLoadingAd] = useState(false);

  if (!config?.buttonActive) return null;

  const isWatching = adState === "watching";
  const canClose   = adState === "can_close";
  const isCooldown = adState === "cooldown";
  const isIdle     = adState === "idle";

  // Configurações do SDK da Unity
  const IS_NATIVE = Capacitor.isNativePlatform();
  const UNITY_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/@unityad/unity-ads@4.0.0/dist/unity-ads.js";

  /**
   * Inicializa e carrega a Unity Ads dinamicamente
   */
  const executeUnityAd = (
    gameId: string,
    placementId: string,
    onSuccess: () => void,
    onFailure: () => void
  ) => {
    if (IS_NATIVE) {
      // FLUXO NATIVO (ANDROID - CAPACITOR)
      console.log("[Unity] Modo nativo detectado. Inicializando...");
      NativeUnityAds.addListener("onInitialized", (data) => {
        if (data.initialized) {
          console.log("[Unity] Native SDK Pronto. Carregando anúncio...");
          NativeUnityAds.loadAd({ placementId })
            .then((res) => {
              if (res.loaded) {
                NativeUnityAds.showAd({ placementId })
                  .then(() => onSuccess())
                  .catch((err) => {
                    console.error("[Unity] Erro ao exibir ad nativo:", err);
                    onFailure();
                  });
              } else {
                onFailure();
              }
            })
            .catch(() => onFailure());
        } else {
          onFailure();
        }
      });

      NativeUnityAds.initialize({ gameId, testMode: false }).catch(() => onFailure());
    } else {
      // FLUXO WEB (FALLBACK DO NAVEGADOR)
      console.log("[Unity] Modo Web detectado. Carregando script do SDK...");

      const startWebAd = () => {
        if (!window.UnityAds) {
          onFailure();
          return;
        }

        window.UnityAds.initialize(gameId, false, {
          onInitializationComplete: () => {
            console.log("[Unity] Web SDK inicializado com sucesso.");
            window.UnityAds?.load(placementId, {
              onUnityAdsAdLoaded: () => {
                window.UnityAds?.show(placementId, {
                  onUnityAdsShowStart: () => onSuccess(),
                  onUnityAdsShowFailure: () => onFailure()
                });
              },
              onUnityAdsFailedToLoad: () => onFailure()
            });
          },
          onInitializationFailed: () => onFailure()
        });
      };

      if (window.UnityAds) {
        startWebAd();
      } else {
        const script = document.createElement("script");
        script.src = UNITY_SCRIPT_URL;
        script.async = true;
        script.onload = startWebAd;
        script.onerror = onFailure;
        document.head.appendChild(script);
      }
    }
  };

  /**
   * Abre o link de fallback configurado no painel administrativo
   */
  const openFallbackLink = () => {
    const targetLink = config?.adLink || "";
    if (targetLink && targetLink.startsWith("http")) {
      window.open(targetLink, "_blank");
    }
  };

  /**
   * Disparo Inteligente de Anúncios
   */
  const handleStartAd = () => {
    const adType = config?.adType || "unity"; // "unity", "link" ou "ambos"
    const gameId = config?.unityGameId || "6099759";
    const placementId = config?.unityPlacementId || "Rewarded_Android";

    setLoadingAd(true);

    // Se configurado apenas para link, vai direto sem carregar a Unity
    if (adType === "link") {
      setLoadingAd(false);
      watchAd();
      openFallbackLink();
      return;
    }

    // Tenta disparar a Unity Ads de forma certeira
    executeUnityAd(
      gameId,
      placementId,
      // Sucesso: Abre o cronômetro do app
      () => {
        setLoadingAd(false);
        watchAd();
        if (adType === "ambos") {
          openFallbackLink();
        }
      },
      // Falha/Não carregou: Dispara o plano B (Fallback de segurança com o link)
      () => {
        console.warn("[Unity] SDK não respondeu a tempo. Aplicando fallback de segurança.");
        setLoadingAd(false);
        watchAd();
        openFallbackLink();
      }
    );
  };

  return (
    <div className="w-full flex justify-center">
      {/* TELA DE CRONÔMETRO (MODAL) */}
      {(isWatching || canClose) && (
        <div className="fixed inset-0 z-[9999999] flex flex-col items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="relative w-full max-w-[340px] bg-[#1e1e1e] rounded-[40px] p-8 border border-[#FFD700]/20 shadow-[0_0_50px_rgba(0,0,0,1)] text-center">

            <div className="mb-6 relative inline-block">
              <div className="w-24 h-24 rounded-full border-4 border-[#2a2a2a] flex items-center justify-center">
                <span className="text-[#FFD700] text-4xl font-black font-mono">
                  {canClose ? "✓" : timerRemaining}
                </span>
              </div>
              {!canClose && (
                <div className="absolute inset-0 border-4 border-t-[#FFD700] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
              )}
            </div>

            <h2 className="text-white font-black text-xl mb-2">
              {canClose ? "MISSÃO CONCLUÍDA!" : "VALIDANDO ANÚNCIO..."}
            </h2>

            <p className="text-gray-400 text-sm mb-8">
              {canClose 
                ? "Seu bônus já está disponível para coleta." 
                : "Aguarde o tempo terminar sem fechar o app para garantir seus ganhos."}
            </p>

            {!canClose && (
              <div className="h-2 w-full bg-[#2a2a2a] rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-[#FFD700] transition-all duration-1000 ease-linear shadow-[0_0_10px_#FFD700]"
                  style={{ width: `${((config.adTimer - timerRemaining) / config.adTimer) * 100}%` }}
                />
              </div>
            )}

            {canClose && (
              <button 
                onClick={completeWatch}
                className="w-full bg-[#22C55E] text-white font-black py-5 rounded-2xl shadow-[0_10px_20px_rgba(34,197,94,0.3)] animate-bounce"
              >
                RECEBER RECOMPENSA
              </button>
            )}
          </div>
        </div>
      )}

      {/* BOTÃO DA HOME PAGE */}
      <div className="relative my-6">
        <button 
          onClick={handleStartAd} 
          disabled={!isIdle || loadingAd}
          className={`transition-all active:scale-90 ${( !isIdle || loadingAd ) && "opacity-40 grayscale"}`}
        >
          <img 
            src={config.buttonImageUrl} 
            alt="Botão Assistir" 
            className="w-72 h-auto rounded-[35px] shadow-2xl" 
          />

          {loadingAd && (
            <div className="absolute inset-0 bg-black/70 rounded-[30px] flex flex-col items-center justify-center border-2 border-[#FFD700]/10">
              <div className="w-10 h-10 border-4 border-t-[#FFD700] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-2" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">Carregando Vídeo...</span>
            </div>
          )}

          {isCooldown && !loadingAd && (
            <div className="absolute inset-0 bg-black/80 rounded-[30px] flex flex-col items-center justify-center border-2 border-[#FFD700]/10">
              <span className="text-gray-500 text-[10px] font-bold uppercase mb-1">Próximo vídeo em</span>
              <span className="text-[#FFD700] text-5xl font-black font-mono">{cooldownRemaining}s</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}