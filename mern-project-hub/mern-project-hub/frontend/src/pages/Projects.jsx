import React, { useEffect, useState } from "react";
import { Plus, Trash2, Github, Youtube, Linkedin, ExternalLink, Check } from "lucide-react";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { format } from "date-fns";

const emptyForm = {
  name: "", description: "", skills: "", projectLink: "", githubLink: "",
  youtubeLink: "", linkedinLink: "", githubRepo: "", startDate: "", deadline: "", status: "not-started",
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [expanded, setExpanded] = useState(null);
  const [milestoneInput, setMilestoneInput] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => api.get("/projects").then(({ data }) => setProjects(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/projects", { ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean) });
    setForm(emptyForm);
    setOpen(false);
    load();
  };

  const remove = async (id) => { await api.delete(`/projects/${id}`); load(); };
  const updateStatus = async (id, status) => { await api.put(`/projects/${id}`, { status }); load(); };

  const addMilestone = async (id) => {
    if (!milestoneInput.trim()) return;
    await api.post(`/projects/${id}/milestones`, { title: milestoneInput });
    setMilestoneInput("");
    load();
  };

  const toggleMilestone = async (projectId, milestoneId) => {
    await api.patch(`/projects/${projectId}/milestones/${milestoneId}/toggle`);
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="label-eyebrow">build queue</p>
          <h1 className="font-display text-2xl font-semibold mt-1">Projects</h1>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setOpen(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {loading ? (
        <p className="text-base-50/40 font-mono text-sm">loading...</p>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <div key={p._id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 cursor-pointer" onClick={() => setExpanded(expanded === p._id ? null : p._id)}>
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{p.name}</h3>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="text-sm text-base-50/50 mt-1">{p.description}</p>
                  {p.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.skills.map((s) => (
                        <span key={s} className="text-[11px] font-mono bg-base-700 px-2 py-0.5 rounded-full text-base-50/60">{s}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-base-50/40">
                    {p.githubLink && <a href={p.githubLink} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} className="hover:text-signal-cyan"><Github size={15} /></a>}
                    {p.youtubeLink && <a href={p.youtubeLink} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} className="hover:text-signal-rose"><Youtube size={15} /></a>}
                    {p.linkedinLink && <a href={p.linkedinLink} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} className="hover:text-signal-cyan"><Linkedin size={15} /></a>}
                    {p.projectLink && <a href={p.projectLink} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} className="hover:text-signal-green"><ExternalLink size={15} /></a>}
                    {p.deadline && <span className="text-xs font-mono ml-2">due {format(new Date(p.deadline), "MMM d, yyyy")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={p.status} onChange={(e) => updateStatus(p._id, e.target.value)} className="input-field !w-auto text-xs py-1">
                    {["not-started", "running", "completed", "on-hold"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => remove(p._id)} className="text-base-50/30 hover:text-signal-rose"><Trash2 size={15} /></button>
                </div>
              </div>

              {expanded === p._id && (
                <div className="mt-4 pt-4 border-t border-base-600/40">
                  <p className="label-eyebrow mb-2">milestones</p>
                  <div className="space-y-1.5 mb-3">
                    {p.milestones?.map((m) => (
                      <div key={m._id} className="flex items-center gap-2 text-sm">
                        <button
                          onClick={() => toggleMilestone(p._id, m._id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center ${m.completed ? "bg-signal-green border-signal-green" : "border-base-600"}`}
                        >
                          {m.completed && <Check size={11} className="text-base-900" />}
                        </button>
                        <span className={m.completed ? "line-through text-base-50/40" : ""}>{m.title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="input-field text-sm" placeholder="Add milestone"
                      value={milestoneInput} onChange={(e) => setMilestoneInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMilestone(p._id)}
                    />
                    <button className="btn-ghost text-sm" onClick={() => addMilestone(p._id)}>Add</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {!projects.length && <p className="text-base-50/40">No projects yet.</p>}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="New Project">
        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="Project name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="input-field" placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <input className="input-field" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <input className="input-field" placeholder="Project (live) link" value={form.projectLink} onChange={(e) => setForm({ ...form, projectLink: e.target.value })} />
          <input className="input-field" placeholder="GitHub link" value={form.githubLink} onChange={(e) => setForm({ ...form, githubLink: e.target.value })} />
          <input className="input-field" placeholder="GitHub repo (owner/repo) - for live sync" value={form.githubRepo} onChange={(e) => setForm({ ...form, githubRepo: e.target.value })} />
          <input className="input-field" placeholder="YouTube link" value={form.youtubeLink} onChange={(e) => setForm({ ...form, youtubeLink: e.target.value })} />
          <input className="input-field" placeholder="LinkedIn link" value={form.linkedinLink} onChange={(e) => setForm({ ...form, linkedinLink: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-eyebrow">start date</label>
              <input type="date" className="input-field" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label-eyebrow">deadline</label>
              <input type="date" className="input-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            </div>
          </div>
          <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {["not-started", "running", "completed", "on-hold"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn-primary w-full">Save project</button>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
