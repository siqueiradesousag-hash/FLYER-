import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useAppConfig } from "@/contexts/AppConfigContext";

export default function LoginPage() {
  const { login, register } = useAuth();
  const { config } = useAppConfig();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setLocation("/");
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/invalid-credential": "Email ou senha inválidos",
        "auth/email-already-in-use": "Email já cadastrado",
        "auth/weak-password": "Senha muito fraca (mín. 6 caracteres)",
        "auth/user-not-found": "Usuário não encontrado",
        "auth/wrong-password": "Senha incorreta",
      };
      setError(msg[err.code] || "Erro ao autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img
            src={config.logoUrl}
            alt="Money Storm BR"
            className="w-20 h-20 rounded-xl mb-3 object-contain"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <h1 className="text-[#FFD700] text-2xl font-bold tracking-wide">MONEY STORM BR</h1>
          <p className="text-gray-400 text-sm mt-1">Ganhe assistindo • Receba via Pix</p>
        </div>

        <div className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-[#2a2a2a]">
          <div className="flex">
            <button
              onClick={() => setTab("login")}
              data-testid="tab-login"
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === "login"
                  ? "bg-[#FFD700] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => setTab("register")}
              data-testid="tab-register"
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                tab === "register"
                  ? "bg-[#FFD700] text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {tab === "register" && (
              <div className="bg-[#FFD700]/10 border border-[#FFD700]/30 rounded-xl px-4 py-3">
                <p className="text-[#FFD700] text-sm font-medium">
                  Ganhe R$ {config.bonusCadastro.toFixed(2)} de bônus ao se cadastrar!
                </p>
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-xs mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
                required
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD700] transition-colors"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                required
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD700] transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="button-submit"
              className="w-full bg-[#FFD700] text-black font-bold py-3 rounded-xl text-sm hover:bg-[#e6c200] transition-colors disabled:opacity-50"
            >
              {loading ? "Aguarde..." : tab === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
