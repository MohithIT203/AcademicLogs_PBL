import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext.jsx";

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold border transition-all
        ${isError
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-green-50 text-green-700 border-green-200"
        }`}
    >
      <span>{isError ? "✗" : "✓"}</span>
      {toast.msg}
    </div>
  );
}

export default function FacultyAttendance() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({ courseId: "", sessionDate: "", status: "present" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const baseURL = import.meta.env.VITE_SERVER_APP_URL;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [stuRes, couRes] = await Promise.all([
          axios.get(`${baseURL}/faculty/students`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/courses`, { withCredentials: true }),
        ]);
        setStudents(stuRes.data.data || []);
        setCourses(couRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [baseURL]);

  const fetchRecords = async (studentId) => {
    try {
      const res = await axios.get(
        `${baseURL}/faculty/attendance-records?studentId=${studentId}`,
        { withCredentials: true }
      );
      setAttendanceRecords(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectStudent = (stu) => {
    setSelectedStudent(stu);
    setForm({ courseId: "", sessionDate: "", status: "present" });
    fetchRecords(stu.student_id);
  };

  const clearSelection = () => {
    setSelectedStudent(null);
    setAttendanceRecords([]);
    setForm({ courseId: "", sessionDate: "", status: "present" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent || submitting) return;
    setSubmitting(true);
    try {
      await axios.post(
        `${baseURL}/faculty/attendance`,
        { studentId: selectedStudent.student_id, ...form },
        { withCredentials: true }
      );
      await fetchRecords(selectedStudent.student_id);
      showToast("Attendance saved successfully");
      setForm({ courseId: "", sessionDate: "", status: "present" });
    } catch (err) {
      showToast("Failed to save attendance", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await axios.patch(
        `${baseURL}/faculty/attendance/${id}`,
        { status },
        { withCredentials: true }
      );
      setAttendanceRecords((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      showToast("Status updated");
    } catch (err) {
      showToast("Failed to update", "error");
    }
  };

  if (user?.role !== "faculty")
    return <p className="text-red-500 p-8">Unauthorized</p>;

  const filtered = students.filter(
    (s) =>
      s.username?.toLowerCase().includes(search.toLowerCase()) ||
      s.regno?.toLowerCase().includes(search.toLowerCase())
  );

  const presentCount = attendanceRecords.filter((r) => r.status === "present").length;
  const absentCount = attendanceRecords.filter((r) => r.status === "absent").length;
  const pct = attendanceRecords.length
    ? Math.round((presentCount / attendanceRecords.length) * 100)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 py-8 max-w-6xl mx-auto">
      <Toast toast={toast} />

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Attendance</h1>
          <p className="mt-1 text-sm text-slate-500">
            {selectedStudent
              ? `Marking attendance for ${selectedStudent.username} (${selectedStudent.regno})`
              : "Select a student to mark or review attendance"}
          </p>
        </div>
        {selectedStudent && (
          <button
            onClick={clearSelection}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
          >
            ← Back to List
          </button>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Student List ── */}
      {!loading && !selectedStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-700">Department Students</h2>
            <input
              className="w-full sm:w-64 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-slate-50"
              placeholder="Search by name or reg no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Mobile: card list */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filtered.map((s) => (
              <div key={s.student_id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {s.username?.[0]?.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.username}</p>
                    <p className="text-xs text-slate-400 font-mono">{s.regno}</p>
                  </div>
                </div>
                <button
                  onClick={() => selectStudent(s)}
                  className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Mark →
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-10">No students found</p>
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reg No</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {s.username?.[0]?.toUpperCase()}
                        </span>
                        {s.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400 text-sm">{s.regno}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => selectStudent(s)}
                        className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-4 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Mark Attendance →
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={3} className="text-center py-10 text-slate-400">No students found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Attendance Panel ── */}
      {!loading && selectedStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-700">Mark Attendance</h2>
            </div>

            {/* Stats row */}
            {pct !== null && (
              <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
                <div className="flex flex-col items-center py-4 gap-0.5">
                  <span className="text-xl font-black text-green-600">{presentCount}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Present</span>
                </div>
                <div className="flex flex-col items-center py-4 gap-0.5">
                  <span className="text-xl font-black text-red-500">{absentCount}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Absent</span>
                </div>
                <div className="flex flex-col items-center py-4 gap-0.5">
                  <span className={`text-xl font-black ${pct >= 75 ? "text-green-600" : "text-amber-500"}`}>{pct}%</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Rate</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Course</label>
                <select
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value="">Select course…</option>
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={form.sessionDate}
                  onChange={(e) => setForm({ ...form, sessionDate: e.target.value })}
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {["present", "absent"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm({ ...form, status: s })}
                      className={`py-2.5 rounded-xl text-sm font-semibold border transition-all
                        ${form.status === s
                          ? s === "present"
                            ? "bg-green-50 text-green-700 border-green-300"
                            : "bg-red-50 text-red-600 border-red-200"
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      {s === "present" ? "✓ Present" : "✗ Absent"}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-colors mt-1"
              >
                {submitting ? "Saving…" : "Save Attendance"}
              </button>
            </form>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-700">Existing Records</h2>
              <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                {attendanceRecords.length} records
              </span>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {attendanceRecords.map((r) => (
                <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{r.course_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(r.session_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize
                      ${r.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {r.status}
                    </span>
                    <select
                      value={r.status}
                      onChange={(e) => changeStatus(r.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                  </div>
                </div>
              ))}
              {attendanceRecords.length === 0 && (
                <p className="text-center text-sm text-slate-400 py-10">No records yet</p>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Date", "Course", "Status", "Update"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {attendanceRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {new Date(r.session_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium max-w-[180px] truncate">{r.course_name}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize
                          ${r.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={r.status}
                          onChange={(e) => changeStatus(r.id, e.target.value)}
                          className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs bg-slate-50 focus:outline-none"
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {attendanceRecords.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-10 text-slate-400">No records yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}