import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";

const empty = {
  employee_id: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  joining_date: "",
  salary: "",
  portal_username: "",
  portal_password: "",
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id && id !== "new");
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get(`/employees/${id}`);
        if (cancelled) return;
        setForm({
          employee_id: data.employee_id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          joining_date: data.joining_date,
          salary: data.salary != null ? String(data.salary) : "",
          portal_username: "",
          portal_password: "",
        });
      } catch {
        if (!cancelled) setError("Could not load employee.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = {
      employee_id: form.employee_id,
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      joining_date: form.joining_date,
      salary: form.salary === "" ? null : Number(form.salary),
    };
    if (!isEdit) {
      if (form.portal_username) {
        payload.portal_username = form.portal_username;
        payload.portal_password = form.portal_password || undefined;
      }
    }
    try {
      if (isEdit) {
        const body = { ...payload };
        delete body.portal_username;
        delete body.portal_password;
        await api.put(`/employees/${id}`, body);
        navigate(`/employees/${id}`, { replace: true });
      } else {
        const { data } = await api.post("/employees", payload);
        navigate(`/employees/${data.id}`, { replace: true });
      }
    } catch (err) {
      const d = err.response?.data?.detail;
      if (Array.isArray(d)) {
        setError(d.map((x) => x.msg || JSON.stringify(x)).join("; "));
      } else if (typeof d === "string") {
        setError(d);
      } else {
        setError("Save failed.");
      }
    }
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to={isEdit ? `/employees/${id}` : "/employees"} className="text-sm text-brand-600 hover:underline">
          ← Cancel
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {isEdit ? "Edit employee" : "Add employee"}
        </h1>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Employee ID (code)</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.employee_id}
              onChange={(e) => set("employee_id", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Phone</label>
            <input
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm font-medium text-slate-700">Address</label>
            <textarea
              required
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Joining date</label>
            <input
              type="date"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.joining_date}
              onChange={(e) => set("joining_date", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Salary (optional)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={form.salary}
              onChange={(e) => set("salary", e.target.value)}
            />
          </div>
        </div>

        {!isEdit && (
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-medium text-slate-800">Employee portal (optional)</p>
            <p className="text-xs text-slate-500">Creates login so they can view their own data.</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm text-slate-700">Portal username</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.portal_username}
                  onChange={(e) => set("portal_username", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-slate-700">Portal password (min 6)</label>
                <input
                  type="password"
                  minLength={6}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  value={form.portal_password}
                  onChange={(e) => set("portal_password", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white hover:bg-brand-700"
        >
          {isEdit ? "Save changes" : "Create employee"}
        </button>
      </form>
    </div>
  );
}
