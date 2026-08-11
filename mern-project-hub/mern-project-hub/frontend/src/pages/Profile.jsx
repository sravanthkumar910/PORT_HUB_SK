import React, { useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "", title: user?.title || "", bio: user?.bio || "",
    skills: user?.skills?.join(", ") || "", avatarUrl: user?.avatarUrl || "",
  });
  const [saved, setSaved] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/account/profile", {
      ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setUser(data);
    localStorage.setItem("ph_user", JSON.stringify(data));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-xl">
      <p className="label-eyebrow">your identity</p>
      <h1 className="font-display text-2xl font-semibold mt-1 mb-6">Profile</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-full bg-signal-violet/20 flex items-center justify-center text-signal-violet font-display text-xl">
            {form.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-medium">{user?.email}</p>
            <p className="text-xs text-base-50/40 font-mono">member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input className="input-field" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input-field" placeholder="Title (e.g. Full Stack Developer)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className="input-field" placeholder="Bio" rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <input className="input-field" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <input className="input-field" placeholder="Avatar URL" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
          <button className="btn-primary w-full">{saved ? "Saved ✓" : "Save profile"}</button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
