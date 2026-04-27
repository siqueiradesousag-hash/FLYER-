import { useEffect, useState } from "react";
import { ref, onValue, push, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";

interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  goal: number;
  reward: number;
  active: boolean;
}

const emptyMission = { title: "", description: "", type: "Diária", goal: 1, reward: 0.5, active: true };

export default function AdminMissions() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [editing, setEditing] = useState<Mission | typeof emptyMission | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return onValue(ref(db, "missions"), (snap) => {
      const data = snap.val() ?? {};
      setMissions(Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v })));
    });
  }, []);

  const save = async () => {
    if (!editing || !editing.title) return;
    const e = editing as any;
    if (e.id) { const { id, ...rest } = e; await set(ref(db, `missions/${id}`), rest); }
    else { await push(ref(db, "missions"), e); }
    setEditing(null);
    setShowForm(false);
  };

  const e = editing as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Missões ({missions.length})</h2>
        <button onClick={() => { setEditing({ ...emptyMission }); setShowForm(true); }} data-testid="button-new-mission" className="bg-[#FFD700] text-black text-xs font-bold px-4 py-2 rounded-full">+ Nova</button>
      </div>

      {showForm && e && (
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
          <div>
            <label className="text-gray-400 text-xs">Título *</label>
            <input value={e.title} onChange={(ev) => setEditing({ ...e, title: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Descrição</label>
            <input value={e.description} onChange={(ev) => setEditing({ ...e, description: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-gray-400 text-xs">Tipo</label>
              <select value={e.type} onChange={(ev) => setEditing({ ...e, type: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none">
                <option value="Diária">Diária</option>
                <option value="Semanal">Semanal</option>
                <option value="Única">Única</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-xs">Meta</label>
              <input type="number" value={e.goal} onChange={(ev) => setEditing({ ...e, goal: Number(ev.target.value) })} className="w-20 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-gray-400 text-xs">Recompensa</label>
              <input type="number" step="0.1" value={e.reward} onChange={(ev) => setEditing({ ...e, reward: parseFloat(ev.target.value) })} className="w-20 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-white text-sm">
            <input type="checkbox" checked={e.active} onChange={(ev) => setEditing({ ...e, active: ev.target.checked })} className="accent-[#FFD700]" />
            Ativa
          </label>
          <div className="flex gap-3">
            <button onClick={save} data-testid="button-save-mission" className="flex-1 bg-[#FFD700] text-black font-bold py-2.5 rounded-xl text-sm">Salvar</button>
            <button onClick={() => { setEditing(null); setShowForm(false); }} className="flex-1 bg-[#2a2a2a] text-white font-semibold py-2.5 rounded-xl text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {missions.length === 0 && !showForm && <p className="text-gray-500 text-sm text-center py-8">Nenhuma missão cadastrada.</p>}

      <div className="space-y-2">
        {missions.map((m) => (
          <div key={m.id} data-testid={`mission-${m.id}`} className="bg-[#1e1e1e] rounded-2xl p-3 border border-[#2a2a2a] flex items-center gap-3">
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{m.title}</p>
              <p className="text-gray-500 text-xs">{m.type} • Meta: {m.goal} • R$ {m.reward?.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(m); setShowForm(true); }} className="text-blue-400">✏</button>
              <button onClick={() => remove(ref(db, `missions/${m.id}`))} className="text-red-400">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
