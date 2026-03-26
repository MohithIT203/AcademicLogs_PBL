import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  BookOpen,
  CalendarCheck,
  NotebookPen,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

function FacultyDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    presentToday: 0,
    absentToday: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [recentPtScores, setRecentPtScores] = useState([]);
  const [editEnabled, setEditEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseURL = import.meta.env.VITE_SERVER_APP_URL;
        const [studRes, coursesRes, attendanceRes, ptRes, permRes] = await Promise.all([
          axios.get(`${baseURL}/faculty/students`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/courses`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/attendance-records`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/ptscores`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/edit-permission`, { withCredentials: true }),
        ]);

        const students = studRes.data.data || [];
        const courses = coursesRes.data.data || [];
        const attendance = attendanceRes.data.data || [];
        const ptScores = ptRes.data.data || [];

        const today = new Date().toISOString().split("T")[0];
        const todayAttendance = attendance.filter(
          (a) => a.session_date?.split("T")[0] === today
        );

        setStats({
          totalStudents: students.length,
          totalCourses: courses.length,
          presentToday: todayAttendance.filter((a) => a.status === "present").length,
          absentToday: todayAttendance.filter((a) => a.status === "absent").length,
        });

        setRecentAttendance(attendance.slice(0, 5));
        setRecentPtScores(ptScores.slice(0, 5));
        // ✅ Fixed: was permRes.data.editEnabled
        setEditEnabled(permRes.data.data?.editEnabled || false);
      } catch (err) {
        console.error("Faculty dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
              Faculty Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Overview of your classes and student records
            </p>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${
              editEnabled
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-600 border-red-200"
            }`}
          >
            {editEnabled ? (
              <>
                <CheckCircle size={16} />
                Record Editing: Enabled
              </>
            ) : (
              <>
                <XCircle size={16} />
                Record Editing: Disabled
              </>
            )}
          </div>
        </div>

        {!editEnabled && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
            <span>
              Record editing is currently <strong>disabled by the admin</strong>. You can view
              all records but cannot add or modify attendance, PT scores, or semester scores.
              Please contact your admin to enable editing.
            </span>
          </div>
        )}

        {loading && (
          <div className="text-center text-blue-600 py-10">Loading dashboard...</div>
        )}

        {!loading && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<Users className="text-blue-600" size={30} />}
                label="Total Students"
                value={stats.totalStudents}
                color="blue"
              />
              <StatCard
                icon={<BookOpen className="text-indigo-600" size={30} />}
                label="Courses Assigned"
                value={stats.totalCourses}
                color="indigo"
              />
              <StatCard
                icon={<CheckCircle className="text-green-600" size={30} />}
                label="Present Today"
                value={stats.presentToday}
                color="green"
              />
              <StatCard
                icon={<XCircle className="text-red-500" size={30} />}
                label="Absent Today"
                value={stats.absentToday}
                color="red"
              />
            </div>

            {/* Recent Records */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Attendance */}
              <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <CalendarCheck size={20} /> Recent Attendance
                  </h2>
                </div>
                {recentAttendance.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No records yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentAttendance.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {rec.student_name || `Student #${rec.student_id}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {rec.course_name || `Course #${rec.course_id}`} ·{" "}
                            {new Date(rec.session_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            rec.status === "present"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
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
                </div>
                {recentPtScores.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-4">No PT scores yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentPtScores.map((pt) => (
                      <div
                        key={pt.id}
                        className="flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {pt.student_name || `Student #${pt.student_id}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {pt.course_name || `Course #${pt.course_id}`} · PT {pt.pt_test_no}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                          {pt.marks}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const borders = {
    blue: "border-blue-100",
    indigo: "border-indigo-100",
    green: "border-green-100",
    red: "border-red-100",
  };
  const texts = {
    blue: "text-blue-700",
    indigo: "text-indigo-700",
    green: "text-green-700",
    red: "text-red-600",
  };
  return (
    <div
      className={`bg-white rounded-xl shadow-md border ${borders[color]} p-6 flex justify-between items-center hover:shadow-lg transition`}
    >
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h2 className={`text-2xl font-bold ${texts[color]}`}>{value}</h2>
      </div>
      {icon}
    </div>
  );
}

export default FacultyDashboard;