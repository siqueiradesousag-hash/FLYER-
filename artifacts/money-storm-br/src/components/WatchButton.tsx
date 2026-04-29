import { useAdReward } from "@/hooks/useAdReward";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { formatCurrency } from "@/lib/utils";

export default function WatchButton() {
  const { adState, cooldownRemaining, timerRemaining, watchAd, completeWatch } = useAdReward();
  const { config } = useAppConfig();

  if (!config.buttonActive) return null;

  const isIdle = adState === "idle";
  const isWatching = adState === "watching";
  const canClose = adState === "can_close";
  const isCooldown = adState === "cooldown";

  return (
    <>
      {/* In-app overlay shown while ad is open */}
      {(isWatching || canClose) && (
        <div style={{ zIndex: 99999 }} className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center pointer-events-auto">
          <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-3xl p-8 mx-6 flex flex-col items-center gap-6 max-w-sm w-full">
            {isWatching ? (
              <>
                <div className="w-24 h-24 rounded-full border-4 border-[#FFD700] flex items-center justify-center relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="44" fill="none" stroke="#2a2a2a" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="44"
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 44}`}
                      strokeDashoffset={`${2 * Math.PI * 44 * (1 - timerRemaining / (config.adTimer || 15))}`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                  </svg>
                  <span className="text-[#FFD700] text-3xl font-bold z-10">{timerRemaining}</span>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-lg">Assistindo anúncio...</p>
                  <p className="text-gray-400 text-sm mt-1">Aguarde {timerRemaining}s para receber</p>
                  <p className="text-[#FFD700] font-semibold mt-2">+{formatCurrency(config.recompensaVideo)}</p>
                </div>
                <div className="flex items-center gap-2 bg-[#2a2a2a] rounded-full px-4 py-2">
                  <span className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse" />
                  <p className="text-gray-300 text-xs">Não feche o anúncio agora</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-[#FFD700]/20 border-2 border-[#FFD700] flex items-center justify-center">
                  <span className="text-4xl">🎉</span>
                </div>
                <div className="text-center">
                  <p className="text-[#FFD700] font-bold text-xl">Pronto!</p>
                  <p className="text-white text-sm mt-1">Clique no X para receber sua recompensa</p>
                  <p className="text-[#FFD700] font-bold text-lg mt-2">+{formatCurrency(config.recompensaVideo)}</p>
                </div>
                <button
                  onClick={completeWatch}
                  data-testid="button-close-ad"
                  className="w-16 h-16 rounded-full bg-[#FFD700] text-black font-bold text-2xl flex items-center justify-center hover:bg-[#e6c200] active:scale-95 transition-all shadow-lg shadow-[#FFD700]/30"
                >
                  ✕
                </button>
                <p className="text-gray-500 text-xs">Feche para receber</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Button section */}
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
