import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function EmployeeProfile() {
  const [emp, setEmp] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/employees/me");
        if (!cancelled) setEmp(data);
      } catch {
        if (!cancelled) setError("Could not load your profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!emp) return null;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">My profile</h1>
      <ProfileBody emp={emp} readOnly />
    </div>
  );
}

export function ProfileBody({ emp, readOnly }) {
  const pf = emp.pf_detail;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Personal</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Employee ID</dt>
            <dd className="font-mono font-medium">{emp.employee_id}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium">{emp.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd>{emp.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Phone</dt>
            <dd>{emp.phone}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Address</dt>
            <dd className="whitespace-pre-wrap">{emp.address}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Joining date</dt>
            <dd>{emp.joining_date}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Salary</dt>
            <dd>
              {emp.salary != null
                ? emp.salary.toLocaleString(undefined, { minimumFractionDigits: 2 })
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Last updated</dt>
            <dd className="text-slate-600">{new Date(emp.updated_at).toLocaleString()}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Provident fund</h2>
        {pf ? (
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">PF number</dt>
              <dd className="font-mono">{pf.pf_number}</dd>
            </div>
            <div>
              <dt className="text-slate-500">UAN</dt>
              <dd className="font-mono">{pf.uan}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Balance</dt>
              <dd className="text-lg font-semibold text-brand-700">
                {Number(pf.pf_balance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-4 text-slate-500">
            {readOnly ? "No PF record on file yet." : "No PF record yet — add one below."}
          </p>
        )}
      </section>
    </div>
  );
}
