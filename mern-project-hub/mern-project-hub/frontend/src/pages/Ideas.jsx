import React, { useEffect, useState } from "react";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const emptyForm = { name: "", description: "", status: "backlog", photoUrl: "", fileUrl: "", referenceLink: "" };

const Ideas = () => {
  const [ideas, setIdeas] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/ideas").then(({ data }) => setIdeas(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/ideas", form);
    setForm(emptyForm);
    setOpen(false);
    load();
  };

  const remove = async (id) => {
    await api.delete(`/ideas/${id}`);
    load();
  };

  const updateStatus = async (id, status) => {
    await api.put(`/ideas/${id}`, { status });
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="label-eyebrow">idea pipeline</p>
          <h1 className="font-display text-2xl font-semibold mt-1">Ideas</h1>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setOpen(true)}>
          <Plus size={16} /> New Idea
        </button>
      </div>

      {loading ? (
        <p className="text-base-50/40 font-mono text-sm">loading...</p>
      ) : ideas.length === 0 ? (
        <p className="text-base-50/40">No ideas yet — capture your first one.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <div key={idea._id} className="card p-4 flex flex-col">
              {idea.photoUrl && (
                <img src={idea.photoUrl} alt={idea.name} className="rounded-lg h-32 w-full object-cover mb-3" />
              )}
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{idea.name}</h3>
                <button onClick={() => remove(idea._id)} className="text-base-50/30 hover:text-signal-rose">
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="text-sm text-base-50/50 mt-1 flex-1">{idea.description}</p>
              <div className="flex items-center justify-between mt-3">
                <select
                  value={idea.status}
                  onChange={(e) => updateStatus(idea._id, e.target.value)}
                  className="input-field !w-auto text-xs py-1"
                >
                  {["backlog", "exploring", "in-progress", "parked", "converted"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {idea.referenceLink && (
                  <a href={idea.referenceLink} target="_blank" rel="noreferrer" className="text-signal-cyan">
                    <LinkIcon size={15} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Idea">
        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="Idea name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="input-field" placeholder="Description" rows={3}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input-field" placeholder="Photo URL"
            value={form.photoUrl} onChange={(e) => setForm({ ...form, photoUrl: e.target.value })} />
          <input className="input-field" placeholder="File URL (e.g. Drive link)"
            value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} />
          <input className="input-field" placeholder="Reference link"
            value={form.referenceLink} onChange={(e) => setForm({ ...form, referenceLink: e.target.value })} />
          <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {["backlog", "exploring", "in-progress", "parked", "converted"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button className="btn-primary w-full">Save idea</button>
        </form>
      </Modal>
    </div>
  );
};

export default Ideas;
