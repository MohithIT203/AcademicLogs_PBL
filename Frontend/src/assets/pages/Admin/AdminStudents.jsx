import { useState, useEffect } from "react";
import axios from "axios";
import { Users, ChevronRight, X, Search, CalendarCheck, NotebookPen, GraduationCap } from "lucide-react";
import AdminTable from "../../../components/Tables";

const baseURL = import.meta.env.VITE_SERVER_APP_URL;

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [drillTab, setDrillTab] = useState("attendance");
  const [drillData, setDrillData] = useState({ attendance: [], ptScores: [], semScores: [] });
  const [drillLoading, setDrillLoading] = useState(false);

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(`${baseURL}/all-students`, { withCredentials: true });
      const raw = res.data;
      setStudents(Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const openDrillDown = async (student) => {
    setSelectedStudent(student);
    setDrillTab("attendance");
    setDrillLoading(true);
    try {
      const [attRes, ptRes, semRes] = await Promise.all([
        axios.get(`${baseURL}/attendance/${student.student_id}`, { withCredentials: true }),
        axios.get(`${baseURL}/ptscores/${student.student_id}`, { withCredentials: true }),
        axios.get(`${baseURL}/semesterscores/${student.student_id}`, { withCredentials: true }),
      ]);
      setDrillData({
        attendance: attRes.data?.data || [],
        ptScores: ptRes.data?.data || [],
        semScores: semRes.data?.data || [],
      });
    } catch (err) { console.error(err); }
    finally { setDrillLoading(false); }
  };

  const closeDrillDown = () => { setSelectedStudent(null); };

  const departments = [...new Set(students.map((s) => s.department).filter(Boolean))];
  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      ((s.username || "").toLowerCase().includes(q) || (s.regno || "").toLowerCase().includes(q) || (s.mail_id || "").toLowerCase().includes(q)) &&
      (filterDept === "all" || s.department === filterDept)
    );
  });

  const presentCount = drillData.attendance.filter((a) => a.status === "present").length;
  const totalAtt = drillData.attendance.length;
  const attPct = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;
  const avgPt = drillData.ptScores.length > 0
    ? (drillData.ptScores.reduce((s, i) => s + (i.marks || 0), 0) / drillData.ptScores.length).toFixed(1) : "—";

  const studentColumns = [
    { key: "username", label: "Name", render: (v) => <span className="font-medium text-gray-800">{v}</span> },
    { key: "regno", label: "Reg No.", render: (v) => <span className="text-gray-600 text-sm">{v}</span> },
    { key: "department", label: "Department", render: (v) => <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{v}</span> },
    { key: "mail_id", label: "Email", render: (v) => <span className="text-gray-500 text-sm">{v}</span> },
    { key: "student_id", label: "Action", render: (_, row) => (
      <button onClick={(e) => { e.stopPropagation(); openDrillDown(row); }} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
        <ChevronRight size={14} /> View Details
      </button>
    )},
  ];

  const attColumns = [
    { key: "course_name", label: "Course", render: (v) => <span className="font-medium text-gray-800">{v}</span> },
    { key: "session_date", label: "Date", render: (v) => <span className="text-gray-500">{v?.split("T")[0]}</span> },
    { key: "status", label: "Status", render: (v) => (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${v === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>{v}</span>
    )},
  ];

  const ptColumns = [
    { key: "course_name", label: "Course", render: (v) => <span className="font-medium text-gray-800">{v}</span> },
    { key: "pt_test_no", label: "PT No.", render: (v) => <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">PT {v}</span> },
    { key: "marks", label: "Marks", render: (v) => <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{v}</span> },
  ];

  const semColumns = [
    { key: "course_name", label: "Course", render: (v) => <span className="font-medium text-gray-800">{v}</span> },
    { key: "semester_no", label: "Semester", render: (v) => <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">Sem {v}</span> },
    { key: "grade", label: "Grade", render: (v) => {
      const c = v === "O" || v === "A+" ? "bg-green-100 text-green-700" : v === "A" || v === "B+" ? "bg-blue-100 text-blue-700" : v === "B" || v === "C" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600";
      return <span className={`px-3 py-1 rounded-full text-xs font-bold ${c}`}>{v || "N/A"}</span>;
    }},
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={26} />
              <div>
                <h1 className="text-2xl font-semibold text-blue-700">All Students</h1>
                <p className="text-sm text-gray-500">Click "View Details" to drill into a student's full academic record</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
              {filtered.length} student{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, reg no., or email..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none" />
            </div>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
              className="sm:w-52 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none">
              <option value="all">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {loading ? <div className="text-center text-blue-600 py-10">Loading students...</div>
          : <AdminTable data={filtered} columns={studentColumns} emptyText="No students found." />}
      </div>

      {/* Drill-down Panel */}
      {selectedStudent && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeDrillDown} />
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col">

            {/* Panel Header */}
            <div className="border-b border-blue-100 px-6 py-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-widest">Student Record</p>
                <h2 className="text-xl font-semibold text-blue-700 mt-1">{selectedStudent.username}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                  <span>Reg: <span className="font-medium text-gray-700">{selectedStudent.regno}</span></span>
                  <span>Dept: <span className="font-medium text-gray-700">{selectedStudent.department}</span></span>
                  <span>{selectedStudent.mail_id}</span>
                </div>
              </div>
              <button onClick={closeDrillDown} className="p-2 hover:bg-gray-100 rounded-lg transition mt-1">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Stat Strip */}
            {!drillLoading && (
              <div className="grid grid-cols-4 border-b border-blue-50">
                {[
                  { label: "Attendance", value: `${attPct}%`, color: attPct >= 75 ? "text-green-600" : "text-red-500" },
                  { label: "Present", value: presentCount, color: "text-green-600" },
                  { label: "PT Avg", value: avgPt, color: "text-blue-600" },
                  { label: "Sem Grades", value: drillData.semScores.length, color: "text-indigo-600" },
                ].map((s) => (
                  <div key={s.label} className="px-4 py-4 text-center border-r border-blue-50 last:border-r-0 bg-blue-50/30">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 px-6 py-3 border-b border-blue-50 bg-blue-50/40">
              {[
                { id: "attendance", label: "Attendance", icon: CalendarCheck, count: drillData.attendance.length },
                { id: "pt", label: "PT Scores", icon: NotebookPen, count: drillData.ptScores.length },
                { id: "sem", label: "Semester", icon: GraduationCap, count: drillData.semScores.length },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} onClick={() => setDrillTab(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                      drillTab === t.id ? "bg-blue-600 text-white shadow-sm" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                    }`}>
                    <Icon size={13} /> {t.label} ({t.count})
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {drillLoading ? <div className="text-center text-blue-600 py-10">Loading records...</div> : (
                <>
                  {drillTab === "attendance" && <AdminTable data={drillData.attendance} columns={attColumns} emptyText="No attendance records found." />}
                  {drillTab === "pt" && <AdminTable data={drillData.ptScores} columns={ptColumns} emptyText="No PT scores found." />}
                  {drillTab === "sem" && <AdminTable data={drillData.semScores} columns={semColumns} emptyText="No semester scores found." />}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}