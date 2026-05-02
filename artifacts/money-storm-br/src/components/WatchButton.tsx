import React from 'react';
import { useAdReward } from "@/hooks/useAdReward";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { formatCurrency } from "@/lib/utils";

export default function WatchButton() {
  const { adState, cooldownRemaining, timerRemaining, watchAd, completeWatch } = useAdReward();
  const { config } = useAppConfig();

  if (!config?.buttonActive) return null;

  const isWatching = adState === "watching";
  const canClose   = adState === "can_close";
  const isCooldown = adState === "cooldown";
  const isIdle     = adState === "idle";

  return (
    <div className="w-full flex justify-center">
      {/* MODAL ESTILO BASE 44 */}
      {(isWatching || canClose) && (
        <div className="fixed inset-0 z-[9999999] flex flex-col items-center justify-center p-6 bg-black/90">

          {/* CONTAINER DO QUADRADO */}
          <div className="relative w-full max-w-[340px] bg-[#F2F2F2] rounded-[32px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">

            {/* HEADER PRETO */}
            <div className="bg-black px-5 py-4 flex items-center justify-between">
              <span className="text-white font-bold text-[13px]">Assistindo anúncio...</span>
              <div className="bg-[#222] px-3 py-1 rounded-full border border-white/10 min-w-[45px] text-center">
                <span className="text-white font-black text-sm">{timerRemaining}s</span>
              </div>
            </div>

            {/* ÁREA DO CONTEÚDO (QUADRADO DO ANÚNCIO) */}
            <div className="w-full aspect-square bg-white flex items-center justify-center">
              {/* O anúncio carrega aqui dentro e não abre nova aba */}
              <iframe 
                src={config.adLink}
                className="w-full h-full border-none"
                sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"
              />
            </div>

            {/* BARRA DE PROGRESSO VERDE EMBAIXO */}
            <div className="bg-white p-4">
               <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
                 <div 
                   className="h-full bg-[#22C55E] transition-all duration-1000 ease-linear"
                   style={{ width: `${((config.adTimer - timerRemaining) / config.adTimer) * 100}%` }}
                 />
               </div>
               <p className="text-gray-400 text-[10px] font-bold text-center uppercase tracking-tighter">
                 Aguarde {timerRemaining}s para fechar
               </p>
            </div>

            {/* BOTÃO DE FECHAMENTO (SÓ APARECE NO FINAL) */}
            {canClose && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6">
                <button 
                  onClick={completeWatch}
                  className="w-full bg-[#22C55E] text-white font-black py-4 rounded-2xl shadow-xl animate-bounce"
                >
                  FECHAR E COLETAR PRÊMIO
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTÃO QUE DISPARA O MODAL */}
      <div className="relative my-6">
        <button 
          onClick={watchAd} 
          disabled={!isIdle}
          className={`transition-transform active:scale-90 ${!isIdle && "opacity-50 grayscale"}`}
        >
          <img src={config.buttonImageUrl} alt="Botão" className="w-72 h-auto" />

          {isCooldown && (
            <div className="absolute inset-0 bg-black/80 rounded-[30px] flex items-center justify-center border border-white/10">
              <span className="text-[#FFD700] text-4xl font-black">{cooldownRemaining}s</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}