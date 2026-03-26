import React, { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import axios from "axios";
import {
  CalendarCheck,
  NotebookPen,
  GraduationCap,
  CheckCircle,
  XCircle,
  ArrowRight,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";

function StudentDashboard() {
  const [stats, setStats] = useState({ attendance: [], ptScores: [], semesterScores: [] });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const studentId = user?.id;

  useEffect(() => { fetchDashboardStats(); }, [studentId]);

  const fetchDashboardStats = async () => {
    try {
      const [attendRes, ptRes, semRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/attendance/${studentId}`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/ptscores/${studentId}`, { withCredentials: true }),
        axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/semesterscores/${studentId}`, { withCredentials: true }),
      ]);
      setStats({
        attendance: attendRes.data?.data || [],
        ptScores: ptRes.data?.data || [],
        semesterScores: semRes.data?.data || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = stats.attendance.filter((a) => a.status === "present").length;
  const absentCount = stats.attendance.filter((a) => a.status === "absent").length;
  const totalClasses = stats.attendance.length;
  const attendancePct = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;
  const avgPt =
    stats.ptScores.length > 0
      ? (stats.ptScores.reduce((s, i) => s + (i.marks || 0), 0) / stats.ptScores.length).toFixed(1)
      : 0;

  const recentAttendance = stats.attendance.slice(0, 5);
  const recentPt = stats.ptScores.slice(0, 5);

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">Student Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="font-semibold text-blue-600">{user?.username}</span>! Here's your academic overview.
            </p>
          </div>
        </div>

        {loading && <div className="text-center text-blue-600 py-10">Loading dashboard...</div>}

        {!loading && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<CalendarCheck className="text-blue-600" size={30} />} label="Total Classes" value={totalClasses} color="blue" />
              <StatCard icon={<CheckCircle className="text-green-600" size={30} />} label="Present" value={presentCount} color="green" />
              <StatCard icon={<XCircle className="text-red-500" size={30} />} label="Absent" value={absentCount} color="red" />
              <StatCard icon={<NotebookPen className="text-indigo-600" size={30} />} label="PT Tests" value={stats.ptScores.length} color="indigo" />
            </div>

            {/* Attendance Progress Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h2 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                <CalendarCheck size={20} /> Attendance Overview
              </h2>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Attendance Rate</span>
                <span className={`font-semibold ${attendancePct >= 75 ? "text-green-600" : "text-red-500"}`}>
                  {attendancePct}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${attendancePct >= 75 ? "bg-blue-600" : "bg-red-500"}`}
                  style={{ width: `${attendancePct}%` }}
                />
              </div>
              {attendancePct < 75 && (
                <p className="text-xs text-red-500 mt-2 font-medium">⚠ Attendance below 75% threshold</p>
              )}
              <div className="flex gap-8 mt-5 text-sm">
                <div><p className="text-gray-500">Present</p><p className="text-2xl font-bold text-green-600">{presentCount}</p></div>
                <div><p className="text-gray-500">Absent</p><p className="text-2xl font-bold text-red-500">{absentCount}</p></div>
                <div><p className="text-gray-500">PT Avg</p><p className="text-2xl font-bold text-blue-600">{avgPt}</p></div>
                <div><p className="text-gray-500">Sem Scores</p><p className="text-2xl font-bold text-indigo-600">{stats.semesterScores.length}</p></div>
              </div>
            </div>

            {/* Recent Records */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Attendance */}
              <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <CalendarCheck size={20} /> Recent Attendance
                  </h2>
                  <a href="/student/attendance" className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium">
                    View all <ArrowRight size={13} />
                  </a>
                </div>
                {recentAttendance.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No records yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentAttendance.map((rec, i) => (
                      <div key={i} className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-800">{rec.course_name || `Course #${rec.course_id}`}</p>
                          <p className="text-xs text-gray-400">{rec.session_date?.split("T")[0]}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          rec.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent PT Scores */}
              <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <NotebookPen size={20} /> Recent PT Scores
                  </h2>
                  <a href="/student/ptscores" className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 font-medium">
                    View all <ArrowRight size={13} />
                  </a>
                </div>
                {recentPt.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No PT scores yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentPt.map((pt, i) => (
                      <div key={i} className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium text-gray-800">{pt.course_name || `Course #${pt.course_id}`}</p>
                          <p className="text-xs text-gray-400">PT {pt.pt_test_no}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">{pt.marks}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              <h2 className="text-lg font-semibold text-blue-700 mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Attendance", href: "/student/attendance" },
                  { label: "PT Scores", href: "/student/ptscores" },
                  { label: "Semester Scores", href: "/student/semesterscores" },
                  { label: "Courses", href: "/student/courses" },
                ].map((link) => (
                  <a key={link.label} href={link.href}
                    className="block p-3 border border-blue-100 rounded-lg hover:bg-blue-50 transition text-center text-sm font-medium text-blue-600">
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const borders = { blue: "border-blue-100", indigo: "border-indigo-100", green: "border-green-100", red: "border-red-100" };
  const texts = { blue: "text-blue-700", indigo: "text-indigo-700", green: "text-green-700", red: "text-red-600" };
  return (
    <div className={`bg-white rounded-xl shadow-md border ${borders[color]} p-6 flex justify-between items-center hover:shadow-lg transition`}>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h2 className={`text-2xl font-bold ${texts[color]}`}>{value}</h2>
      </div>
      {icon}
    </div>
  );
}

export default StudentDashboard;