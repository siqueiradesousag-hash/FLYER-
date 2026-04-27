import { useEffect, useState } from "react";
import { ref, onValue, runTransaction, push } from "firebase/database";
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

  useEffect(() => {
    setPixKey(userData?.pixKey || "");
  }, [userData]);

  const savePixKey = async () => {
    if (!user || !pixKey.trim()) return;
    const { ref: dbRefFn, set } = await import("firebase/database");
    const { db: fireDb } = await import("@/lib/firebase");
    const keyRef = dbRefFn(fireDb, `users/${user.uid}/pixKey`);
    await (await import("firebase/database")).set(keyRef, pixKey.trim());
    setMsg("Chave PIX salva!");
    setMsgType("success");
    setTimeout(() => setMsg(""), 3000);
  };

  const requestWithdraw = async () => {
    if (!user || !userData) return;
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < config.saqueMinimo) {
      setMsg(`Valor mínimo de saque: ${formatCurrency(config.saqueMinimo)}`);
      setMsgType("error");
      setTimeout(() => setMsg(""), 3000);
      return;
    }
    if (amount > userData.balance) {
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
      const balanceRef = ref(db, `users/${user.uid}/balance`);
      await runTransaction(balanceRef, (current) => {
        if ((current ?? 0) < amount) return;
        return Math.round(((current ?? 0) - amount) * 100) / 100;
      });
      const txRef = ref(db, `transactions/${user.uid}`);
      await push(txRef, {
        type: "withdraw",
        amount: -amount,
        description: `Saque via PIX (${pixKey})`,
        status: "pending",
        timestamp: Date.now(),
        pixKey,
      });
      const withdrawRef = ref(db, `withdrawals/${user.uid}/${Date.now()}`);
      const { set } = await import("firebase/database");
      await set(withdrawRef, {
        uid: user.uid,
        email: userData.email,
        amount,
        pixKey,
        status: "pending",
        timestamp: Date.now(),
      });
      setMsg("Solicitação de saque enviada!");
      setMsgType("success");
      setWithdrawAmount("");
      await refreshUserData();
    } catch {
      setMsg("Erro ao solicitar saque");
      setMsgType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(""), 3000);
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
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
          <p className="text-gray-400 text-xs mb-1">Saldo disponível</p>
          <p className="text-[#FFD700] text-3xl font-bold">
            {userData ? formatCurrency(userData.balance) : "R$ 0,00"}
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Mínimo para saque: {formatCurrency(config.saqueMinimo)}
          </p>
        </div>

        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
          <h3 className="text-white font-semibold text-sm">Chave PIX</h3>
          <input
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            data-testid="input-pix-key"
            placeholder="CPF, email, telefone ou chave aleatória"
            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD700] transition-colors"
          />
          <button
            onClick={savePixKey}
            data-testid="button-save-pix"
            className="w-full bg-[#2a2a2a] border border-[#FFD700]/30 text-[#FFD700] text-sm font-semibold py-2.5 rounded-xl hover:bg-[#FFD700]/10 transition-colors"
          >
            Salvar Chave PIX
          </button>
        </div>

        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
          <h3 className="text-white font-semibold text-sm">Solicitar Saque</h3>
          <input
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            data-testid="input-withdraw-amount"
            placeholder={`Mínimo R$ ${config.saqueMinimo.toFixed(2)}`}
            className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#FFD700] transition-colors"
          />
          <button
            onClick={requestWithdraw}
            disabled={loading}
            data-testid="button-withdraw"
            className="w-full bg-[#FFD700] text-black font-bold py-3 rounded-xl text-sm hover:bg-[#e6c200] transition-colors disabled:opacity-50"
          >
            {loading ? "Processando..." : "Sacar via PIX"}
          </button>
        </div>

        {msg && (
          <div
            className={`rounded-xl px-4 py-3 border ${
              msgType === "success"
                ? "bg-green-900/30 border-green-500/30 text-green-400"
                : "bg-red-900/30 border-red-500/30 text-red-400"
            }`}
          >
            <p className="text-sm">{msg}</p>
          </div>
        )}

        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
          <h3 className="text-white font-semibold text-sm mb-3">Histórico de Transações</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Nenhuma transação ainda.</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  data-testid={`tx-${tx.id}`}
                  className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0"
                >
                  <div>
                    <p className="text-white text-xs font-medium">{tx.description}</p>
                    <p className="text-gray-500 text-[10px]">{formatDate(tx.timestamp)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-xs font-bold ${
                        tx.amount >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {formatCurrency(tx.amount)}
                    </p>
                    <p className={`text-[10px] ${statusColor[tx.status] || "text-gray-400"}`}>
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
