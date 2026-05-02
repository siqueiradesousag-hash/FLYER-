import React from 'react';
import { useAdReward } from "@/hooks/useAdReward";
import { useAppConfig } from "@/contexts/AppConfigContext";

export default function WatchButton() {
  const { adState, cooldownRemaining, timerRemaining, watchAd, completeWatch } = useAdReward();
  const { config } = useAppConfig();

  // O link da Monetag que você forneceu
  const monetagLink = "https://omg10.com/4/10828209";

  if (!config?.buttonActive) return null;

  const isWatching = adState === "watching";
  const canClose   = adState === "can_close";
  const isCooldown = adState === "cooldown";
  const isIdle     = adState === "idle";

  return (
    <div className="w-full flex justify-center">
      {/* QUADRADO DO ANÚNCIO (MODAL) */}
      {(isWatching || canClose) && (
        <div className="fixed inset-0 z-[9999999] flex flex-col items-center justify-center p-6 bg-black/95">

          <div className="relative w-full max-w-[340px] bg-[#F2F2F2] rounded-[32px] overflow-hidden shadow-2xl flex flex-col border border-white/10">

            {/* BARRA SUPERIOR */}
            <div className="bg-black px-5 py-4 flex items-center justify-between">
              <span className="text-white font-bold text-[13px]">Carregando Anúncio...</span>
              <div className="bg-[#222] px-3 py-1 rounded-full border border-white/10">
                <span className="text-[#FFD700] font-black text-xs">{timerRemaining}s</span>
              </div>
            </div>

            {/* ÁREA DO ANÚNCIO COM CRONÔMETRO NO CENTRO */}
            <div className="relative w-full aspect-square bg-white">
              <iframe 
                src={monetagLink}
                className="w-full h-full border-none"
                sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"
              />

              {/* CRONÔMETRO CENTRALIZADO NO QUADRADO */}
              {isWatching && (
                <div className="absolute inset-0 bg-black/50 pointer-events-none flex items-center justify-center">
                  <div className="bg-black/70 backdrop-blur-md w-24 h-24 rounded-full border-4 border-[#FFD700] flex items-center justify-center shadow-lg">
                    <span className="text-white text-4xl font-black font-mono">
                      {timerRemaining}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PROGRESSO E STATUS */}
            <div className="bg-white p-5">
               <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-3">
                 <div 
                   className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                   style={{ width: `${((config.adTimer - timerRemaining) / config.adTimer) * 100}%` }}
                 />
               </div>
               <p className="text-gray-400 text-[10px] font-bold text-center uppercase tracking-widest">
                 {canClose ? "PRÊMIO DISPONÍVEL!" : "NÃO FECHE O ANÚNCIO"}
               </p>
            </div>

            {/* BOTÃO DE COLETAR (APARECE APÓS O TEMPO) */}
            {canClose && (
              <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
                <div className="text-[#FFD700] text-6xl mb-4">💰</div>
                <h3 className="text-white font-black text-xl mb-6 text-center tracking-tight">
                  PARABÉNS!<br/>VOCÊ GANHOU
                </h3>
                <button 
                  onClick={completeWatch}
                  className="w-full bg-[#22C55E] text-white font-black py-5 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-bounce"
                >
                  COLETAR AGORA
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTÃO DA HOME QUE ABRE O QUADRADO */}
      <div className="relative my-6">
        <button 
          onClick={watchAd} 
          disabled={!isIdle}
          className={`transition-all active:scale-95 ${!isIdle && "opacity-50 grayscale"}`}
        >
          <img src={config.buttonImageUrl} alt="Botão" className="w-72 h-auto rounded-[30px]" />

          {/* COOLDOWN NO BOTÃO DA HOME */}
          {isCooldown && (
            <div className="absolute inset-0 bg-black/80 rounded-[30px] flex flex-col items-center justify-center border border-[#FFD700]/20">
              <p className="text-white text-[10px] font-bold uppercase mb-1">Aguarde</p>
              <span className="text-[#FFD700] text-4xl font-black">{cooldownRemaining}s</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}