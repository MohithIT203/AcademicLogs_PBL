import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import axios from "axios";
import AdminTable from "../../../components/Tables.jsx";
import { NotebookPen } from "lucide-react";

export default function StudentPTScores() {
  const [ptData, setPtData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const studentId = user?.id;

  useEffect(() => { if (studentId) fetchPTScores(); }, [studentId]);
  useEffect(() => { applyFilters(); }, [ptData, selectedCourse]);

  const fetchPTScores = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/ptscores/${studentId}`, { withCredentials: true });
      setPtData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setError("Failed to load PT scores");
      setPtData([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setFilteredData(
      selectedCourse === "all" ? ptData : ptData.filter((i) => i.course_name === selectedCourse || i.course_id === selectedCourse)
    );
  };

  const courses = [...new Set(ptData.map((d) => d.course_name || d.course_id))];
  const totalTests = filteredData.length;
  const avgMarks = totalTests > 0 ? (filteredData.reduce((s, i) => s + (i.marks || 0), 0) / totalTests).toFixed(1) : 0;
  const maxMarks = totalTests > 0 ? Math.max(...filteredData.map((d) => d.marks || 0)) : 0;

  const columns = [
    {
      key: "course_name",
      label: "Course",
      render: (v, r) => <span className="font-medium text-gray-800">{v || r.course_id}</span>,
    },
    {
      key: "pt_test_no",
      label: "Test No.",
      render: (v) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">PT {v}</span>
      ),
    },
    {
      key: "marks",
      label: "Marks",
      render: (v) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">{v}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <NotebookPen className="text-blue-600" size={26} />
            <div>
              <h1 className="text-2xl font-semibold text-blue-700">Periodic Test Scores</h1>
              <p className="text-sm text-gray-500">Your PT marks across all courses</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Tests", value: totalTests, color: "blue" },
              { label: "Average Marks", value: avgMarks, color: "indigo" },
              { label: "Best Score", value: maxMarks, color: "green" },
            ].map((s) => (
              <div key={s.label} className={`bg-white rounded-xl shadow-md border border-${s.color}-100 p-5 hover:shadow-lg transition`}>
                <p className="text-sm text-gray-500">{s.label}</p>
                <h2 className={`text-3xl font-bold text-${s.color}-700 mt-1`}>{s.value}</h2>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-600">Filter by Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="sm:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">{error}</div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center text-blue-600 py-10">Loading PT scores...</div>
        ) : (
          <AdminTable
            data={filteredData}
            columns={columns}
            emptyText={`No PT scores found${selectedCourse !== "all" ? " for this course" : ""}.`}
          />
        )}
      </div>
    </div>
  );
}