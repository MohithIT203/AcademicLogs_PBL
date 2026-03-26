import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import axios from "axios";
import AdminTable from "../../../components/Tables.jsx";
import { GraduationCap } from "lucide-react";

export default function StudentSemesterScores() {
  const [semData, setSemData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const studentId = user?.id;

  useEffect(() => { if (studentId) fetchSemesterScores(); }, [studentId]);
  useEffect(() => { applyFilters(); }, [semData, selectedSemester]);

  const fetchSemesterScores = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/semesterscores/${studentId}`, { withCredentials: true });
      setSemData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setError("Failed to load semester scores");
      setSemData([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setFilteredData(
      selectedSemester === "all" ? semData : semData.filter((i) => i.semester_no === parseInt(selectedSemester))
    );
  };

  const semesters = [...new Set(semData.map((d) => d.semester_no))].sort((a, b) => a - b);
  const gradeDistribution = filteredData.reduce((acc, item) => {
    const g = item.grade || "N/A";
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});

  const columns = [
    {
      key: "course_name",
      label: "Course",
      render: (v, r) => <span className="font-medium text-gray-800">{v || r.course_id}</span>,
    },
    {
      key: "semester_no",
      label: "Semester",
      render: (v) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Sem {v}</span>
      ),
    },
    {
      key: "grade",
      label: "Grade",
      render: (v) => {
        const color =
          v === "O" || v === "A+" ? "bg-green-100 text-green-700"
          : v === "A" || v === "B+" ? "bg-blue-100 text-blue-700"
          : v === "B" || v === "C" ? "bg-yellow-100 text-yellow-700"
          : "bg-red-100 text-red-600";
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>{v || "N/A"}</span>;
      },
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-blue-600" size={26} />
            <div>
              <h1 className="text-2xl font-semibold text-blue-700">Semester Scores</h1>
              <p className="text-sm text-gray-500">End-semester examination grades</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Courses", value: filteredData.length, color: "blue" },
              { label: "Semesters", value: semesters.length, color: "indigo" },
              { label: "Top Grade", value: ["O","A+","A","B+","B","C","D","F"].find((g) => gradeDistribution[g]) || "—", color: "green" },
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
            <label className="text-sm font-medium text-gray-600">Filter by Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="sm:w-64 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="all">All Semesters</option>
              {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">{error}</div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center text-blue-600 py-10">Loading semester scores...</div>
        ) : (
          <>
            <AdminTable
              data={filteredData}
              columns={columns}
              emptyText={`No semester scores found${selectedSemester !== "all" ? " for this semester" : ""}.`}
            />

            {/* Grade Distribution */}
            {filteredData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                <h3 className="text-base font-semibold text-blue-700 mb-4">Grade Distribution</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {Object.entries(gradeDistribution).map(([grade, count]) => {
                    const color =
                      grade === "O" || grade === "A+" ? "bg-green-100 text-green-700 border-green-200"
                      : grade === "A" || grade === "B+" ? "bg-blue-100 text-blue-700 border-blue-200"
                      : grade === "B" || grade === "C" ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-red-100 text-red-600 border-red-200";
                    return (
                      <div key={grade} className={`rounded-xl border p-4 text-center ${color}`}>
                        <p className="text-2xl font-bold">{grade}</p>
                        <p className="text-xs mt-1">{count} course{count !== 1 ? "s" : ""}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}