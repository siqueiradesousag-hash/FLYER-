import { useState } from "react";
import { ref, set } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAppConfig } from "@/contexts/AppConfigContext";

export default function AdminConfig() {
  const { config } = useAppConfig();
  const [form, setForm] = useState({ ...config });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    setSaving(true);
    try {
      await set(ref(db, "config"), form);
      setMsg("Configurações salvas!");
    } catch {
      setMsg("Erro ao salvar");
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const reset = () => setForm({ ...config });

  const F = (label: string, field: keyof typeof form, type = "text", placeholder = "") => (
    <div key={field}>
      <label className="text-gray-400 text-xs">{label}</label>
      <input
        type={type}
        value={form[field] as string | number}
        onChange={(e) => setForm({ ...form, [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value })}
        placeholder={placeholder}
        className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]"
      />
    </div>
  );

  const Toggle = (label: string, field: keyof typeof form) => (
    <div key={field} className="flex items-center justify-between py-2">
      <span className="text-white text-sm">{label}</span>
      <button
        onClick={() => setForm({ ...form, [field]: !form[field] })}
        className={`w-12 h-6 rounded-full transition-colors relative ${form[field] ? "bg-[#FFD700]" : "bg-[#3a3a3a]"}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form[field] ? "left-7" : "left-1"}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Configurações</h2>
        <button onClick={reset} className="bg-[#2a2a2a] border border-[#3a3a3a] text-gray-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
          ↺ Padrão
        </button>
      </div>

      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">💰 Recompensas e Saques</h3>
        {F("Bônus de cadastro (R$)", "bonusCadastro", "number")}
        {F("Recompensa por vídeo (R$)", "recompensaVideo", "number")}
        {F("Saque mínimo (R$)", "saqueMinimo", "number")}
        {F("Limite de tarefas/dia", "limiteTarefasDia", "number")}
      </div>

      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">⚙ Anti-Ban / Cooldown</h3>
        {F("Tempo do anúncio (s)", "adTimer", "number")}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-gray-400 text-xs">Cooldown 1 (s)</label>
            <input type="number" value={form.cooldown1} onChange={(e) => setForm({ ...form, cooldown1: Number(e.target.value) })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Cooldown 2 (s)</label>
            <input type="number" value={form.cooldown2} onChange={(e) => setForm({ ...form, cooldown2: Number(e.target.value) })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Cooldown 3 (s)</label>
            <input type="number" value={form.cooldown3} onChange={(e) => setForm({ ...form, cooldown3: Number(e.target.value) })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
          </div>
        </div>
      </div>

      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">🎥 Botão Assistir e Ganhar</h3>
        {Toggle("Botão central ativo", "buttonActive")}
        {F("Imagem do botão", "buttonImageUrl", "text", "https://...")}
        {form.buttonImageUrl && <img src={form.buttonImageUrl} alt="" className="w-full h-20 object-contain rounded-xl bg-[#2a2a2a]" />}
        {F("Link do anúncio", "adLink", "text", "https://...")}
      </div>

      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">📱 Unity Ads SDK</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-gray-400 text-xs">Game ID Android</label>
            <input value={form.unityGameIdAndroid} onChange={(e) => setForm({ ...form, unityGameIdAndroid: e.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Game ID iOS</label>
            <input value={form.unityGameIdIos} onChange={(e) => setForm({ ...form, unityGameIdIos: e.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Placement ID Android</label>
            <input defaultValue="Rewarded_Android" className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Placement ID iOS</label>
            <input defaultValue="Rewarded_iOS" className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
          </div>
        </div>
        {Toggle("Modo teste Unity", "unityTestMode")}
      </div>

      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">🔗 Links Especiais</h3>
        {F("CPA Link", "cpaLink")}
        {F("Monetag Zone", "monetagZone")}
        {F("Monetag Link", "monetagLink")}
        {F("Telegram", "telegram")}
        {F("Suporte (URL/email)", "support")}
      </div>

      <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
        <h3 className="text-[#FFD700] font-semibold text-sm flex items-center gap-2">⚙ Geral</h3>
        {F("Nome do app", "appName")}
        {F("Logo URL", "logoUrl")}
        {Toggle("Modo manutenção", "maintenanceMode")}
        {F("Mensagem manutenção", "maintenanceMessage")}
      </div>

      {msg && (
        <div className="bg-green-900/30 border border-green-500/30 rounded-xl px-4 py-3">
          <p className="text-green-400 text-sm">{msg}</p>
        </div>
      )}

      <button
        onClick={save}
        disabled={saving}
        data-testid="button-save-config"
        className="w-full bg-[#FFD700] text-black font-bold py-3 rounded-2xl text-sm hover:bg-[#e6c200] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        💾 {saving ? "Salvando..." : "Salvar configurações"}
      </button>
    </div>
  );
}
