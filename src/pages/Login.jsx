import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

function formatApiError(err) {
  if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
    return "Cannot reach the API. Start the backend from employee-backend (e.g. conda activate employee-backend, then python main.py) so it listens on port 8000.";
  }
  const d = err.response?.data?.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join("; ");
  return "Something went wrong.";
}

export default function Login() {
  const { login, registerFirstAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/setup-status");
        if (!cancelled) setRegistrationOpen(Boolean(data.registration_open));
      } catch {
        if (!cancelled) setRegistrationOpen(false);
      } finally {
        if (!cancelled) setStatusLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerFirstAdmin(username, password, confirmPassword);
      navigate("/", { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === "register";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-slate-900">
          {isRegister ? "Create admin account" : "Sign in"}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {isRegister
            ? "No users exist yet. Register the first administrator (you can use an email as your username if you like)."
            : "Employee Data Management"}
        </p>

        {statusLoaded && !registrationOpen && !isRegister && (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Sign in with the <strong>username</strong> stored for your account (from first-time registration or{" "}
            <code className="rounded bg-slate-200 px-1">BOOTSTRAP_ADMIN_USERNAME</code> in <code className="rounded bg-slate-200 px-1">.env</code>
            ). It does not have to be an email.
          </p>
        )}

        <form onSubmit={isRegister ? handleRegister : handleLogin} className="mt-8 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">Username</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="e.g. admin or you@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 6 : 1}
              required
            />
            {isRegister && <p className="mt-1 text-xs text-slate-500">At least 6 characters.</p>}
          </div>
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm password</label>
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={loading || (isRegister && !registrationOpen)}
            className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-60"
          >
            {loading ? "Please wait…" : isRegister ? "Register & continue" : "Sign in"}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 border-t border-slate-100 pt-6 text-center text-sm">
          {registrationOpen ? (
            <>
              {isRegister ? (
                <button
                  type="button"
                  className="font-medium text-brand-600 hover:underline"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setConfirmPassword("");
                  }}
                >
                  Already have an account? Sign in
                </button>
              ) : (
                <button
                  type="button"
                  className="font-medium text-brand-600 hover:underline"
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                >
                  First time? Create admin account
                </button>
              )}
            </>
          ) : (
            <p className="text-slate-500">Registration is closed — an admin account already exists.</p>
          )}
        </div>
      </div>
    </div>
  );
}
