import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminWithdrawals from "@/components/admin/AdminWithdrawals";
import AdminCategories from "@/components/admin/AdminCategories";
import AdminContents from "@/components/admin/AdminContents";
import AdminBanners from "@/components/admin/AdminBanners";
import AdminNews from "@/components/admin/AdminNews";
import AdminMissions from "@/components/admin/AdminMissions";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AdminAntiFraud from "@/components/admin/AdminAntiFraud";
import AdminConfig from "@/components/admin/AdminConfig";

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "users", label: "Usuários" },
  { id: "withdrawals", label: "Saques" },
  { id: "categories", label: "Categorias" },
  { id: "contents", label: "Conteúdos" },
  { id: "banners", label: "Banners" },
  { id: "news", label: "Notícias" },
  { id: "missions", label: "Missões" },
  { id: "notifications", label: "Notificações" },
  { id: "antifraud", label: "Anti-Fraude" },
  { id: "config", label: "Config." },
];

export default function AdminPage() {
  const { userData } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!userData?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center gap-4">
        <p className="text-white text-lg font-semibold">Acesso negado</p>
        <button
          onClick={() => setLocation("/")}
          className="text-[#FFD700] text-sm"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard": return <AdminDashboard />;
      case "users": return <AdminUsers />;
      case "withdrawals": return <AdminWithdrawals />;
      case "categories": return <AdminCategories />;
      case "contents": return <AdminContents />;
      case "banners": return <AdminBanners />;
      case "news": return <AdminNews />;
      case "missions": return <AdminMissions />;
      case "notifications": return <AdminNotifications />;
      case "antifraud": return <AdminAntiFraud />;
      case "config": return <AdminConfig />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] pb-20">
      <TopBar showBack={false} />

      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide border-b border-[#2a2a2a]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`admin-tab-${tab.id}`}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-[#FFD700] text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">{renderTab()}</div>
      <BottomNav />
    </div>
  );
}
