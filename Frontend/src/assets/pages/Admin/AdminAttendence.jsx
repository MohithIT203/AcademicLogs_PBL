import { useState, useEffect } from "react";
import axios from "axios";
import { CalendarCheck, AlertCircle, Search } from "lucide-react";
import AdminTable from "../../../components/Tables";

const baseURL = import.meta.env.VITE_SERVER_APP_URL;

export default function AdminAttendance() {
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const studRes = await axios.get(`${baseURL}/all-students`, { withCredentials: true });
    const raw = studRes.data;
const studentList = raw?.data?.students || [];
      setStudents(studentList);

      // Fetch all attendance in parallel
      const attResults = await Promise.allSettled(
        studentList.map((s) =>
          axios.get(`${baseURL}/attendance/${s.student_id}`, { withCredentials: true })
        )
      );

      const map = {};
      studentList.forEach((s, i) => {
        const result = attResults[i];
        if (result.status === "fulfilled") {
          const records = result.value.data?.data || [];
          const present = records.filter((r) => r.status === "present").length;
          const total = records.length;
          map[s.student_id] = { present, absent: total - present, total, pct: total > 0 ? Math.round((present / total) * 100) : 0 };
        } else {
          map[s.student_id] = { present: 0, absent: 0, total: 0, pct: 0 };
        }
      });
      setAttendanceMap(map);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const departments = [...new Set(students.map((s) => s.department).filter(Boolean))];

  const enriched = students.map((s) => ({ ...s, ...(attendanceMap[s.student_id] || { present: 0, absent: 0, total: 0, pct: 0 }) }));

  const filtered = enriched.filter((s) => {
    const q = search.toLowerCase();
    return (
      ((s.username || "").toLowerCase().includes(q) || (s.regno || "").toLowerCase().includes(q)) &&
      (filterDept === "all" || s.department === filterDept) &&
      (filterStatus === "all" || (filterStatus === "low" && s.pct < 75) || (filterStatus === "good" && s.pct >= 75))
    );
  });

  const totalStudents = enriched.length;
  const lowCount = enriched.filter((s) => s.pct < 75).length;
  const goodCount = enriched.filter((s) => s.pct >= 75).length;
  const overallAvg = totalStudents > 0 ? Math.round(enriched.reduce((sum, s) => sum + s.pct, 0) / totalStudents) : 0;

  const columns = [
    { key: "username", label: "Student", render: (v) => <span className="font-medium text-gray-800">{v}</span> },
    { key: "regno", label: "Reg No.", render: (v) => <span className="text-gray-500 text-sm">{v}</span> },
    { key: "department", label: "Department", render: (v) => <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{v}</span> },
    { key: "present", label: "Present", render: (v) => <span className="font-semibold text-green-600">{v}</span> },
    { key: "absent", label: "Absent", render: (v) => <span className="font-semibold text-red-500">{v}</span> },
    { key: "total", label: "Total", render: (v) => <span className="text-gray-600">{v}</span> },
    { key: "pct", label: "Attendance %", render: (v) => (
      <div className="flex items-center gap-3">
        <div className="w-20 bg-gray-200 rounded-full h-2">
          <div className={`h-2 rounded-full ${v >= 75 ? "bg-green-500" : v >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${v}%` }} />
        </div>
        <span className={`text-xs font-bold ${v >= 75 ? "text-green-600" : "text-red-500"}`}>{v}%</span>
      </div>
    )},
    { key: "student_id", label: "Status", render: (_, row) => row.pct < 75
      ? <span className="flex items-center gap-1 text-xs font-semibold text-red-500"><AlertCircle size={13} /> Low</span>
      : <span className="text-xs font-semibold text-green-600">✓ Good</span>
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <CalendarCheck className="text-blue-600" size={26} />
            <div>
              <h1 className="text-2xl font-semibold text-blue-700">Overall Attendance</h1>
              <p className="text-sm text-gray-500">Attendance summary across all students</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Students", value: totalStudents, border: "border-blue-100", text: "text-blue-700" },
              { label: "Overall Average", value: `${overallAvg}%`, border: "border-indigo-100", text: "text-indigo-700" },
              { label: "Good Attendance (≥75%)", value: goodCount, border: "border-green-100", text: "text-green-700" },
              { label: "Low Attendance (<75%)", value: lowCount, border: "border-red-100", text: "text-red-600" },
            ].map((s) => (
              <div key={s.label} className={`bg-white rounded-xl shadow-md border ${s.border} p-5 hover:shadow-lg transition`}>
                <p className="text-sm text-gray-500">{s.label}</p>
                <h2 className={`text-3xl font-bold ${s.text} mt-1`}>{s.value}</h2>
              </div>
            ))}
          </div>
        )}

        {/* Low attendance alert */}
        {!loading && lowCount > 0 && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
            <span>
              <strong>{lowCount} student{lowCount !== 1 ? "s" : ""}</strong> have attendance below 75%. Filter by "Low" to view them.
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or reg no..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
              className="sm:w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none">
              <option value="all">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="sm:w-48 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none">
              <option value="all">All Students</option>
              <option value="good">Good (≥75%)</option>
              <option value="low">Low (&lt;75%)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading
          ? <div className="text-center text-blue-600 py-10">Loading attendance data...</div>
          : <AdminTable data={filtered} columns={columns} emptyText="No students found." />
        }
      </div>
    </div>
  );
}