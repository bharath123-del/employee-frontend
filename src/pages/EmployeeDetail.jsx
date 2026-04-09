import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api.js";
import { ProfileBody } from "./EmployeeProfile.jsx";

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emp, setEmp] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pfForm, setPfForm] = useState({ pf_number: "", uan: "", pf_balance: "" });
  const [pfMsg, setPfMsg] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/employees/${id}`);
      setEmp(data);
    } catch {
      setError("Employee not found or access denied.");
      setEmp(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this employee and linked portal user / PF?")) return;
    try {
      await api.delete(`/employees/${id}`);
      navigate("/employees", { replace: true });
    } catch {
      setError("Could not delete employee.");
    }
  }

  async function handleAddPf(e) {
    e.preventDefault();
    setPfMsg("");
    try {
      await api.post("/pf", {
        employee_id: emp.employee_id,
        pf_number: pfForm.pf_number,
        uan: pfForm.uan,
        pf_balance: Number(pfForm.pf_balance) || 0,
      });
      setPfMsg("PF record saved.");
      load();
    } catch (err) {
      const d = err.response?.data?.detail;
      setPfMsg(typeof d === "string" ? d : "Could not save PF.");
    }
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error && !emp) return <p className="text-red-600">{error}</p>;
  if (!emp) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link to="/employees" className="text-sm font-medium text-brand-600 hover:underline">
            ← Back to list
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{emp.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/employees/${id}/edit`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ProfileBody emp={emp} readOnly={false} />

      {!emp.pf_detail && (
        <section className="rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Add PF details</h2>
          <form onSubmit={handleAddPf} className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-600">PF number</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={pfForm.pf_number}
                onChange={(e) => setPfForm((f) => ({ ...f, pf_number: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">UAN</label>
              <input
                required
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={pfForm.uan}
                onChange={(e) => setPfForm((f) => ({ ...f, uan: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600">Balance</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={pfForm.pf_balance}
                onChange={(e) => setPfForm((f) => ({ ...f, pf_balance: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Save PF
              </button>
              {pfMsg && <span className="ml-3 text-sm text-slate-600">{pfMsg}</span>}
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
