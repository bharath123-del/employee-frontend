import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const COLORS = {
  primary: "#0ea5e9",
  primaryDark: "#0369a1",
  slate: "#64748b",
  emerald: "#059669",
  amber: "#d97706",
  violet: "#7c3aed",
  rose: "#e11d48",
};

const PIE_COLORS = [COLORS.emerald, COLORS.slate];

function formatMoney(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatMoneyFull(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Dashboard() {
  const { isAdmin, employeeCode } = useAuth();
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const [summaryRes, listRes] = await Promise.all([
          api.get("/employees/stats/summary"),
          api.get("/employees"),
        ]);
        if (!cancelled) {
          setStats(summaryRes.data);
          setEmployees(listRes.data);
        }
      } catch {
        if (!cancelled) setErr("Could not load dashboard data.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const insights = useMemo(() => {
    if (!employees.length) return null;
    const withPf = employees.filter((e) => e.pf_detail).length;
    const withoutPf = employees.length - withPf;
    const salaries = employees.map((e) => e.salary).filter((s) => s != null);
    const salaryCount = salaries.length;
    const totalSalary = salaries.reduce((a, b) => a + b, 0);
    const avgSalary = salaryCount ? totalSalary / salaryCount : 0;

    const byYear = {};
    employees.forEach((e) => {
      const y = e.joining_date?.slice(0, 4);
      if (y) byYear[y] = (byYear[y] || 0) + 1;
    });
    const hiresByYear = Object.entries(byYear)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, count]) => ({ year, count }));

    const salaryBands = [
      { band: "< ₹90k", count: 0 },
      { band: "₹90–110k", count: 0 },
      { band: "₹110–130k", count: 0 },
      { band: "> ₹130k", count: 0 },
    ];
    employees.forEach((e) => {
      const s = e.salary;
      if (s == null) return;
      if (s < 90000) salaryBands[0].count += 1;
      else if (s < 110000) salaryBands[1].count += 1;
      else if (s < 130000) salaryBands[2].count += 1;
      else salaryBands[3].count += 1;
    });

    const topPf = [...employees]
      .filter((e) => e.pf_detail)
      .sort((a, b) => b.pf_detail.pf_balance - a.pf_detail.pf_balance)
      .slice(0, 8)
      .map((e) => ({
        label: e.name.length > 14 ? `${e.name.slice(0, 12)}…` : e.name,
        balance: e.pf_detail.pf_balance,
      }));

    const recent = [...employees]
      .sort((a, b) => (b.joining_date || "").localeCompare(a.joining_date || ""))
      .slice(0, 5);

    const avgPfPerEmployee =
      withPf > 0
        ? employees.filter((e) => e.pf_detail).reduce((sum, e) => sum + e.pf_detail.pf_balance, 0) / withPf
        : 0;

    return {
      withPf,
      withoutPf,
      totalSalary,
      avgSalary,
      salaryCount,
      hiresByYear,
      salaryBands,
      topPf,
      recent,
      avgPfPerEmployee,
    };
  }, [employees]);

  if (!isAdmin) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-brand-50 p-8 shadow-sm">
        <div className="relative z-10 max-w-lg space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
          <p className="text-slate-600">
            View your employment record and provident fund details in one place.
          </p>
          <Link
            to="/profile"
            className="inline-flex rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-md shadow-brand-600/25 transition hover:bg-brand-700"
          >
            Open my profile
          </Link>
          {employeeCode && (
            <p className="text-sm text-slate-500">
              Your employee ID:{" "}
              <span className="font-mono font-semibold text-slate-800">{employeeCode}</span>
            </p>
          )}
        </div>
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand-200/40 blur-3xl"
          aria-hidden
        />
      </div>
    );
  }

  const pieData = insights
    ? [
        { name: "PF on file", value: insights.withPf },
        { name: "No PF yet", value: insights.withoutPf },
      ]
    : [];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-600 to-sky-800 px-6 py-8 text-white shadow-lg sm:px-10 sm:py-10">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-brand-100">Employee Hub</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
            <p className="mt-2 max-w-xl text-sm text-brand-100 sm:text-base">
              Workforce overview, payroll snapshot, PF health, and hiring trends — updated from live
              data.
            </p>
          </div>
          <Link
            to="/employees"
            className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-md transition hover:bg-brand-50"
          >
            Manage employees
          </Link>
        </div>
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-sky-400/20 blur-3xl"
          aria-hidden
        />
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {err}
        </div>
      )}

      {/* KPI row */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Headcount
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{stats.employee_count}</p>
                <p className="mt-1 text-xs text-slate-500">Active employee records</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total PF corpus
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-700 sm:text-3xl">
                  {formatMoneyFull(stats.total_pf_balance)}
                </p>
                <p className="mt-1 text-xs text-slate-500">Sum of all PF balances</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Monthly payroll
                </p>
                <p className="mt-2 text-2xl font-bold text-violet-700 sm:text-3xl">
                  {insights?.salaryCount ? formatMoney(insights.totalSalary) : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">Sum of listed salaries (est.)</p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-amber-200 hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Avg salary
                </p>
                <p className="mt-2 text-2xl font-bold text-amber-700 sm:text-3xl">
                  {insights?.salaryCount ? formatMoney(insights.avgSalary) : "—"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  PF on file: {stats.employees_with_pf} · Avg PF:{" "}
                  {insights && insights.avgPfPerEmployee
                    ? formatMoney(insights.avgPfPerEmployee)
                    : "—"}
                </p>
              </div>
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
      )}

      {insights && employees.length > 0 && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">PF coverage</h2>
              <p className="mt-1 text-sm text-slate-500">
                Share of employees with a PF record on file.
              </p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={88}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [v, "Employees"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">Hires by year</h2>
              <p className="mt-1 text-sm text-slate-500">Joining dates grouped by calendar year.</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insights.hiresByYear} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                      }}
                    />
                    <Bar dataKey="count" name="Hires" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">Salary distribution</h2>
              <p className="mt-1 text-sm text-slate-500">Headcount by salary band (₹ / month).</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={insights.salaryBands}
                    margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="band"
                      width={100}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar dataKey="count" name="Employees" fill={COLORS.violet} radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">Top PF balances</h2>
              <p className="mt-1 text-sm text-slate-500">Largest PF corpus by employee (top 8).</p>
              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={insights.topPf} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip formatter={(v) => formatMoneyFull(v)} />
                    <Bar dataKey="balance" name="PF balance" fill={COLORS.emerald} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Recent joiners</h2>
                <p className="text-sm text-slate-500">Latest employees by joining date.</p>
              </div>
              <Link
                to="/employees"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View all →
              </Link>
            </div>
            <ul className="divide-y divide-slate-100">
              {insights.recent.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
                  <div>
                    <Link
                      to={`/employees/${e.id}`}
                      className="font-medium text-brand-700 hover:underline"
                    >
                      {e.name}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {e.employee_id} · {e.email}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <span className="font-medium text-slate-800">{e.joining_date}</span>
                    {e.salary != null && (
                      <p className="text-xs text-slate-500">₹ {formatMoney(e.salary)} / mo</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
