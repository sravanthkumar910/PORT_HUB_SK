import React, { useEffect, useState } from "react";
import { Github, Calendar as CalendarIcon, Check, X } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const Settings = () => {
  const { user, setUser } = useAuth();
  const [ghForm, setGhForm] = useState({ username: "", token: "" });
  const [status, setStatus] = useState("");
  const params = new URLSearchParams(window.location.search);

  useEffect(() => {
    if (params.get("google") === "connected") {
      api.get("/auth/me").then(({ data }) => setUser(data));
      setStatus("Google account connected");
    }
  }, []);

  const connectGithub = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/integrations/github/connect", ghForm);
      setUser({ ...user, integrations: { ...user.integrations, github: { connected: true, username: data.username } } });
      setStatus("GitHub connected");
    } catch (err) {
      setStatus(err.response?.data?.message || "Failed to connect GitHub");
    }
  };

  const disconnectGithub = async () => {
    await api.post("/integrations/github/disconnect");
    setUser({ ...user, integrations: { ...user.integrations, github: { connected: false } } });
  };

  const connectGoogle = async () => {
    const { data } = await api.get("/integrations/google/auth-url");
    window.location.href = data.url;
  };

  const disconnectGoogle = async () => {
    await api.post("/integrations/google/disconnect");
    setUser({ ...user, integrations: { ...user.integrations, google: { connected: false } } });
  };

  const updateSettings = async (patch) => {
    const { data } = await api.put("/account/settings", patch);
    setUser(data);
  };

  return (
    <div className="p-8 max-w-2xl space-y-6">
      <div>
        <p className="label-eyebrow">connections & preferences</p>
        <h1 className="font-display text-2xl font-semibold mt-1">Settings</h1>
      </div>

      {status && <p className="text-sm text-signal-cyan">{status}</p>}

      {/* GitHub */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Github size={18} />
          <h3 className="font-medium">GitHub</h3>
          {user?.integrations?.github?.connected ? (
            <span className="ml-auto text-xs font-mono text-signal-green flex items-center gap-1"><Check size={13}/> connected as {user.integrations.github.username}</span>
          ) : (
            <span className="ml-auto text-xs font-mono text-base-50/40 flex items-center gap-1"><X size={13}/> not connected</span>
          )}
        </div>

        {user?.integrations?.github?.connected ? (
          <button className="btn-ghost text-sm" onClick={disconnectGithub}>Disconnect</button>
        ) : (
          <form onSubmit={connectGithub} className="space-y-3">
            <input className="input-field" placeholder="GitHub username" required
              value={ghForm.username} onChange={(e) => setGhForm({ ...ghForm, username: e.target.value })} />
            <input className="input-field" placeholder="Personal access token" type="password" required
              value={ghForm.token} onChange={(e) => setGhForm({ ...ghForm, token: e.target.value })} />
            <p className="text-xs text-base-50/40">
              Create one at github.com/settings/tokens with repo + read:user scopes.
            </p>
            <button className="btn-primary text-sm">Connect GitHub</button>
          </form>
        )}
      </div>

      {/* Google */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CalendarIcon size={18} />
          <h3 className="font-medium">Google (Calendar + Drive)</h3>
          {user?.integrations?.google?.connected ? (
            <span className="ml-auto text-xs font-mono text-signal-green flex items-center gap-1"><Check size={13}/> connected as {user.integrations.google.email}</span>
          ) : (
            <span className="ml-auto text-xs font-mono text-base-50/40 flex items-center gap-1"><X size={13}/> not connected</span>
          )}
        </div>
        {user?.integrations?.google?.connected ? (
          <button className="btn-ghost text-sm" onClick={disconnectGoogle}>Disconnect</button>
        ) : (
          <button className="btn-primary text-sm" onClick={connectGoogle}>Connect Google account</button>
        )}
        <p className="text-xs text-base-50/40 mt-2">
          Grants read access to your Calendar and permission to upload files to your Drive.
        </p>
      </div>

      {/* Preferences */}
      <div className="card p-6">
        <h3 className="font-medium mb-4">Preferences</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm">Email notifications</span>
          <button
            onClick={() => updateSettings({ notifications: !user?.settings?.notifications })}
            className={`w-10 h-5 rounded-full relative transition ${user?.settings?.notifications ? "bg-signal-cyan" : "bg-base-600"}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-base-900 transition ${user?.settings?.notifications ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
