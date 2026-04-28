import { useState } from "react";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAppConfig, defaultConfig } from "@/contexts/AppConfigContext";
import type { AppConfig } from "@/contexts/AppConfigContext";

export default function AdminConfig() {
  const { config } = useAppConfig();
  const [form, setForm] = useState<AppConfig>({ ...config });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: "", ok: true });

  const save = async () => {
    setSaving(true);
    try {
      await set(ref(db, "config"), form);
      setMsg({ text: "✅ Configurações salvas com sucesso!", ok: true });
    } catch {
      setMsg({ text: "❌ Erro ao salvar. Tente novamente.", ok: false });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg({ text: "", ok: true }), 3000);
    }
  };

  const reset = () => setForm({ ...defaultConfig });

  function F(label: string, field: keyof AppConfig, type = "text", placeholder = "") {
    return (
      <div key={String(field)}>
        <label className="text-gray-400 text-xs">{label}</label>
        <input
          type={type}
          value={form[field] as string | number}
          onChange={(e) =>
            setForm({
              ...form,
              [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
            })
          }
          placeholder={placeholder}
          className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]"
        />
      </div>
    );
  }

  function Toggle(label: string, field: keyof AppConfig, color = "#FFD700") {
    const val = form[field] as boolean;
    return (
      <div key={String(field)} className="flex items-center justify-between py-2 border-b border-[#2a2a2a] last:border-0">
        <span className="text-white text-sm">{label}</span>
        <button
          onClick={() => setForm({ ...form, [field]: !val })}
          className={`w-12 h-6 rounded-full transition-colors relative ${val ? "" : "bg-[#3a3a3a]"}`}
          style={{ backgroundColor: val ? color : undefined }}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${val ? "left-7" : "left-1"}`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Configurações</h2>
        <button
          onClick={reset}
          className="bg-[#2a2a2a] border border-[#3a3a3a] text-gray-400 text-xs px-3 py-1.5 rounded-full"
        >
          ↺ Padrão
        </button>
      </div>

      {/* Unity Ads — destaque */}
      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-purple-400 font-semibold text-sm flex items-center gap-2">📱 Unity Ads</h3>
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-3">
          {Toggle("🔌 Ativar Unity Ads", "unityAdsEnabled", "#a855f7")}
          {Toggle("Modo teste (sem cobranças)", "unityTestMode", "#a855f7")}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-gray-400 text-xs">Game ID Android</label>
            <input
              value={form.unityGameIdAndroid}
              onChange={(e) => setForm({ ...form, unityGameIdAndroid: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Game ID iOS</label>
            <input
              value={form.unityGameIdIos}
              onChange={(e) => setForm({ ...form, unityGameIdIos: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none"
            />
          </div>
        </div>
        <p className="text-gray-600 text-xs">
          {form.unityAdsEnabled ? "✅ Unity Ads ATIVADO" : "⛔ Unity Ads desativado — usando link direto"}
        </p>
      </div>

      {/* Recompensas */}
      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm">💰 Recompensas e Saques</h3>
        {F("Bônus de cadastro (R$)", "bonusCadastro", "number")}
        {F("Recompensa por vídeo (R$)", "recompensaVideo", "number")}
        {F("Saque mínimo (R$)", "saqueMinimo", "number")}
        {F("Limite de tarefas/dia", "limiteTarefasDia", "number")}
      </div>

      {/* Cronômetro / Cooldown */}
      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm">⏱ Cronômetro e Cooldown Anti-Ban</h3>
        {F("Tempo do anúncio / cronômetro (s)", "adTimer", "number")}
        <div className="grid grid-cols-3 gap-2">
          {(["cooldown1", "cooldown2", "cooldown3"] as const).map((k, idx) => (
            <div key={k}>
              <label className="text-gray-400 text-xs">Cooldown {idx + 1} (s)</label>
              <input
                type="number"
                value={form[k]}
                onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })}
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none"
              />
            </div>
          ))}
        </div>
        <p className="text-gray-600 text-xs">
          Após assistir, o botão ficará bloqueado por um tempo aleatório entre os 3 cooldowns.
        </p>
      </div>

      {/* Botão Assistir */}
      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm">🎥 Botão Assistir e Ganhar</h3>
        {Toggle("Botão central ativo", "buttonActive")}
        {F("Imagem do botão (URL)", "buttonImageUrl", "text", "https://...")}
        {form.buttonImageUrl && (
          <img
            src={form.buttonImageUrl}
            alt="preview"
            className="w-full h-20 object-contain rounded-xl bg-[#2a2a2a]"
          />
        )}
        {F("Link do anúncio", "adLink", "text", "https://...")}
      </div>

      {/* Links */}
      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm">🔗 Links e Canais</h3>
        {F("CPA Link", "cpaLink")}
        {F("Monetag Zone URL", "monetagZone")}
        {F("Telegram", "telegram")}
        {F("Suporte (URL ou email)", "support")}
      </div>

      {/* Geral */}
      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm">⚙ Geral do App</h3>
        {F("Nome do app", "appName")}
        {F("Logo URL", "logoUrl")}
        {Toggle("Modo manutenção", "maintenanceMode")}
        {F("Mensagem manutenção", "maintenanceMessage")}
      </div>

      {msg.text && (
        <div
          className={`rounded-xl px-4 py-3 ${
            msg.ok
              ? "bg-green-900/30 border border-green-500/30"
              : "bg-red-900/30 border border-red-500/30"
          }`}
        >
          <p className={`text-sm ${msg.ok ? "text-green-400" : "text-red-400"}`}>{msg.text}</p>
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        data-testid="button-save-config"
        className="w-full bg-[#FFD700] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#e6c200] disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
      >
        💾 {saving ? "Salvando..." : "Salvar configurações"}
      </button>
    </div>
  );
}
