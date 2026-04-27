import { useEffect, useState } from "react";
import { ref, onValue, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    return onValue(ref(db, "notifications"), (snap) => {
      const data = snap.val() ?? {};
      const list = Object.entries(data)
        .map(([id, v]: [string, any]) => ({ id, ...v }))
        .sort((a, b) => b.timestamp - a.timestamp);
      setNotifications(list);
    });
  }, []);

  const send = async () => {
    if (!title.trim()) return;
    await push(ref(db, "notifications"), { title, body, timestamp: Date.now() });
    setTitle("");
    setBody("");
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">Notificações ({notifications.length})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          data-testid="button-new-notification"
          className="bg-[#FFD700] text-black text-xs font-bold px-4 py-2 rounded-full"
        >
          + Enviar
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1e1e1e] rounded-2xl p-4 border border-[#2a2a2a] space-y-3">
          <div>
            <label className="text-gray-400 text-xs">Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="input-notif-title"
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700]"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs">Mensagem</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              data-testid="input-notif-body"
              rows={3}
              className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded-xl px-3 py-2 text-white text-sm mt-1 outline-none focus:border-[#FFD700] resize-none"
            />
          </div>
          <button
            onClick={send}
            data-testid="button-send-notification"
            className="w-full bg-[#FFD700] text-black font-bold py-2.5 rounded-xl text-sm"
          >
            Enviar notificação
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">Nenhuma notificação enviada ainda.</p>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div key={n.id} data-testid={`notif-${n.id}`} className="bg-[#1e1e1e] rounded-2xl p-3 border border-[#2a2a2a]">
              <p className="text-white text-sm font-semibold">{n.title}</p>
              {n.body && <p className="text-gray-400 text-xs mt-0.5">{n.body}</p>}
              <p className="text-gray-600 text-[10px] mt-1">{formatDate(n.timestamp)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
