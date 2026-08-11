import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-sm p-7">
        <div className="flex items-center gap-2 mb-1">
          <span className="status-dot bg-signal-cyan shadow-[0_0_8px_2px_rgba(79,209,232,0.6)]" />
          <span className="font-display font-semibold text-lg">Project Hub</span>
        </div>
        <p className="label-eyebrow mb-6">sign in to your control room</p>

        <form onSubmit={submit} className="space-y-3">
          <input
            className="input-field" type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input-field" type="password" placeholder="Password" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-signal-rose text-sm">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-sm text-base-50/50 mt-5 text-center">
          No account? <Link to="/register" className="text-signal-cyan">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
