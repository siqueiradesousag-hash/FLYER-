import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppConfigProvider, useAppConfig } from "@/contexts/AppConfigContext";
import { initUnityAds } from "@/lib/unityAds";
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import CarteiraPage from "@/pages/CarteiraPage";
import RankingPage from "@/pages/RankingPage";
import PerfilPage from "@/pages/PerfilPage";
import AdminPage from "@/pages/AdminPage";
import CategoryPage from "@/pages/CategoryPage";

const queryClient = new QueryClient();

function MaintenancePage() {
  const { config } = useAppConfig();
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center px-4 text-center">
      <img src={config.logoUrl} alt="Logo" className="w-20 h-20 rounded-xl mb-4 object-contain" />
      <h1 className="text-[#FFD700] text-xl font-bold mb-2">{config.appName}</h1>
      <p className="text-gray-400 text-sm">{config.maintenanceMessage}</p>
    </div>
  );
}

function AppRoutes() {
  const { user, userData, loading } = useAuth();
  const { config, loading: configLoading } = useAppConfig();

  // ── Unity Ads: initialize once when config is ready ──────────────────────
  useEffect(() => {
    if (configLoading) return;
    const gameId = config.unityGameIdAndroid || "6099759";
    const testMode = config.unityTestMode ?? false;
    // Always pre-initialize so the SDK is ready when the user clicks
    initUnityAds(gameId, testMode);
  }, [configLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || configLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  if (userData?.isBanned) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-red-400 text-xl font-bold mb-2">Conta suspensa</p>
        <p className="text-gray-400 text-sm">Entre em contato com o suporte.</p>
      </div>
    );
  }

  if (config.maintenanceMode && !userData?.isAdmin) {
    return <MaintenancePage />;
  }

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/carteira" component={CarteiraPage} />
      <Route path="/ranking" component={RankingPage} />
      <Route path="/perfil" component={PerfilPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/category/:id" component={CategoryPage} />
      <Route>
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
          <p className="text-gray-400">Página não encontrada</p>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppConfigProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
        </AuthProvider>
      </AppConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
