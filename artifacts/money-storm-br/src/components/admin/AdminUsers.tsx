import { useEffect, useState } from "react";
import { ref, onValue, runTransaction, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { formatCurrency } from "@/lib/utils";

interface AdminUser {
  uid: string;
  email: string;
  balance: number;
  totalEarned: number;
  tasksToday: number;
  isAdmin: boolean;
  isVip: boolean;
  isBanned: boolean;
  isSuspect: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [editBalance, setEditBalance] = useState<Record<string, string>>({});

  useEffect(() => {
    const r = ref(db, "users");
    return onValue(r, (snap) => {
      const data = snap.val() ?? {};
      const list = Object.entries(data).map(([uid, val]: [string, any]) => ({ uid, ...val }));
      setUsers(list);
    });
  }, []);

  const filtered = users.filter((u) => {
    const matchSearch = u.email?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "vip" && u.isVip) ||
      (filter === "banned" && u.isBanned) ||
      (filter === "suspect" && u.isSuspect);
    return matchSearch && matchFilter;
  });

  const updateField = async (uid: string, field: string, value: any) => {
    await set(ref(db, `users/${uid}/${field}`), value);
  };

  const updateBalance = async (uid: string) => {
    const val = parseFloat(editBalance[uid] ?? "");
    if (isNaN(val)) return;
    await set(ref(db, `users/${uid}/balance`), Math.round(val * 100) / 100);
    setEditBalance((prev) => ({ ...prev, [uid]: "" }));
  };

  const deleteUser = async (uid: string) => {
    if (!confirm("Excluir este usuário?")) return;
    await remove(ref(db, `users/${uid}`));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Usuários ({filtered.length})</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          data-testid="filter-users"
          className="bg-[#2a2a2a] border border-[#3a3a3a] text-white text-xs rounded-xl px-3 py-1.5 outline-none"
        >
          <option value="all">Todos</option>
          <option value="vip">VIP</option>
          <option value="banned">Banidos</option>
          <option value="suspect">Suspeitos</option>
        </select>
      </div>

      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        data-testid="search-users"
        placeholder="Buscar email..."
        className="w-full bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-[#FFD700]"
      />

      <div className="space-y-3">
        {filtered.map((u) => (
          <div
            key={u.uid}
            data-testid={`user-${u.uid}`}
            className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white text-sm font-semibold">{u.email}</p>
                <p className="text-gray-400 text-xs">
                  Total: {formatCurrency(u.totalEarned || 0)} • Tarefas hoje: {u.tasksToday || 0}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  u.isBanned
                    ? "bg-red-600 text-white"
                    : u.isSuspect
                    ? "bg-orange-600 text-white"
                    : "bg-green-600 text-white"
                }`}
              >
                {u.isBanned ? "banido" : u.isSuspect ? "suspeito" : "active"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editBalance[u.uid] ?? u.balance.toFixed(2)}
                onChange={(e) => setEditBalance((prev) => ({ ...prev, [u.uid]: e.target.value }))}
                data-testid={`input-balance-${u.uid}`}
                className="flex-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg px-3 py-1.5 text-white text-sm outline-none"
              />
              <button
                onClick={() => updateBalance(u.uid)}
                data-testid={`button-ok-${u.uid}`}
                className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-green-700"
              >
                OK
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateField(u.uid, "isVip", !u.isVip)}
                data-testid={`button-vip-${u.uid}`}
                className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full ${
                  u.isVip ? "bg-[#FFD700] text-black" : "bg-[#2a2a2a] text-[#FFD700] border border-[#FFD700]/30"
                }`}
              >
                👑 VIP
              </button>
              <button
                onClick={() => updateField(u.uid, "isSuspect", !u.isSuspect)}
                data-testid={`button-suspect-${u.uid}`}
                className="bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-orange-700"
              >
                ⚠ Suspeitar
              </button>
              <button
                onClick={() => updateField(u.uid, "isBanned", !u.isBanned)}
                data-testid={`button-ban-${u.uid}`}
                className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-700"
              >
                🚫 {u.isBanned ? "Desbanir" : "Banir"}
              </button>
              <button
                onClick={() => deleteUser(u.uid)}
                data-testid={`button-delete-${u.uid}`}
                className="bg-[#2a2a2a] text-red-400 text-xs font-bold px-3 py-1.5 rounded-full border border-red-500/30"
              >
                🗑 Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
