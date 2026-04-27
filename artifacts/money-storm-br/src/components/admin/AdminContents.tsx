import { useEffect, useState } from "react";
import { ref, onValue, push, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";

interface Cont {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  coverImage: string;
  iconUrl: string;
  type: string;
  openType: string;
  url: string;
  reward: number;
  order: number;
  priority: number;
  badge: string;
  buttonText: string;
  active: boolean;
  featured: boolean;
  vipOnly: boolean;
}

const TYPES = ["LINK", "SCRIPT", "EMBED", "YOUTUBE_ID", "CPA_LINK", "MONETAG_LINK", "BANNER", "NEWS_LINK", "OFFERWALL", "SURVEY", "DOWNLOAD"];
const emptyContent: Omit<Cont, "id"> = {
  categoryId: "", title: "", description: "", coverImage: "", iconUrl: "",
  type: "LINK", openType: "new_tab", url: "", reward: 0.05,
  order: 0, priority: 10, badge: "", buttonText: "Ver Mais",
  active: true, featured: false, vipOnly: false,
};

export default function AdminContents() {
  const [items, setItems] = useState<Cont[]>([]);
  const [cats, setCats] = useState<{ id: string; name: string }[]>([]);
  const [editing, setEditing] = useState<Cont | typeof emptyContent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    const u1 = onValue(ref(db, "contents"), (snap) => {
      const data = snap.val() ?? {};
      setItems(Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v })).sort((a, b) => a.order - b.order));
    });
    const u2 = onValue(ref(db, "categories"), (snap) => {
      const data = snap.val() ?? {};
      setCats(Object.entries(data).map(([id, v]: [string, any]) => ({ id, name: (v as any).name })));
    });
    return () => { u1(); u2(); };
  }, []);

  const filtered = items.filter((c) => {
    const matchSearch = !search || c.title?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || c.categoryId === filterCat;
    return matchSearch && matchCat;
  });

  const save = async () => {
    if (!editing || !editing.title || !editing.url) return;
    const data = { ...editing };
    if ("id" in data) {
      const id = (data as Cont).id;
      const { id: _id, ...rest } = data as Cont;
      await set(ref(db, `contents/${id}`), rest);
    } else {
      await push(ref(db, "contents"), data);
    }
    setEditing(null);
    setShowForm(false);
  };

  const e = editing as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Conteúdos ({items.length})</h2>
        <button onClick={() => { setEditing({ ...emptyContent }); setShowForm(true); }} data-testid="button-new-content" className="bg-[#FFD700] text-black text-xs font-bold px-4 py-2 rounded-full">+ Novo</button>
      </div>

      <div className="flex gap-2">
        <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." className="flex-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-[#FFD700]" />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="bg-[#1e1e1e] border border-[#2a2a2a] text-white text-xs rounded-xl px-3 outline-none">
          <option value="all">Todas</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {showForm && e && (
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
          <h3 className="text-white font-semibold text-sm">{e.id ? "Editar" : "Novo"} conteúdo</h3>
          <div>
            <label className="text-gray-400 text-xs">Categoria *</label>
            <select value={e.categoryId} onChange={(ev) => setEditing({ ...e, categoryId: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]">
              <option value="">Selecione</option>
              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
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
              <label className="text-gray-400 text-xs">Imagem de capa</label>
              <input value={e.coverImage} onChange={(ev) => setEditing({ ...e, coverImage: ev.target.value })} placeholder="https://..." className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
            </div>
            <div className="flex-1">
              <label className="text-gray-400 text-xs">Ícone</label>
              <input value={e.iconUrl} onChange={(ev) => setEditing({ ...e, iconUrl: ev.target.value })} placeholder="https://..." className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
            </div>
          </div>
          {e.coverImage && <img src={e.coverImage} alt="" className="w-24 h-16 object-cover rounded-lg" />}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-gray-400 text-xs">Tipo</label>
              <select value={e.type} onChange={(ev) => setEditing({ ...e, type: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none">
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-gray-400 text-xs">Abertura</label>
              <select value={e.openType} onChange={(ev) => setEditing({ ...e, openType: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none">
                <option value="new_tab">Nova aba</option>
                <option value="same_tab">Mesma aba</option>
                <option value="modal">Modal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs">URL / Script / Embed *</label>
            <input value={e.url} onChange={(ev) => setEditing({ ...e, url: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div className="flex gap-3">
            <div>
              <label className="text-gray-400 text-xs">Recompensa R$</label>
              <input type="number" step="0.01" value={e.reward} onChange={(ev) => setEditing({ ...e, reward: parseFloat(ev.target.value) })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-gray-400 text-xs">Ordem</label>
              <input type="number" value={e.order} onChange={(ev) => setEditing({ ...e, order: Number(ev.target.value) })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-gray-400 text-xs">Prioridade</label>
              <input type="number" value={e.priority} onChange={(ev) => setEditing({ ...e, priority: Number(ev.target.value) })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-gray-400 text-xs">Badge</label>
              <input value={e.badge} onChange={(ev) => setEditing({ ...e, badge: ev.target.value })} placeholder="HOT,NEW,+$ 141" className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
            </div>
            <div className="flex-1">
              <label className="text-gray-400 text-xs">Texto botão</label>
              <input value={e.buttonText} onChange={(ev) => setEditing({ ...e, buttonText: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
            </div>
          </div>
          <div className="flex gap-4 flex-wrap">
            {["active", "featured", "vipOnly"].map((field) => (
              <label key={field} className="flex items-center gap-2 text-white text-sm">
                <input type="checkbox" checked={!!e[field]} onChange={(ev) => setEditing({ ...e, [field]: ev.target.checked })} className="accent-[#FFD700]" />
                {field === "active" ? "Ativo" : field === "featured" ? "Destaque" : "VIP"}
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={save} data-testid="button-save-content" className="flex-1 bg-[#FFD700] text-black font-bold py-2.5 rounded-xl text-sm">Salvar</button>
            <button onClick={() => { setEditing(null); setShowForm(false); }} className="flex-1 bg-[#2a2a2a] text-white font-semibold py-2.5 rounded-xl text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((c) => (
          <div key={c.id} data-testid={`content-item-${c.id}`} className="bg-[#1e1e1e] rounded-2xl p-3 border border-[#2a2a2a] flex items-center gap-3">
            {c.coverImage && <img src={c.coverImage} alt="" className="w-12 h-10 object-cover rounded-lg flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{c.title}</p>
              <p className="text-gray-500 text-xs">{c.buttonText || "Ver Mais"} • {c.type}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(c); setShowForm(true); }} data-testid={`edit-content-${c.id}`} className="text-blue-400">✏</button>
              <button onClick={() => remove(ref(db, `contents/${c.id}`))} data-testid={`del-content-${c.id}`} className="text-red-400">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
