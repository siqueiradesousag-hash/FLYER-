import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function LoginPage() {
  const { login, register } = useAuth();
  const { config } = useAppConfig();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showReferral, setShowReferral] = useState(false);
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
        await register(email, password, config.bonusCadastro, referralCode.trim() || undefined);
      }
      setLocation("/");
    } catch (err: any) {
      const msg: Record<string, string> = {
        "auth/invalid-credential": "Email ou senha inválidos",
        "auth/email-already-in-use": "Email já cadastrado",
        "auth/weak-password": "Senha muito fraca (mín. 6 caracteres)",
        "auth/user-not-found": "Usuário não encontrado",
        "auth/wrong-password": "Senha incorreta",
        "auth/invalid-email": "Email inválido",
        "auth/network-request-failed": "Sem conexão. Verifique sua internet.",
      };
      setError(msg[err.code] || "Erro ao autenticar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={config.logoUrl}
            alt="Money Storm BR"
            className="w-24 h-24 rounded-2xl mb-3 object-contain shadow-lg shadow-black/50"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
          <h1 className="text-[#FFD700] text-2xl font-extrabold tracking-wide">MONEY STORM BR</h1>
          <p className="text-gray-400 text-sm mt-1">Ganhe assistindo • Receba via Pix</p>
        </div>

        <div className="bg-[#1e1e1e] rounded-3xl overflow-hidden border border-[#2a2a2a] shadow-xl">
          {/* Tabs */}
          <div className="flex">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              data-testid="tab-login"
              className={`flex-1 py-3.5 text-sm font-bold transition-colors ${
                tab === "login" ? "bg-[#FFD700] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              data-testid="tab-register"
              className={`flex-1 py-3.5 text-sm font-bold transition-colors ${
                tab === "register" ? "bg-[#FFD700] text-black" : "text-gray-400 hover:text-white"
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {tab === "register" && (
              <div className="bg-[#FFD700]/10 border border-[#FFD700]/40 rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <p className="text-[#FFD700] text-sm font-bold">
                    Bônus de R$ {config.bonusCadastro.toFixed(2)} grátis!
                  </p>
                  <p className="text-gray-400 text-xs">Ao criar sua conta agora</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-xs mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
                required
                autoComplete="email"
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD700] transition-colors placeholder-gray-600"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs mb-1.5 font-medium">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
                required
                autoComplete={tab === "login" ? "current-password" : "new-password"}
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD700] transition-colors placeholder-gray-600"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {/* Referral code (register only) */}
            {tab === "register" && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowReferral(!showReferral)}
                  className="flex items-center gap-1 text-gray-400 text-xs hover:text-white transition-colors"
                >
                  {showReferral ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  Tem código de convite?
                </button>
                {showReferral && (
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="Digite o código"
                    maxLength={8}
                    className="mt-2 w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-green-500 transition-colors placeholder-gray-600 tracking-widest uppercase"
                  />
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="button-submit"
              className="w-full bg-[#FFD700] text-black font-bold py-3.5 rounded-xl text-sm hover:bg-[#e6c200] transition-colors disabled:opacity-50 active:scale-95"
            >
              {loading ? "Aguarde..." : tab === "login" ? "Entrar" : "Criar conta grátis"}
            </button>

            {tab === "register" && (
              <p className="text-gray-600 text-[10px] text-center">
                Ao criar conta você concorda com os termos de uso
              </p>
            )}
          </form>
        </div>

        <p className="text-gray-700 text-xs text-center mt-4">
          © 2025 Money Storm BR. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
