import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import axios from "axios";
import AdminTable from "../../../components/Tables.jsx";
import { NotebookPen, GraduationCap } from "lucide-react";

function StudentExams() {
  const [tab, setTab] = useState("pt");
  const [ptData, setPtData] = useState([]);
  const [semData, setSemData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterSem, setFilterSem] = useState("all");

  const { user } = useAuth();
  const studentId = user?.id;

  useEffect(() => { if (studentId) fetchAll(); }, [studentId]);

  const fetchAll = async () => {
    try {
      const [ptRes, semRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/ptscores/${studentId}`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/semesterscores/${studentId}`, { withCredentials: true }),
      ]);
      setPtData(Array.isArray(ptRes.data?.data) ? ptRes.data.data : []);
      setSemData(Array.isArray(semRes.data?.data) ? semRes.data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ptCourses = [...new Set(ptData.map((d) => d.course_name || d.course_id))];
  const semesters = [...new Set(semData.map((d) => d.semester_no))].sort((a, b) => a - b);

  const filteredPt = filterCourse === "all" ? ptData : ptData.filter((d) => (d.course_name || d.course_id) === filterCourse);
  const filteredSem = filterSem === "all" ? semData : semData.filter((d) => d.semester_no === parseInt(filterSem));

  const ptColumns = [
    {
      key: "course_name",
      label: "Course",
      render: (v, r) => <span className="font-medium text-gray-800">{v || r.course_id}</span>,
    },
    {
      key: "pt_test_no",
      label: "PT No.",
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

  const semColumns = [
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
            <NotebookPen className="text-blue-600" size={26} />
            <div>
              <h1 className="text-2xl font-semibold text-blue-700">Exams & Scores</h1>
              <p className="text-sm text-gray-500">View your PT and semester exam results</p>
            </div>
          </div>
        </div>

        {/* Tabs + Filter */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-3">
              <button
                onClick={() => setTab("pt")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === "pt" ? "bg-blue-600 text-white shadow" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                }`}
              >
                PT Scores ({ptData.length})
              </button>
              <button
                onClick={() => setTab("sem")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === "sem" ? "bg-blue-600 text-white shadow" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                }`}
              >
                Semester Grades ({semData.length})
              </button>
            </div>

            {/* Contextual filter */}
            <div className="sm:w-56">
              {tab === "pt" ? (
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="all">All Courses</option>
                  {ptCourses.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <select
                  value={filterSem}
                  onChange={(e) => setFilterSem(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                >
                  <option value="all">All Semesters</option>
                  {semesters.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-blue-600 py-10">Loading records...</div>
        ) : tab === "pt" ? (
          <AdminTable
            data={filteredPt}
            columns={ptColumns}
            emptyText="No PT scores found."
          />
        ) : (
          <AdminTable
            data={filteredSem}
            columns={semColumns}
            emptyText="No semester grades found."
          />
        )}
      </div>
    </div>
  );
}

export default StudentExams;