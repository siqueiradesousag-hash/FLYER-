import { useEffect, useState } from "react";
import { ref, onValue, push, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";

interface Cat {
  id: string;
  name: string;
  icon: string;
  imageUrl: string;
  order: number;
  active: boolean;
  vipOnly: boolean;
}

const empty = { name: "", icon: "📦", imageUrl: "", order: 0, active: true, vipOnly: false };

export default function AdminCategories() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [editing, setEditing] = useState<(Cat & { id?: string }) | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return onValue(ref(db, "categories"), (snap) => {
      const data = snap.val() ?? {};
      setCats(Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v })).sort((a, b) => a.order - b.order));
    });
  }, []);

  const save = async () => {
    if (!editing || !editing.name) return;
    if (editing.id) {
      await set(ref(db, `categories/${editing.id}`), { name: editing.name, icon: editing.icon, imageUrl: editing.imageUrl, order: editing.order, active: editing.active, vipOnly: editing.vipOnly });
    } else {
      await push(ref(db, "categories"), { name: editing.name, icon: editing.icon, imageUrl: editing.imageUrl, order: editing.order, active: editing.active, vipOnly: editing.vipOnly });
    }
    setEditing(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Categorias ({cats.length})</h2>
        <button
          onClick={() => { setEditing({ ...empty }); setShowForm(true); }}
          data-testid="button-new-category"
          className="bg-[#FFD700] text-black text-xs font-bold px-4 py-2 rounded-full"
        >
          + Nova
        </button>
      </div>

      {(showForm || editing?.id) && editing && (
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
          <h3 className="text-white font-semibold text-sm">{editing.id ? "Editar" : "Nova"} categoria</h3>
          <div>
            <label className="text-gray-400 text-xs">Nome *</label>
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-gray-400 text-xs">Ícone (emoji)</label>
              <input value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value })}
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
            </div>
            <div className="flex-1">
              <label className="text-gray-400 text-xs">Ordem</label>
              <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs">Imagem URL</label>
            <input value={editing.imageUrl} onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-white text-sm">
              <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="accent-[#FFD700]" />
              Ativa
            </label>
            <label className="flex items-center gap-2 text-white text-sm">
              <input type="checkbox" checked={editing.vipOnly} onChange={(e) => setEditing({ ...editing, vipOnly: e.target.checked })} className="accent-[#FFD700]" />
              Apenas VIP
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={save} data-testid="button-save-category" className="flex-1 bg-[#FFD700] text-black font-bold py-2.5 rounded-xl text-sm">Salvar</button>
            <button onClick={() => { setEditing(null); setShowForm(false); }} className="flex-1 bg-[#2a2a2a] text-white font-semibold py-2.5 rounded-xl text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {cats.map((c) => (
          <div key={c.id} data-testid={`cat-item-${c.id}`} className="bg-[#1e1e1e] rounded-2xl p-3 border border-[#2a2a2a] flex items-center gap-3">
            <span className="text-xl">{c.icon}</span>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">{c.name}</p>
              <p className="text-gray-500 text-xs">Ordem: {c.order}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(c)} data-testid={`edit-cat-${c.id}`} className="text-blue-400 hover:text-blue-300">✏</button>
              <button onClick={() => remove(ref(db, `categories/${c.id}`))} data-testid={`del-cat-${c.id}`} className="text-red-400 hover:text-red-300">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
