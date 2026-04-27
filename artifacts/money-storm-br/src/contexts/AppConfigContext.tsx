import { createContext, useContext, useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

interface AppConfig {
  appName: string;
  logoUrl: string;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  bonusCadastro: number;
  recompensaVideo: number;
  saqueMinimo: number;
  limiteTarefasDia: number;
  adTimer: number;
  cooldown1: number;
  cooldown2: number;
  cooldown3: number;
  buttonActive: boolean;
  buttonImageUrl: string;
  adLink: string;
  unityGameIdAndroid: string;
  unityGameIdIos: string;
  unityTestMode: boolean;
  cpaLink: string;
  monetagZone: string;
  monetagLink: string;
  telegram: string;
  support: string;
  directLinks: { url: string; name: string }[];
}

const defaultConfig: AppConfig = {
  appName: "MONEY STORM BR",
  logoUrl: "https://i.postimg.cc/0QfjxCdj/cee3592e-82fb-4b07-b0a0-dc23d690dc3d.png",
  maintenanceMode: false,
  maintenanceMessage: "Estamos em manutenção. Volte em breve.",
  bonusCadastro: 0.25,
  recompensaVideo: 0.05,
  saqueMinimo: 10,
  limiteTarefasDia: 30,
  adTimer: 15,
  cooldown1: 60,
  cooldown2: 90,
  cooldown3: 120,
  buttonActive: true,
  buttonImageUrl: "https://i.postimg.cc/FzY4qbTM/78baa992-88a6-4418-a099-c1686f6f8016.png",
  adLink: "https://chewsever.com/zdte3fid?key=2147ca451d",
  unityGameIdAndroid: "6099759",
  unityGameIdIos: "6099758",
  unityTestMode: true,
  cpaLink: "",
  monetagZone: "https://chewsever.com/zdte3fid?key=2147ca451d",
  monetagLink: "",
  telegram: "",
  support: "siqueiradesousag@gmail.com",
  directLinks: [],
};

interface AppConfigContextType {
  config: AppConfig;
  loading: boolean;
}

const AppConfigContext = createContext<AppConfigContextType>({
  config: defaultConfig,
  loading: true,
});

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const configRef = ref(db, "config");
    const unsub = onValue(configRef, (snap) => {
      if (snap.exists()) {
        setConfig({ ...defaultConfig, ...snap.val() });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AppConfigContext.Provider value={{ config, loading }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}
