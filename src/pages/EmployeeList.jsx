import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";

function formatSalary(value) {
  if (value == null) return "—";
  return `₹ ${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default function EmployeeList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/employees", { params: q.trim() ? { q: q.trim() } : {} });
      setItems(data);
    } catch {
      setError("Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional search debounce via button
  }, []);

  const totalShown = items.length;
  const withSalary = items.filter((r) => r.salary != null).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-600">Search, open details, edit or remove records.</p>
        </div>
        <Link
          to="/employees/new"
          className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-brand-700"
        >
          Add employee
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Showing</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{totalShown}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">With salary on file</p>
          <p className="mt-1 text-xl font-bold text-brand-700">{withSalary}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">With PF record</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {items.filter((r) => r.pf_detail).length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          placeholder="Search name, email, or ID…"
          className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring-2"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-50"
        >
          Search
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Code</th>
                  <th className="whitespace-nowrap px-4 py-3">Name</th>
                  <th className="min-w-[200px] px-4 py-3">Email</th>
                  <th className="whitespace-nowrap px-4 py-3">Phone</th>
                  <th className="whitespace-nowrap px-4 py-3">Joined</th>
                  <th className="whitespace-nowrap px-4 py-3 text-right">Salary (mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{row.employee_id}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      <Link to={`/employees/${row.id}`} className="text-brand-700 hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-slate-600" title={row.email}>
                      {row.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.phone}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{row.joining_date}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-slate-900">
                      {formatSalary(row.salary)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-slate-500">No employees match your search.</p>
          )}
        </div>
      )}
    </div>
  );
}
