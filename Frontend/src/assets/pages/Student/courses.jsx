import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import axios from "axios";
import AdminTable from "../../../components/Tables.jsx";
import { BookOpen } from "lucide-react";

function StudentCourses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => { fetchCourses(); }, []);
  useEffect(() => { applyFilter(); }, [courses, search]);

  const fetchCourses = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/student/courses`, { withCredentials: true });
      setCourses(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setError("Failed to load courses");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    setFilteredCourses(
      search.trim() === ""
        ? courses
        : courses.filter(
            (c) =>
              (c.course_name || "").toLowerCase().includes(search.toLowerCase()) ||
              (c.course_code || "").toLowerCase().includes(search.toLowerCase()) ||
              (c.department || "").toLowerCase().includes(search.toLowerCase())
          )
    );
  };

  const columns = [
    {
      key: "course_name",
      label: "Course Name",
      render: (v) => <span className="font-medium text-gray-800">{v}</span>,
    },
    {
      key: "course_code",
      label: "Code",
      render: (v) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{v || "—"}</span>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (v) => <span className="text-gray-600 text-sm">{v || "—"}</span>,
    },
    {
      key: "semester",
      label: "Semester",
      render: (v) => (
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">Sem {v || "—"}</span>
      ),
    },
    {
      key: "credits",
      label: "Credits",
      render: (v) => (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">{v || "—"}</span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="text-blue-600" size={26} />
              <div>
                <h1 className="text-2xl font-semibold text-blue-700">My Courses</h1>
                <p className="text-sm text-gray-500">Courses you are currently enrolled in</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full border bg-blue-50 text-blue-600 border-blue-200">
              {courses.length} course{courses.length !== 1 ? "s" : ""} enrolled
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="text-sm font-medium text-gray-600 whitespace-nowrap">Search courses</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, or department..."
              className="sm:w-80 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm">{error}</div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center text-blue-600 py-10">Loading courses...</div>
        ) : (
          <AdminTable
            data={filteredCourses}
            columns={columns}
            emptyText="No courses found."
          />
        )}
      </div>
    </div>
  );
}

export default StudentCourses;