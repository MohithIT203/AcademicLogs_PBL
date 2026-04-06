import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

// ─── tiny helpers ─────────────────────────────────────────────────────────────

const fmt = (dt) => {
  const d = new Date(dt);
  return d.toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "2-digit",
    hour:   "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const ACTION_STYLES = {
  CREATE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  UPDATE: "bg-amber-50  text-amber-700  ring-amber-200",
  DELETE: "bg-red-50    text-red-700    ring-red-200",
};

const STATUS_STYLES = {
  SUCCESS: "bg-emerald-50 text-emerald-700",
  FAILURE: "bg-red-50    text-red-700",
};

const ROLE_STYLES = {
  admin:   "bg-purple-50 text-purple-700",
  faculty: "bg-blue-50   text-blue-700",
  student: "bg-gray-100  text-gray-600",
};

// ─── sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = "gray" }) {
  const colors = {
    gray:  "text-gray-800",
    green: "text-emerald-600",
    red:   "text-red-500",
    blue:  "text-blue-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-1 shadow-sm">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</span>
      <span className={`text-3xl font-semibold ${colors[color]}`}>{value ?? "—"}</span>
      {sub && <span className="text-xs text-gray-400">{sub}</span>}
    </div>
  );
}

function Badge({ text, styleClass }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset ${styleClass}`}>
      {text}
    </span>
  );
}

function Pill({ text, styleClass }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${styleClass}`}>
      {text}
    </span>
  );
}

function ExpandedRow({ row }) {
  const fields = [
    { label: "IP Address",    value: row.ip_address },
    { label: "User Agent",    value: row.user_agent },
    { label: "Record ID",     value: row.affected_record_id ?? "—" },
    { label: "Error Details", value: row.error_details ?? "—" },
  ];

  const hasDiff = row.old_values && row.new_values;

  let oldObj = null, newObj = null;
  try { oldObj = typeof row.old_values === "string" ? JSON.parse(row.old_values) : row.old_values; } catch {}
  try { newObj = typeof row.new_values === "string" ? JSON.parse(row.new_values) : row.new_values; } catch {}

  const diffKeys = hasDiff && oldObj && newObj
    ? Object.keys({ ...oldObj, ...newObj }).filter(
        (k) => JSON.stringify(oldObj[k]) !== JSON.stringify(newObj[k])
      )
    : [];

  return (
    <tr>
      <td colSpan={8} className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

          {/* meta info */}
          <div className="space-y-2">
            {fields.map(({ label, value }) => (
              <div key={label} className="flex gap-2">
                <span className="text-gray-400 w-28 shrink-0">{label}</span>
                <span className="text-gray-700 break-all">{value}</span>
              </div>
            ))}
          </div>

          {/* diff view */}
          {diffKeys.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Changes</p>
              <div className="rounded-xl overflow-hidden border border-gray-200 text-xs font-mono">
                <div className="grid grid-cols-3 bg-gray-100 px-3 py-1 text-gray-500 text-[10px] uppercase tracking-wider">
                  <span>Field</span><span>Before</span><span>After</span>
                </div>
                {diffKeys.map((k) => (
                  <div key={k} className="grid grid-cols-3 px-3 py-1.5 border-t border-gray-100">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-red-500">{String(oldObj[k] ?? "—")}</span>
                    <span className="text-emerald-600">{String(newObj[k] ?? "—")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function LogRow({ row }) {
  const [open, setOpen] = useState(false);
  const isErr = row.status === "FAILURE";

  return (
    <>
      <tr
        onClick={() => setOpen((o) => !o)}
        className={`cursor-pointer transition-colors ${
          isErr ? "bg-red-50/60 hover:bg-red-50" : "hover:bg-gray-50"
        }`}
      >
        <td className="px-4 py-3 text-xs text-gray-400 font-mono">{row.id}</td>
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-800">#{row.actor_id}</span>
            <Pill
              text={row.actor_role.toLowerCase()}
              styleClass={ROLE_STYLES[row.actor_role.toLowerCase()] ?? "bg-gray-100 text-gray-600"}
            />
          </div>
        </td>
        <td className="px-4 py-3">
          <Badge
            text={row.action}
            styleClass={ACTION_STYLES[row.action] ?? "bg-gray-100 text-gray-600 ring-gray-200"}
          />
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 font-mono">{row.affected_table}</td>
        <td className="px-4 py-3">
          <Badge
            text={row.status}
            styleClass={`ring-1 ring-inset ${
              row.status === "SUCCESS"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-red-50 text-red-700 ring-red-200"
            }`}
          />
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 max-w-[260px]">
          <p className="truncate" title={row.message}>{row.message || "—"}</p>
        </td>
        <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmt(row.created_at)}</td>
        <td className="px-4 py-3 text-gray-300 text-sm select-none">{open ? "▲" : "▼"}</td>
      </tr>
      {open && <ExpandedRow row={row} />}
    </>
  );
}

function Skeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" style={{ opacity: 1 - i * 0.08 }} />
      ))}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

const LIMIT = 25;

export default function AdminLogs() {
  const [logs,    setLogs]    = useState([]);
  const [stats,   setStats]   = useState(null);
  const [tables,  setTables]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // pagination
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total,      setTotal]      = useState(0);

  // filters
  const [search,   setSearch]   = useState("");
  const [action,   setAction]   = useState("");
  const [status,   setStatus]   = useState("");
  const [role,     setRole]     = useState("");
  const [table,    setTable]    = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const searchRef   = useRef(null);
  const debounceRef = useRef(null);

  const fetchLogs = useCallback(async (overridePage) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page:  overridePage ?? page,
        limit: LIMIT,
        ...(action   && { action }),
        ...(status   && { status }),
        ...(role     && { role }),
        ...(table    && { table }),
        ...(search   && { search }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo   && { dateTo }),
      };

      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_APP_URL}/logs`,
        { params, withCredentials: true }
      );

      const { logs, pagination, stats: s, tables: t } = res.data.data;
      setLogs(logs);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
      if (s) setStats(s);
      if (t?.length) setTables(t);
    } catch (err) {
      console.error("fetchLogs:", err);
      setError("Could not load audit logs. Please try again.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, action, status, role, table, search, dateFrom, dateTo]);

  // re-fetch when filters or page change
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // debounce the search box
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
    }, 350);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(""); setAction(""); setStatus("");
    setRole(""); setTable(""); setDateFrom(""); setDateTo("");
    setPage(1);
    if (searchRef.current) searchRef.current.value = "";
  };

  const hasFilters = search || action || status || role || table || dateFrom || dateTo;

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Audit Logs</h1>
            <p className="text-sm text-gray-400 mt-0.5">All system activity — click a row to expand details</p>
          </div>
          <button
            onClick={() => fetchLogs()}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Refresh
          </button>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total logs"    value={stats?.total}        color="gray"  />
          <StatCard label="Successful"    value={stats?.successCount} color="green" sub={stats ? `${Math.round(stats.successCount / stats.total * 100)}% success rate` : null} />
          <StatCard label="Failed"        value={stats?.failureCount} color="red"   />
          <StatCard label="Unique actors" value={stats?.uniqueActors} color="blue"  sub={stats ? `across ${stats.uniqueTables} tables` : null} />
        </div>

        {/* filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            {/* search */}
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search message, table…"
                defaultValue={search}
                onChange={handleSearchChange}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
            </div>

            {/* action */}
            <select value={action} onChange={handleFilterChange(setAction)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700">
              <option value="">All actions</option>
              <option>CREATE</option>
              <option>UPDATE</option>
              <option>DELETE</option>
            </select>

            {/* status */}
            <select value={status} onChange={handleFilterChange(setStatus)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700">
              <option value="">All statuses</option>
              <option>SUCCESS</option>
              <option>FAILURE</option>
            </select>

            {/* role */}
            <select value={role} onChange={handleFilterChange(setRole)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700">
              <option value="">All roles</option>
              <option value="admin">Admin</option>
              <option value="faculty">Faculty</option>
              <option value="student">Student</option>
            </select>

            {/* table */}
            <select value={table} onChange={handleFilterChange(setTable)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700">
              <option value="">All tables</option>
              {tables.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* date range row */}
          <div className="flex flex-wrap gap-3 items-center">
            <label className="text-xs text-gray-400">From</label>
            <input type="date" value={dateFrom} onChange={handleFilterChange(setDateFrom)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700" />
            <label className="text-xs text-gray-400">To</label>
            <input type="date" value={dateTo} onChange={handleFilterChange(setDateTo)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-gray-700" />

            {hasFilters && (
              <button onClick={clearFilters}
                className="ml-auto text-xs text-red-400 hover:text-red-600 border border-red-200 rounded-lg px-3 py-1.5 bg-white transition-colors">
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border-b border-red-100 px-6 py-4 text-sm text-red-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          {loading ? (
            <Skeleton />
          ) : logs.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">
              No audit logs found{hasFilters ? " matching your filters" : ""}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    {["ID", "Actor", "Action", "Table", "Status", "Message", "Time", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((row) => <LogRow key={row.id} row={row} />)}
                </tbody>
              </table>
            </div>
          )}

          {/* pagination footer */}
          {!loading && logs.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50">
              <span className="text-xs text-gray-400">
                {total} log{total !== 1 ? "s" : ""} total
                {hasFilters ? " (filtered)" : ""}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                <span className="text-sm text-gray-500 px-1">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}