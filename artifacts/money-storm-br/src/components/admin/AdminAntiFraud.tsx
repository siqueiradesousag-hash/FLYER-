import { useEffect, useState } from "react";
import { ref, onValue, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { formatCurrency } from "@/lib/utils";

interface SuspectUser {
  uid: string;
  email: string;
  balance: number;
  totalEarned: number;
  isSuspect: boolean;
  isBanned: boolean;
  fraudScore: number;
}

export default function AdminAntiFraud() {
  const [suspects, setSuspects] = useState<SuspectUser[]>([]);
  const [stats, setStats] = useState({ suspects: 0, banned: 0, highScore: 0 });

  useEffect(() => {
    return onValue(ref(db, "users"), (snap) => {
      const data = snap.val() ?? {};
      const users = Object.entries(data).map(([uid, v]: [string, any]) => ({ uid, ...v }));
      const flagged = users.filter((u) => u.isSuspect || u.isBanned || (u.fraudScore || 0) > 5);
      setSuspects(flagged);
      setStats({
        suspects: users.filter((u) => u.isSuspect).length,
        banned: users.filter((u) => u.isBanned).length,
        highScore: users.filter((u) => (u.fraudScore || 0) > 8).length,
      });
    });
  }, []);

  const updateField = async (uid: string, field: string, value: any) => {
    await set(ref(db, `users/${uid}/${field}`), value);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-lg">Anti-Fraude</h2>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#1e1e1e] rounded-xl p-3 border border-[#2a2a2a] text-center">
          <p className="text-gray-400 text-[10px] uppercase mb-1">Suspeitos</p>
          <p className="text-orange-400 text-xl font-bold">{stats.suspects}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-xl p-3 border border-[#2a2a2a] text-center">
          <p className="text-gray-400 text-[10px] uppercase mb-1">Banidos</p>
          <p className="text-red-400 text-xl font-bold">{stats.banned}</p>
        </div>
        <div className="bg-[#1e1e1e] rounded-xl p-3 border border-[#2a2a2a] text-center">
          <p className="text-gray-400 text-[10px] uppercase mb-1">Score Alto</p>
          <p className="text-yellow-400 text-xl font-bold">{stats.highScore}</p>
        </div>
      </div>

      {suspects.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">Nenhum usuário suspeito detectado.</p>
      ) : (
        <div className="space-y-3">
          {suspects.map((u) => (
            <div key={u.uid} data-testid={`fraud-user-${u.uid}`} className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#FFD700]">🛡</span>
                  <div>
                    <p className="text-white text-sm font-bold">{u.email}</p>
                    <p className="text-gray-400 text-xs">
                      Saldo: {formatCurrency(u.balance)} • Total: {formatCurrency(u.totalEarned)}
                    </p>
                  </div>
                </div>
                <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Score: {u.fraudScore || 0}
                </span>
              </div>

              <div>
                {u.isSuspect && (
                  <p className="text-orange-400 text-xs">• Marcado como suspeito</p>
                )}
                {u.isBanned && (
                  <p className="text-red-400 text-xs">• Conta banida</p>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {}}
                  data-testid={`investigate-${u.uid}`}
                  className="flex items-center gap-1 bg-[#2a2a2a] border border-blue-500/30 text-blue-400 text-xs font-semibold px-3 py-1.5 rounded-full"
                >
                  👁 Investigar
                </button>
                <button
                  onClick={() => updateField(u.uid, "isSuspect", !u.isSuspect)}
                  data-testid={`suspect-${u.uid}`}
                  className="flex items-center gap-1 bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-orange-700"
                >
                  ⚠ {u.isSuspect ? "Limpar" : "Suspeito"}
                </button>
                <button
                  onClick={() => updateField(u.uid, "isBanned", !u.isBanned)}
                  data-testid={`ban-fraud-${u.uid}`}
                  className="flex items-center gap-1 bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-700"
                >
                  🚫 {u.isBanned ? "Desbanir" : "Banir"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
