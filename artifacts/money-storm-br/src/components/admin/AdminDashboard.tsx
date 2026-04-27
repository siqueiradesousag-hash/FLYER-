import { useEffect, useState } from "react";
import { ref, onValue, get } from "firebase/database";
import { db } from "@/lib/firebase";
import { formatCurrency } from "@/lib/utils";
import { Users, DollarSign, Clock, Activity } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalPaid: number;
  pendingWithdrawals: number;
  totalWithdrawals: number;
  onlineUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalPaid: 0,
    pendingWithdrawals: 0,
    totalWithdrawals: 0,
    onlineUsers: 0,
  });

  useEffect(() => {
    const usersRef = ref(db, "users");
    const withdrawalsRef = ref(db, "withdrawals");

    const unsub1 = onValue(usersRef, (snap) => {
      const data = snap.val() ?? {};
      const users = Object.values(data) as any[];
      const totalPaid = users.reduce((sum, u) => sum + (u.totalEarned || 0), 0);
      setStats((prev) => ({
        ...prev,
        totalUsers: users.length,
        totalPaid,
      }));
    });

    const unsub2 = onValue(withdrawalsRef, (snap) => {
      const data = snap.val() ?? {};
      let pending = 0;
      let total = 0;
      Object.values(data).forEach((userWithdrawals: any) => {
        Object.values(userWithdrawals).forEach((w: any) => {
          total++;
          if (w.status === "pending") pending++;
        });
      });
      setStats((prev) => ({
        ...prev,
        pendingWithdrawals: pending,
        totalWithdrawals: total,
      }));
    });

    return () => { unsub1(); unsub2(); };
  }, []);

  const cards = [
    { label: "Total Usuários", value: stats.totalUsers.toString(), icon: Users, color: "text-blue-400" },
    { label: "Total Pago", value: formatCurrency(stats.totalPaid), icon: DollarSign, color: "text-green-400" },
    { label: "Saques Pendentes", value: stats.pendingWithdrawals.toString(), icon: Clock, color: "text-yellow-400" },
    { label: "Total Saques", value: stats.totalWithdrawals.toString(), icon: Activity, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-lg">Dashboard</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c, i) => (
          <div key={i} className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a]">
            <c.icon size={18} className={c.color} />
            <p className="text-white text-lg font-bold mt-2">{c.value}</p>
            <p className="text-gray-400 text-xs mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
