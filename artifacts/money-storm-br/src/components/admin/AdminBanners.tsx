import { useEffect, useState } from "react";
import { ref, onValue, push, set, remove } from "firebase/database";
import { db } from "@/lib/firebase";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  destUrl: string;
  order: number;
  active: boolean;
  newTab: boolean;
  featured: boolean;
}

const emptyBanner = { title: "", imageUrl: "", destUrl: "", order: 0, active: true, newTab: true, featured: false };

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | typeof emptyBanner | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return onValue(ref(db, "banners"), (snap) => {
      const data = snap.val() ?? {};
      setBanners(Object.entries(data).map(([id, v]: [string, any]) => ({ id, ...v })).sort((a, b) => a.order - b.order));
    });
  }, []);

  const save = async () => {
    if (!editing || !editing.title) return;
    const e = editing as any;
    if (e.id) {
      const { id, ...rest } = e;
      await set(ref(db, `banners/${id}`), rest);
    } else {
      await push(ref(db, "banners"), e);
    }
    setEditing(null);
    setShowForm(false);
  };

  const e = editing as any;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Banners ({banners.length})</h2>
        <button onClick={() => { setEditing({ ...emptyBanner }); setShowForm(true); }} data-testid="button-new-banner" className="bg-[#FFD700] text-black text-xs font-bold px-4 py-2 rounded-full">+ Novo</button>
      </div>

      {showForm && e && (
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
          <h3 className="text-white font-semibold text-sm">{e.id ? "Editar" : "Novo"} banner</h3>
          <div>
            <label className="text-gray-400 text-xs">Título / legenda *</label>
            <input value={e.title} onChange={(ev) => setEditing({ ...e, title: ev.target.value })} className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Imagem URL *</label>
            <input value={e.imageUrl} onChange={(ev) => setEditing({ ...e, imageUrl: ev.target.value })} placeholder="https://..." className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          {e.imageUrl && <img src={e.imageUrl} alt="" className="w-full h-24 object-cover rounded-xl" />}
          <div>
            <label className="text-gray-400 text-xs">URL de destino</label>
            <input value={e.destUrl} onChange={(ev) => setEditing({ ...e, destUrl: ev.target.value })} placeholder="https://..." className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]" />
          </div>
          <div className="flex gap-3 items-end">
            <div>
              <label className="text-gray-400 text-xs">Ordem no carrossel</label>
              <input type="number" value={e.order} onChange={(ev) => setEditing({ ...e, order: Number(ev.target.value) })} className="w-24 bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none" />
            </div>
            <div className="flex gap-4 pb-2">
              {["active", "newTab", "featured"].map((field) => (
                <label key={field} className="flex items-center gap-2 text-white text-sm">
                  <input type="checkbox" checked={!!e[field]} onChange={(ev) => setEditing({ ...e, [field]: ev.target.checked })} className="accent-[#FFD700]" />
                  {field === "active" ? "Ativo" : field === "newTab" ? "Nova aba" : "Destaque"}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={save} data-testid="button-save-banner" className="flex-1 bg-[#FFD700] text-black font-bold py-2.5 rounded-xl text-sm">Salvar Banner</button>
            <button onClick={() => { setEditing(null); setShowForm(false); }} className="flex-1 bg-[#2a2a2a] text-white font-semibold py-2.5 rounded-xl text-sm">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {banners.map((b) => (
          <div key={b.id} data-testid={`banner-item-${b.id}`} className="bg-[#1e1e1e] rounded-2xl overflow-hidden border border-[#2a2a2a]">
            {b.imageUrl && <img src={b.imageUrl} alt={b.title} className="w-full h-20 object-cover" />}
            <div className="p-3 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-semibold">{b.title}</p>
                <p className="text-gray-500 text-xs">Ordem: {b.order} • {b.newTab ? "external" : "internal"} {b.featured ? "★" : ""}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(b); setShowForm(true); }} data-testid={`edit-banner-${b.id}`} className="text-blue-400">✏</button>
                <button onClick={() => remove(ref(db, `banners/${b.id}`))} data-testid={`del-banner-${b.id}`} className="text-red-400">🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
