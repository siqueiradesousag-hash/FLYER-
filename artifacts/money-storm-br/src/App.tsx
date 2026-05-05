import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppConfigProvider, useAppConfig } from "@/contexts/AppConfigContext";

// Importações das suas páginas existentes
import LoginPage from "@/pages/LoginPage";
import HomePage from "@/pages/HomePage";
import CarteiraPage from "@/pages/CarteiraPage";
import RankingPage from "@/pages/RankingPage";
import PerfilPage from "@/pages/PerfilPage";
import AdminPage from "@/pages/AdminPage";
import CategoryPage from "@/pages/CategoryPage";

const queryClient = new QueryClient();

// --- TELA DE REGISTRO EMBUTIDA ---
function RegisterPage() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref") || "Nenhum";

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-[#FFD700] text-3xl font-bold mb-4">Money Storm BR</h1>
      <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-[#2a2a2a] w-full max-w-sm">
        <p className="text-gray-400 mb-2">Você foi convidado por:</p>
        <p className="text-white font-mono font-bold text-xl mb-6">{ref}</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="w-full bg-green-600 text-white font-bold py-3 rounded-xl"
        >
          CRIAR MINHA CONTA
        </button>
      </div>
    </div>
  );
}

function MaintenancePage() {
  const { config } = useAppConfig();
  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center px-4 text-center">
      <img src={config?.logoUrl} alt="Logo" className="w-20 h-20 rounded-xl mb-4 object-contain" />
      <h1 className="text-[#FFD700] text-xl font-bold mb-2">{config?.appName}</h1>
      <p className="text-gray-400 text-sm">{config?.maintenanceMessage}</p>
    </div>
  );
}

function AppRoutes() {
  const { user, userData, loading } = useAuth();
  const { config, loading: configLoading } = useAppConfig();

  if (loading || configLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Rota de convite liberada para todos */}
      <Route path="/register" component={RegisterPage} />

      {/* Se não estiver logado, manda para Login */}
      {!user ? (
        <Route component={LoginPage} />
      ) : (
        <>
          {userData?.isBanned ? (
            <Route>
              <div className="min-h-screen bg-[#121212] flex items-center justify-center text-red-400">
                Conta suspensa.
              </div>
            </Route>
          ) : config?.maintenanceMode && !userData?.isAdmin ? (
            <Route component={MaintenancePage} />
          ) : (
            <>
              <Route path="/" component={HomePage} />
              <Route path="/carteira" component={CarteiraPage} />
              <Route path="/ranking" component={RankingPage} />
              <Route path="/perfil" component={PerfilPage} />
              <Route path="/admin" component={AdminPage} />
              <Route path="/category/:id" component={CategoryPage} />
            </>
          )}
        </>
      )}
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