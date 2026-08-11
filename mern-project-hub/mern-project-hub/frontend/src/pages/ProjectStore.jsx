import React, { useEffect, useState } from "react";
import { Plus, Trash2, ExternalLink, Linkedin } from "lucide-react";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";

const emptyForm = { name: "", description: "", deployedLink: "", linkedinLink: "", processType: "personal" };

const ProjectStore = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/project-store").then(({ data }) => setItems(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/project-store", form);
    setForm(emptyForm);
    setOpen(false);
    load();
  };

  const remove = async (id) => { await api.delete(`/project-store/${id}`); load(); };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="label-eyebrow">shipped work</p>
          <h1 className="font-display text-2xl font-semibold mt-1">Project Store</h1>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setOpen(true)}>
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {loading ? (
        <p className="text-base-50/40 font-mono text-sm">loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <div key={it._id} className="card p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-medium">{it.name}</h3>
                <button onClick={() => remove(it._id)} className="text-base-50/30 hover:text-signal-rose"><Trash2 size={15} /></button>
              </div>
              <p className="text-sm text-base-50/50 mt-1">{it.description}</p>
              <span className="text-[11px] font-mono bg-base-700 px-2 py-0.5 rounded-full text-base-50/60 inline-block mt-2">{it.processType}</span>
              <div className="flex items-center gap-3 mt-3 text-base-50/40">
                {it.deployedLink && <a href={it.deployedLink} target="_blank" rel="noreferrer" className="hover:text-signal-green flex items-center gap-1 text-xs"><ExternalLink size={14} /> live</a>}
                {it.linkedinLink && <a href={it.linkedinLink} target="_blank" rel="noreferrer" className="hover:text-signal-cyan flex items-center gap-1 text-xs"><Linkedin size={14} /> post</a>}
              </div>
            </div>
          ))}
          {!items.length && <p className="text-base-50/40">No shipped projects yet.</p>}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add to Project Store">
        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="Project name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="input-field" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input-field" placeholder="Deployed link" value={form.deployedLink} onChange={(e) => setForm({ ...form, deployedLink: e.target.value })} />
          <input className="input-field" placeholder="LinkedIn post link" value={form.linkedinLink} onChange={(e) => setForm({ ...form, linkedinLink: e.target.value })} />
          <select className="input-field" value={form.processType} onChange={(e) => setForm({ ...form, processType: e.target.value })}>
            {["client-work", "personal", "open-source", "freelance", "learning"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-primary w-full">Save</button>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectStore;
