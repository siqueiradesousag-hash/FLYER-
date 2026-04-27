import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Withdrawal {
  uid: string;
  wid: string;
  email: string;
  amount: number;
  pixKey: string;
  status: string;
  timestamp: number;
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const r = ref(db, "withdrawals");
    return onValue(r, (snap) => {
      const data = snap.val() ?? {};
      const list: Withdrawal[] = [];
      Object.entries(data).forEach(([uid, userWithdrawals]: [string, any]) => {
        Object.entries(userWithdrawals).forEach(([wid, w]: [string, any]) => {
          list.push({ uid, wid, ...w });
        });
      });
      list.sort((a, b) => b.timestamp - a.timestamp);
      setWithdrawals(list);
    });
  }, []);

  const filtered = withdrawals.filter((w) => {
    const matchTab = w.status === tab;
    const matchSearch = !search || w.email?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    pending: withdrawals.filter((w) => w.status === "pending").length,
    approved: withdrawals.filter((w) => w.status === "approved").length,
    rejected: withdrawals.filter((w) => w.status === "rejected").length,
  };

  const updateStatus = async (w: Withdrawal, status: string) => {
    await set(ref(db, `withdrawals/${w.uid}/${w.wid}/status`), status);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-lg">
        Pedidos de Saque ({withdrawals.length})
      </h2>

      <div className="flex gap-2">
        {(["pending", "approved", "rejected"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            data-testid={`tab-${t}`}
            className={`flex-1 text-xs font-semibold py-2 rounded-full transition-colors ${
              tab === t
                ? "bg-[#FFD700] text-black"
                : "bg-[#1e1e1e] text-gray-400 border border-[#2a2a2a]"
            }`}
          >
            {t === "pending" ? "Pendentes" : t === "approved" ? "Aprovados" : "Recusados"}{" "}
            {counts[t]}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por email..."
          data-testid="search-withdrawals"
          className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFD700] pl-8"
        />
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          Nenhum saque {tab === "pending" ? "pendente" : tab === "approved" ? "aprovado" : "recusado"}.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((w) => (
            <div
              key={`${w.uid}-${w.wid}`}
              data-testid={`withdrawal-${w.wid}`}
              className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white text-sm font-semibold">{w.email}</p>
                  <p className="text-gray-400 text-xs">PIX: {w.pixKey}</p>
                  <p className="text-gray-500 text-xs">{formatDate(w.timestamp)}</p>
                </div>
                <p className="text-[#FFD700] font-bold text-sm">{formatCurrency(w.amount)}</p>
              </div>
              {tab === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(w, "approved")}
                    data-testid={`approve-${w.wid}`}
                    className="flex-1 bg-green-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-green-700"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => updateStatus(w, "rejected")}
                    data-testid={`reject-${w.wid}`}
                    className="flex-1 bg-red-600 text-white text-xs font-bold py-2 rounded-xl hover:bg-red-700"
                  >
                    Recusar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
