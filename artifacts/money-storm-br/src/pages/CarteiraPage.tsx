import { useEffect, useState } from "react";
import { ref, onValue, push, set as dbSet } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useAppConfig } from "@/contexts/AppConfigContext";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  timestamp: number;
  pixKey?: string;
}

export default function CarteiraPage() {
  const { user, userData, refreshUserData } = useAuth();
  const { config } = useAppConfig();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pixKey, setPixKey] = useState(userData?.pixKey || "");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("success");

  // Busca histórico de transações em tempo real
  useEffect(() => {
    if (!user) return;
    const txRef = ref(db, `transactions/${user.uid}`);
    return onValue(txRef, (snap) => {
      const data = snap.val() ?? {};
      const list = Object.entries(data)
        .map(([id, val]: [string, any]) => ({ id, ...val }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(list);
    });
  }, [user]);

  // Sincroniza a chave PIX quando os dados do usuário carregam
  useEffect(() => {
    if (userData?.pixKey) setPixKey(userData.pixKey);
  }, [userData]);

  const savePixKey = async () => {
    if (!user || !pixKey.trim()) return;
    try {
      const keyRef = ref(db, `users/${user.uid}/pixKey`);
      await dbSet(keyRef, pixKey.trim());
      setMsg("Chave PIX salva!");
      setMsgType("success");
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("Erro ao salvar chave");
      setMsgType("error");
    }
  };

  const requestWithdraw = async () => {
    if (!user || !userData) return;

    // LÓGICA DE SALDO ROBUSTA: Lê balance ou saldo e força ser número
    const amount = parseFloat(withdrawAmount);
    const saldoDisponivel = Number(userData.balance || userData.saldo || 0);
    const minimoSaque = Number(config?.saqueMinimo || 0.25);

    // Validação de valor mínimo
    if (isNaN(amount) || amount < minimoSaque) {
      setMsg(`Valor mínimo de saque: ${formatCurrency(minimoSaque)}`);
      setMsgType("error");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    // Validação de saldo (com arredondamento para evitar bugs de centavos do JS)
    if (amount > (Math.round(saldoDisponivel * 100) / 100)) {
      setMsg("Saldo insuficiente");
      setMsgType("error");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    if (!pixKey.trim()) {
      setMsg("Cadastre sua chave PIX primeiro");
      setMsgType("error");
      setTimeout(() => setMsg(""), 3000);
      return;
    }

    setLoading(true);
    try {
      const novoSaldo = Math.round((saldoDisponivel - amount) * 100) / 100;
      const novoPendente = Math.round(((userData.pendingBalance || 0) + amount) * 100) / 100;

      // ATUALIZAÇÃO MÚLTIPLA: Garante compatibilidade com as regras do Firebase
      const updates: any = {};
      updates[`users/${user.uid}/balance`] = novoSaldo;
      updates[`users/${user.uid}/saldo`] = novoSaldo; // Para bater com a regra de segurança
      updates[`users/${user.uid}/pendingBalance`] = novoPendente;

      // Executa as atualizações de saldo
      await dbSet(ref(db, `users/${user.uid}/balance`), novoSaldo);
      await dbSet(ref(db, `users/${user.uid}/saldo`), novoSaldo);
      await dbSet(ref(db, `users/${user.uid}/pendingBalance`), novoPendente);

      const wid = `WID${Date.now()}`;

      // Registra a transação no histórico do usuário
      await push(ref(db, `transactions/${user.uid}`), {
        type: "withdraw",
        amount: -amount,
        description: `Saque via PIX (${pixKey})`,
        status: "pending",
        timestamp: Date.now(),
        pixKey,
        wid,
      });

      // Cria a solicitação oficial para o Painel Administrativo
      await dbSet(ref(db, `withdrawals/${user.uid}/${wid}`), {
        uid: user.uid,
        email: userData.email || "Usuário",
        amount: amount,
        pixKey: pixKey,
        status: "pending",
        timestamp: Date.now(),
        wid: wid,
      });

      setMsg("Saque solicitado com sucesso!");
      setMsgType("success");
      setWithdrawAmount("");
      if (refreshUserData) await refreshUserData();
    } catch (error) {
      console.error("Erro ao processar saque:", error);
      setMsg("Erro ao processar saque. Verifique sua conexão.");
      setMsgType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 4000);
    }
  };

  const statusColor: Record<string, string> = {
    paid: "text-green-400",
    pending: "text-yellow-400",
    rejected: "text-red-400",
  };

  const statusLabel: Record<string, string> = {
    paid: "Pago",
    pending: "Pendente",
    rejected: "Recusado",
  };

  return (
    <div className="min-h-screen bg-[#121212] pb-20">
      <TopBar />

      <div className="px-4 py-4 space-y-4">
        {/* Card de Saldo Principal */}
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
          <p className="text-gray-400 text-xs mb-1">Saldo disponível</p>
          <p className="text-[#FFD700] text-3xl font-bold">
            {formatCurrency(Number(userData?.balance || userData?.saldo || 0))}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Mínimo para saque: {formatCurrency(Number(config?.saqueMinimo || 0.25))}
          </p>
        </div>

        {/* Card de Saldo Bloqueado/Pendente */}
        {(userData?.pendingBalance ?? 0) > 0 && (
          <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-yellow-500/30 flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-xs font-semibold">⏳ Saldo em Processamento</p>
              <p className="text-gray-400 text-[10px]">Aguardando pagamento administrativo</p>
            </div>
            <p className="text-yellow-400 text-xl font-bold">
              {formatCurrency(userData!.pendingBalance!)}
            </p>
          </div>
        )}

        {/* Configuração de PIX */}
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
          <h3 className="text-white font-semibold text-sm">Dados de Recebimento</h3>
          <input
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="Chave PIX (CPF, E-mail ou Celular)"
            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD700]"
          />
          <button
            onClick={savePixKey}
            className="w-full bg-[#2a2a2a] border border-[#FFD700]/30 text-[#FFD700] text-sm font-semibold py-2.5 rounded-xl transition-active active:scale-95"
          >
            Salvar Minha Chave PIX
          </button>
        </div>

        {/* Área de Saque */}
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
          <h3 className="text-white font-semibold text-sm">Solicitar Resgate</h3>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Quanto deseja sacar?"
            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD700]"
          />
          <button
            onClick={requestWithdraw}
            disabled={loading}
            className="w-full bg-[#FFD700] text-black font-bold py-3 rounded-xl text-sm disabled:opacity-50 transition-active active:scale-95"
          >
            {loading ? "Processando..." : "Realizar Saque PIX"}
          </button>
        </div>

        {/* Alertas de Feedback */}
        {msg && (
          <div className={`rounded-xl px-4 py-3 border ${msgType === "success" ? "bg-green-900/30 border-green-500/30 text-green-400" : "bg-red-900/30 border-red-500/30 text-red-400"}`}>
            <p className="text-sm font-medium">{msg}</p>
          </div>
        )}

        {/* Histórico Recente */}
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
          <h3 className="text-white font-semibold text-sm mb-3">Últimas Movimentações</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Sem registros de saque ainda.</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
                  <div className="max-w-[70%]">
                    <p className="text-white text-xs font-medium truncate">{tx.description}</p>
                    <p className="text-gray-500 text-[10px]">{formatDate(tx.timestamp)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold ${tx.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {tx.amount >= 0 ? "+" : ""}{formatCurrency(tx.amount)}
                    </p>
                    <p className={`text-[10px] font-semibold ${statusColor[tx.status] || "text-gray-400"}`}>
                      {statusLabel[tx.status] || tx.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}