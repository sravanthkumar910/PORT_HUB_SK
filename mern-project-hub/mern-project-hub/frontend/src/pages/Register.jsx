import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        <p className="label-eyebrow mb-6">create your control room</p>

        <form onSubmit={submit} className="space-y-3">
          <input
            className="input-field" placeholder="Full name" required
            value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="input-field" type="email" placeholder="Email" required
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input-field" type="password" placeholder="Password (min 6 chars)" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-signal-rose text-sm">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <p className="text-sm text-base-50/50 mt-5 text-center">
          Already have an account? <Link to="/login" className="text-signal-cyan">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
