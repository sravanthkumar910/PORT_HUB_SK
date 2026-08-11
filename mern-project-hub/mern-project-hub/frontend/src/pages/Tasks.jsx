import React, { useEffect, useState } from "react";
import { Plus, Trash2, CalendarPlus } from "lucide-react";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { format } from "date-fns";

const emptyForm = { name: "", deadline: "", timing: "", status: "pending" };

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);

  const load = () => api.get("/tasks").then(({ data }) => setTasks(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/tasks", form);
    setForm(emptyForm);
    setOpen(false);
    load();
  };

  const remove = async (id) => { await api.delete(`/tasks/${id}`); load(); };
  const updateStatus = async (id, status) => { await api.put(`/tasks/${id}`, { status }); load(); };

  const syncToCalendar = async (id) => {
    setSyncing(id);
    try {
      await api.post(`/integrations/google/calendar/sync-task/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Connect Google Calendar in Settings first");
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="label-eyebrow">daily life</p>
          <h1 className="font-display text-2xl font-semibold mt-1">Daily Tasks</h1>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setOpen(true)}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {loading ? (
        <p className="text-base-50/40 font-mono text-sm">loading...</p>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t._id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-xs text-base-50/40 font-mono mt-0.5">
                  {t.deadline ? format(new Date(t.deadline), "MMM d, yyyy") : "no deadline"} {t.timing && `· ${t.timing}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <select value={t.status} onChange={(e) => updateStatus(t._id, e.target.value)} className="input-field !w-auto text-xs py-1">
                  {["pending", "in-progress", "completed", "missed"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                  onClick={() => syncToCalendar(t._id)}
                  disabled={!!t.googleCalendarEventId || syncing === t._id}
                  title={t.googleCalendarEventId ? "Already synced to Google Calendar" : "Sync to Google Calendar"}
                  className={`text-base-50/40 hover:text-signal-cyan ${t.googleCalendarEventId ? "text-signal-green" : ""}`}
                >
                  <CalendarPlus size={16} />
                </button>
                <button onClick={() => remove(t._id)} className="text-base-50/30 hover:text-signal-rose"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
          {!tasks.length && <p className="text-base-50/40">No daily tasks yet.</p>}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Daily Task">
        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="Task name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="label-eyebrow">deadline</label>
            <input type="date" className="input-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <input className="input-field" placeholder="Timing (e.g. 9:00 AM - 10:00 AM)" value={form.timing} onChange={(e) => setForm({ ...form, timing: e.target.value })} />
          <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {["pending", "in-progress", "completed", "missed"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-primary w-full">Save task</button>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
