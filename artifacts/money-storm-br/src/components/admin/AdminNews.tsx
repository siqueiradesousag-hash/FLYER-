import { useEffect, useState } from "react";
import { ref, onValue, push, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";

interface News {
  id: string;
  title: string;
  summary: string;
  source: string;
  imageUrl: string;
  externalUrl: string;
  reward: number;
  order: number;
  active: boolean;
}

const emptyNews = { title: "", summary: "", source: "", imageUrl: "", externalUrl: "", reward: 0.05, order: 0, active: true };

export default function AdminNews() {
  const [news, setNews] = useState<News[]>([]);
  const [editing, setEditing] = useState<News | typeof emptyNews | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return onValue(ref(db, "news"), (snap) => {
      const data = snap.val() ?? {};
      setNews(Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v })).sort((a, b) => a.order - b.order));
    });
  }, []);

  const save = async () => {
    if (!editing || !editing.title || !editing.externalUrl) return;
    const e = editing as any;
    if (e.id) { const { id, ...rest } = e; await set(ref(db, `news/${id}`), rest); }
    else { await push(ref(db, "news"), e); }
    setEditing(null);
    setShowForm(false);
  };

  const e = editing as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Notícias ({news.length})</h2>
        <button onClick={() => { setEditing({ ...emptyNews }); setShowForm(true); }} data-testid="button-new-news" className="bg-[#FFD700] text-black text-xs font-bold px-4 py-2 rounded-full">+ Nova</button>
      </div>

      {showForm && e && (
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
          <h3 className="text-white font-semibold text-sm">Nova notícia</h3>
          {["title", "summary"].map((field) => (
            <div key={field}>
              <label className="text-gray-400 text-xs capitalize">{field === "title" ? "Título *" : "Resumo"}</label>
              <input value={e[field]} onChange={(ev) => setEditing({ ...e, [field]: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
            </div>
          ))}
          <div>
            <label className="text-gray-400 text-xs">Fonte</label>
            <input value={e.source} onChange={(ev) => setEditing({ ...e, source: ev.target.value })} placeholder="G1, UOL..." className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Imagem URL</label>
            <input value={e.imageUrl} onChange={(ev) => setEditing({ ...e, imageUrl: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div>
            <label className="text-gray-400 text-xs">URL externa *</label>
            <input value={e.externalUrl} onChange={(ev) => setEditing({ ...e, externalUrl: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div className="flex gap-3">
            <div>
              <label className="text-gray-400 text-xs">Recompensa R$</label>
              <input type="number" step="0.01" value={e.reward} onChange={(ev) => setEditing({ ...e, reward: parseFloat(ev.target.value) })} className="w-24 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
            </div>
            <div>
              <label className="text-gray-400 text-xs">Ordem</label>
              <input type="number" value={e.order} onChange={(ev) => setEditing({ ...e, order: Number(ev.target.value) })} className="w-24 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
            </div>
            <label className="flex items-center gap-2 text-white text-sm self-end mb-2">
              <input type="checkbox" checked={e.active} onChange={(ev) => setEditing({ ...e, active: ev.target.checked })} className="accent-[#FFD700]" />
              Ativa
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={save} data-testid="button-save-news" className="flex-1 bg-[#FFD700] text-black font-bold py-2.5 rounded-xl text-sm">Salvar</button>
            <button onClick={() => { setEditing(null); setShowForm(false); }} className="flex-1 bg-[#2a2a2a] text-white font-semibold py-2.5 rounded-xl text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {news.length === 0 && !showForm && (
        <p className="text-gray-500 text-sm text-center py-8">Nenhuma notícia cadastrada.</p>
      )}

      <div className="space-y-2">
        {news.map((n) => (
          <div key={n.id} data-testid={`news-item-${n.id}`} className="bg-[#1e1e1e] rounded-2xl p-3 border border-[#2a2a2a] flex gap-3">
            {n.imageUrl && <img src={n.imageUrl} alt="" className="w-12 h-10 object-cover rounded-lg flex-shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{n.title}</p>
              <p className="text-gray-500 text-xs">{n.source} • R$ {n.reward?.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(n); setShowForm(true); }} className="text-blue-400">✏</button>
              <button onClick={() => remove(ref(db, `news/${n.id}`))} className="text-red-400">🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
