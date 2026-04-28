import { useEffect, useState } from "react";
import { ref, query, orderByChild, limitToLast, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import { formatCurrency } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface RankUser {
  uid: string;
  email: string;
  totalEarned: number;
  tasksTotal: number;
}

function maskEmail(email: string): string {
  if (!email || typeof email !== "string") return "***@***.com";
  const atIdx = email.indexOf("@");
  if (atIdx < 0) return "***";
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  if (local.length <= 3) return local + "***" + domain;
  return local.slice(0, 3) + "***" + domain;
}

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = query(ref(db, "users"), orderByChild("totalEarned"), limitToLast(50));
    return onValue(usersRef, (snap) => {
      const data = snap.val() ?? {};
      const list = Object.entries(data)
        .map(([uid, val]: [string, any]) => ({
          uid,
          email: val?.email ?? "",
          totalEarned: val?.totalEarned ?? 0,
          tasksTotal: val?.tasksTotal ?? 0,
        }))
        .sort((a, b) => b.totalEarned - a.totalEarned)
        .slice(0, 10);
      setRanking(list);
      setLoading(false);
    });
  }, []);

  const medalIcons = ["🥇", "🥈", "🥉"];
  const medalBg = [
    "bg-[#FFD700]/10 border-[#FFD700]/30",
    "bg-gray-500/10 border-gray-500/20",
    "bg-amber-900/10 border-amber-700/20",
  ];

  return (
    <div className="min-h-screen bg-[#121212] pb-24">
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
                  i < 3 ? medalBg[i] : "bg-[#1e1e1e] border-[#2a2a2a]"
                }`}
              >
                <div className="w-8 text-center flex-shrink-0">
                  {i < 3 ? (
                    <span className="text-xl">{medalIcons[i]}</span>
                  ) : (
                    <span className="text-sm font-bold text-gray-400">#{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    {maskEmail(u.email)}
                  </p>
                  <p className="text-gray-400 text-xs">{u.tasksTotal} tarefas</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[#FFD700] text-sm font-bold">
                    {formatCurrency(u.totalEarned)}
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
