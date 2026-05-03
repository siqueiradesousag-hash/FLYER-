import React from 'react';
import { useAdReward } from "@/hooks/useAdReward";
import { useAppConfig } from "@/contexts/AppConfigContext";

export default function WatchButton() {
  const { adState, cooldownRemaining, timerRemaining, watchAd, completeWatch } = useAdReward();
  const { config } = useAppConfig();

  // O seu link da Monetag ou afiliado
  const adLink = "https://omg10.com/4/10828209";

  if (!config?.buttonActive) return null;

  const isWatching = adState === "watching";
  const canClose   = adState === "can_close";
  const isCooldown = adState === "cooldown";
  const isIdle     = adState === "idle";

  const handleStartAd = () => {
    // Abre o anúncio em nova aba para evitar bloqueio de iframe (Shopee/Ali/Monetag)
    window.open(adLink, "_blank");
    // Inicia o cronômetro no seu app
    watchAd();
  };

  return (
    <div className="w-full flex justify-center">
      {/* TELA DE CRONÔMETRO (MODAL) */}
      {(isWatching || canClose) && (
        <div className="fixed inset-0 z-[9999999] flex flex-col items-center justify-center p-6 bg-black/95 backdrop-blur-md">

          <div className="relative w-full max-w-[340px] bg-[#1e1e1e] rounded-[40px] p-8 border border-[#FFD700]/20 shadow-[0_0_50px_rgba(0,0,0,1)] text-center">

            {/* ÍCONE DE STATUS */}
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

            {/* BARRA DE PROGRESSO */}
            {!canClose && (
              <div className="h-2 w-full bg-[#2a2a2a] rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-[#FFD700] transition-all duration-1000 ease-linear shadow-[0_0_10px_#FFD700]"
                  style={{ width: `${((config.adTimer - timerRemaining) / config.adTimer) * 100}%` }}
                />
              </div>
            )}

            {/* BOTÃO DE COLETAR */}
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
          disabled={!isIdle}
          className={`transition-all active:scale-90 ${!isIdle && "opacity-40 grayscale"}`}
        >
          <img 
            src={config.buttonImageUrl} 
            alt="Botão Assistir" 
            className="w-72 h-auto rounded-[35px] shadow-2xl" 
          />

          {isCooldown && (
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