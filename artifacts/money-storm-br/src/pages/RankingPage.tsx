import { useEffect, useState } from "react";
import { ref, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { formatCurrency } from "@/lib/utils";
import { Trophy, Medal } from "lucide-react";

interface RankUser {
  uid: string;
  email: string;
  totalEarned: number;
  tasksTotal: number;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = query(ref(db, "users"), orderByChild("totalEarned"), limitToLast(50));
    return onValue(usersRef, (snap) => {
      const data = snap.val() ?? {};
      const list = Object.entries(data)
        .map(([uid, val]: [string, any]) => ({ uid, ...val }))
        .sort((a, b) => b.totalEarned - a.totalEarned)
        .slice(0, 10);
      setRanking(list);
      setLoading(false);
    });
  }, []);

  const medalColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const medalIcons = ["🥇", "🥈", "🥉"];

  return (
    <div className="min-h-screen bg-[#121212] pb-20">
      <TopBar />

      <div className="px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={20} className="text-[#FFD700]" />
          <h2 className="text-white font-bold text-lg">Top 10 Ganhadores</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#1e1e1e] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : ranking.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <Trophy size={40} className="text-gray-600 mb-3" />
            <p className="text-gray-500 text-sm">Nenhum usuário no ranking ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((u, i) => (
              <div
                key={u.uid}
                data-testid={`rank-${i}`}
                className={`flex items-center gap-3 p-4 rounded-2xl border ${
                  i === 0
                    ? "bg-[#FFD700]/10 border-[#FFD700]/30"
                    : i === 1
                    ? "bg-gray-500/10 border-gray-500/20"
                    : i === 2
                    ? "bg-amber-900/10 border-amber-700/20"
                    : "bg-[#1e1e1e] border-[#2a2a2a]"
                }`}
              >
                <div className="w-8 text-center">
                  {i < 3 ? (
                    <span className="text-xl">{medalIcons[i]}</span>
                  ) : (
                    <span className={`text-sm font-bold ${medalColors[i] || "text-gray-400"}`}>
                      #{i + 1}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {u.email.replace(/(.{3}).*@/, "$1***@")}
                  </p>
                  <p className="text-gray-400 text-xs">{u.tasksTotal || 0} tarefas</p>
                </div>
                <div className="text-right">
                  <p className="text-[#FFD700] text-sm font-bold">
                    {formatCurrency(u.totalEarned || 0)}
                  </p>
                  <p className="text-gray-500 text-[10px]">acumulado</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
