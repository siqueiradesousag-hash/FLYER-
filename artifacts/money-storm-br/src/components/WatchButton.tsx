import { useAdReward } from "@/hooks/useAdReward";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { formatCurrency } from "@/lib/utils";

export default function WatchButton() {
  const { adState, cooldownRemaining, timerRemaining, watchAd, completeWatch } = useAdReward();
  const { config } = useAppConfig();

  if (!config.buttonActive) return null;

  const isIdle     = adState === "idle";
  const isWatching = adState === "watching";
  const canClose   = adState === "can_close";
  const isCooldown = adState === "cooldown";

  const totalTime  = config.adTimer || 15;
  const pct        = isWatching ? ((totalTime - timerRemaining) / totalTime) * 100 : 100;

  return (
    <>
      {/* ── Overlay no estilo da imagem de referência ─────────────────────── */}
      {(isWatching || canClose) && (
        <div
          style={{ position: "fixed", zIndex: 999999, top: 0, left: 0, width: "100vw", height: "100vh" }}
          className="pointer-events-auto flex flex-col"
        >
          {/* Fundo semitransparente — anúncio aparece por baixo */}
          <div className="absolute inset-0 bg-black/60" />

          {/* ── BARRA SUPERIOR ─────────────────────────────────────────────── */}
          <div className="relative z-10">
            {/* Linha de texto + badge */}
            <div className="flex items-center justify-between bg-black/80 px-4 py-2">
              <span className="text-white text-sm font-semibold">Assistindo anúncio...</span>

              {isWatching ? (
                /* Badge com contagem regressiva */
                <span className="bg-[#1a1a1a] border border-[#3a3a3a] text-white text-sm font-bold px-3 py-1 rounded-full min-w-[48px] text-center">
                  {timerRemaining}s
                </span>
              ) : (
                /* Botão X — aparece APENAS quando o timer chega a 0 */
                <button
                  onClick={completeWatch}
                  data-testid="button-close-ad"
                  className="bg-[#FFD700] text-black font-bold text-base px-4 py-1 rounded-full hover:bg-[#e6c200] active:scale-95 transition-all"
                >
                  ✕ Fechar
                </button>
              )}
            </div>

            {/* Barra de progresso verde */}
            <div className="h-1.5 w-full bg-[#1a1a1a]">
              <div
                className="h-full bg-green-500 transition-all duration-1000"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* ── TEXTO INFERIOR ─────────────────────────────────────────────── */}
          <div className="relative z-10 mt-auto bg-black/80 px-4 py-3 flex items-center justify-between">
            <span className="text-gray-300 text-xs">
              {isWatching
                ? `Aguarde ${timerRemaining}s para fechar`
                : "Clique em Fechar para receber sua recompensa"}
            </span>
            <span className="text-[#FFD700] text-xs font-bold">
              +{formatCurrency(config.recompensaVideo)}
            </span>
          </div>
        </div>
      )}

      {/* ── Botão na Home ────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center my-4">
        <button
          onClick={watchAd}
          disabled={!isIdle}
          data-testid="button-watch-ad"
          className={`relative transition-all duration-300 ${
            isIdle ? "opacity-100 active:scale-95" : "opacity-60 cursor-not-allowed"
          }`}
        >
          <img
            src={config.buttonImageUrl}
            alt="Assistir e Ganhar"
            className="w-72 h-auto max-w-full object-contain"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          {isCooldown && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 rounded-2xl">
              <div className="text-center">
                <p className="text-[#FFD700] text-2xl font-bold">{cooldownRemaining}s</p>
                <p className="text-gray-300 text-xs mt-1">Aguarde para a próxima recompensa</p>
              </div>
            </div>
          )}
        </button>

        {isCooldown && (
          <div className="mt-2 flex items-center gap-2 bg-[#1e1e1e] border border-[#3a3a3a] rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
            <p className="text-gray-400 text-xs">
              Próximo vídeo em <span className="text-[#FFD700] font-bold">{cooldownRemaining}s</span>
            </p>
          </div>
        )}

        {isIdle && (
          <p className="text-gray-500 text-xs mt-1">
            Ganhe <span className="text-[#FFD700]">{formatCurrency(config.recompensaVideo)}</span> por vídeo
          </p>
        )}
      </div>
    </>
  );
}
