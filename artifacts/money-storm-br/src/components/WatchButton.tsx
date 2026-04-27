import { useAdReward } from "@/hooks/useAdReward";
import { useAppConfig } from "@/contexts/AppConfigContext";

export default function WatchButton() {
  const { adState, cooldownRemaining, watchAd } = useAdReward();
  const { config } = useAppConfig();

  if (!config.buttonActive) return null;

  const isIdle = adState === "idle";
  const isCooldown = adState === "cooldown";
  const isWatching = adState === "watching";

  return (
    <div className="flex flex-col items-center my-4">
      <button
        onClick={watchAd}
        disabled={!isIdle}
        data-testid="button-watch-ad"
        className={`relative transition-all duration-300 ${
          isIdle
            ? "opacity-100 active:scale-95"
            : "opacity-60 cursor-not-allowed"
        }`}
      >
        <img
          src={config.buttonImageUrl}
          alt="Assistir e Ganhar"
          className="w-72 h-auto max-w-full object-contain"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        {isCooldown && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl">
            <div className="text-center">
              <p className="text-[#FFD700] text-lg font-bold">{cooldownRemaining}s</p>
              <p className="text-gray-300 text-xs">Aguarde para assistir</p>
            </div>
          </div>
        )}
        {isWatching && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-2xl">
            <div className="text-center">
              <p className="text-[#FFD700] text-sm font-bold">Assistindo...</p>
              <p className="text-gray-300 text-xs">Conclua para ganhar</p>
            </div>
          </div>
        )}
      </button>

      {isCooldown && (
        <p className="text-gray-400 text-xs mt-2">
          Próximo vídeo em {cooldownRemaining}s
        </p>
      )}
    </div>
  );
}
