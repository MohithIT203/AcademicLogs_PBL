import { useState, useEffect } from "react";
import axios from "axios";
import { NotebookPen, Search } from "lucide-react";
import AdminTable from "../../../components/Tables";

const baseURL = import.meta.env.VITE_SERVER_APP_URL;

export default function AdminExams() {
  const [students, setStudents] = useState([]);
  const [ptMap, setPtMap] = useState({});
  const [semMap, setSemMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pt");
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("all");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const studRes = await axios.get(`${baseURL}/all-students`, { withCredentials: true });
     const raw = studRes.data;
const studentList = raw?.data?.students || [];
      setStudents(studentList);

      const [ptResults, semResults] = await Promise.all([
        Promise.allSettled(studentList.map((s) => axios.get(`${baseURL}/ptscores/${s.student_id}`, { withCredentials: true }))),
        Promise.allSettled(studentList.map((s) => axios.get(`${baseURL}/semesterscores/${s.student_id}`, { withCredentials: true }))),
      ]);

      const ptM = {}, semM = {};
      studentList.forEach((s, i) => {
        const ptR = ptResults[i];
        const semR = semResults[i];
        const ptRecords = ptR.status === "fulfilled" ? ptR.value.data?.data || [] : [];
        const semRecords = semR.status === "fulfilled" ? semR.value.data?.data || [] : [];
        const ptAvg = ptRecords.length > 0
          ? (ptRecords.reduce((acc, r) => acc + (r.marks || 0), 0) / ptRecords.length).toFixed(1) : "—";
        const ptBest = ptRecords.length > 0 ? Math.max(...ptRecords.map((r) => r.marks || 0)) : "—";
        ptM[s.student_id] = { count: ptRecords.length, avg: ptAvg, best: ptBest };
        semM[s.student_id] = {
          count: semRecords.length,
          topGrade: ["O","A+","A","B+","B","C","D","F"].find((g) => semRecords.some((r) => r.grade === g)) || "—",
          grades: semRecords.map((r) => r.grade).filter(Boolean),
        };
      });
      setPtMap(ptM);
      setSemMap(semM);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const departments = [...new Set(students.map((s) => s.department).filter(Boolean))];

  const enrichedPt = students.map((s) => ({ ...s, ...(ptMap[s.student_id] || { count: 0, avg: "—", best: "—" }) }));
  const enrichedSem = students.map((s) => ({ ...s, ...(semMap[s.student_id] || { count: 0, topGrade: "—", grades: [] }) }));

  const applyFilter = (list) =>
    list.filter((s) => {
      const q = search.toLowerCase();
      return (
        ((s.username || "").toLowerCase().includes(q) || (s.regno || "").toLowerCase().includes(q)) &&
        (filterDept === "all" || s.department === filterDept)
      );
    });

  const filteredPt = applyFilter(enrichedPt);
  const filteredSem = applyFilter(enrichedSem);

  // Overall stats
  const allPtCounts = enrichedPt.map((s) => s.count);
  const allPtAvgs = enrichedPt.map((s) => parseFloat(s.avg)).filter((v) => !isNaN(v));
  const overallPtAvg = allPtAvgs.length > 0 ? (allPtAvgs.reduce((a, b) => a + b, 0) / allPtAvgs.length).toFixed(1) : "—";
  const totalPtRecords = allPtCounts.reduce((a, b) => a + b, 0);
  const totalSemRecords = enrichedSem.reduce((a, s) => a + s.count, 0);

  const ptColumns = [
    { key: "username", label: "Student", render: (v) => <span className="font-medium text-gray-800">{v}</span> },
    { key: "regno", label: "Reg No.", render: (v) => <span className="text-gray-500 text-sm">{v}</span> },
    { key: "department", label: "Department", render: (v) => <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{v}</span> },
    { key: "count", label: "Tests Taken", render: (v) => <span className="font-semibold text-blue-600">{v}</span> },
    { key: "avg", label: "Average Marks", render: (v) => (
      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{v}</span>
    )},
    { key: "best", label: "Best Score", render: (v) => (
      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">{v}</span>
    )},
  ];

  const semColumns = [
    { key: "username", label: "Student", render: (v) => <span className="font-medium text-gray-800">{v}</span> },
    { key: "regno", label: "Reg No.", render: (v) => <span className="text-gray-500 text-sm">{v}</span> },
    { key: "department", label: "Department", render: (v) => <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{v}</span> },
    { key: "count", label: "Courses Graded", render: (v) => <span className="font-semibold text-blue-600">{v}</span> },
    { key: "topGrade", label: "Best Grade", render: (v) => {
      const color = v === "O" || v === "A+" ? "bg-green-100 text-green-700"
        : v === "A" || v === "B+" ? "bg-blue-100 text-blue-700"
        : v === "B" || v === "C" ? "bg-yellow-100 text-yellow-700"
        : v === "—" ? "bg-gray-100 text-gray-500"
        : "bg-red-100 text-red-600";
      return <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>{v}</span>;
    }},
    { key: "grades", label: "Grade Distribution", render: (v) => {
      if (!v || v.length === 0) return <span className="text-gray-400 text-xs">No grades</span>;
      const dist = v.reduce((acc, g) => { acc[g] = (acc[g] || 0) + 1; return acc; }, {});
      return (
        <div className="flex flex-wrap gap-1">
          {Object.entries(dist).map(([g, count]) => {
            const color = g === "O" || g === "A+" ? "bg-green-100 text-green-700"
              : g === "A" || g === "B+" ? "bg-blue-100 text-blue-700"
              : g === "B" || g === "C" ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-600";
            return <span key={g} className={`px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>{g}×{count}</span>;
          })}
        </div>
      );
    }},
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <NotebookPen className="text-blue-600" size={26} />
            <div>
              <h1 className="text-2xl font-semibold text-blue-700">Overall Exams</h1>
              <p className="text-sm text-gray-500">PT scores and semester grades summary for all students</p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Students", value: students.length, border: "border-blue-100", text: "text-blue-700" },
              { label: "Total PT Records", value: totalPtRecords, border: "border-indigo-100", text: "text-indigo-700" },
              { label: "Overall PT Average", value: overallPtAvg, border: "border-green-100", text: "text-green-700" },
              { label: "Total Sem Grades", value: totalSemRecords, border: "border-amber-100", text: "text-amber-600" },
            ].map((s) => (
              <div key={s.label} className={`bg-white rounded-xl shadow-md border ${s.border} p-5 hover:shadow-lg transition`}>
                <p className="text-sm text-gray-500">{s.label}</p>
                <h2 className={`text-3xl font-bold ${s.text} mt-1`}>{s.value}</h2>
              </div>
            ))}
          </div>
        )}

        {/* Tabs + Filters */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-3">
              <button onClick={() => setTab("pt")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "pt" ? "bg-blue-600 text-white shadow" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"}`}>
                PT Scores ({totalPtRecords})
              </button>
              <button onClick={() => setTab("sem")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "sem" ? "bg-blue-600 text-white shadow" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"}`}>
                Semester Grades ({totalSemRecords})
              </button>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none w-48" />
              </div>
              <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
                className="sm:w-44 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none">
                <option value="all">All Departments</option>
                {departments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-blue-600 py-10">Loading exam data...</div>
        ) : tab === "pt" ? (
          <AdminTable data={filteredPt} columns={ptColumns} emptyText="No PT data found." />
        ) : (
          <AdminTable data={filteredSem} columns={semColumns} emptyText="No semester data found." />
        )}
      </div>
    </div>
  );
}