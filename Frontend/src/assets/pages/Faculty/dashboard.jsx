import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const statCards = [
  {
    key: "totalStudents",
    label: "Department Students",
    icon: "👥",
    path: "/faculty/attendance",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    countBg: "bg-blue-100 text-blue-700",
    cta: "View Attendance →",
  },
  {
    key: "totalCourses",
    label: "Active Courses",
    icon: "📚",
    path: "/faculty/marks",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    countBg: "bg-emerald-100 text-emerald-700",
    cta: "Manage Marks →",
  },
  {
    key: "attendance",
    label: "Mark Attendance",
    icon: "📆",
    path: "/faculty/attendance",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    countBg: "bg-amber-100 text-amber-700",
    static: "✍️",
    cta: "Go to Attendance →",
  },
  {
    key: "rewards",
    label: "Reward Points",
    icon: "🏅",
    path: "/faculty/rewards",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    countBg: "bg-violet-100 text-violet-700",
    static: "⭐",
    cta: "Award Points →",
  },
];

const quickLinks = [
  { label: "Mark Today's Attendance", path: "/faculty/attendance", icon: "✅", desc: "Record present/absent" },
  { label: "Add PT Marks", path: "/faculty/marks", icon: "📝", desc: "Periodic test scores" },
  { label: "Update End Sem Grades", path: "/faculty/marks", icon: "🎓", desc: "Final semester grades" },
  { label: "Award Reward Points", path: "/faculty/rewards", icon: "🌟", desc: "Recognise achievements" },
];

export default function FacultyDashboard() {
  const [stats, setStats] = useState({ totalStudents: 0, totalCourses: 0 });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_SERVER_APP_URL;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [studentsRes, coursesRes] = await Promise.all([
          axios.get(`${baseURL}/faculty/students`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/courses`, { withCredentials: true }),
        ]);
        setStats({
          totalStudents: studentsRes.data?.data?.length || 0,
          totalCourses: coursesRes.data?.data?.length || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 py-8 max-w-6xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Faculty Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back{user?.username ? `, ${user.username}` : ""}! Manage your department below.
          </p>
        </div>
        {user?.department && (
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm whitespace-nowrap">
            🏫 {user.department}
          </span>
        )}
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-white rounded-2xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {statCards.map((c) => (
            <button
              key={c.key}
              onClick={() => navigate(c.path)}
              className={`group text-left ${c.bg} border ${c.border} rounded-2xl p-4 sm:p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xl sm:text-2xl">{c.icon}</span>
                {!c.static && (
                  <span className={`text-xs font-bold ${c.countBg} px-2 py-0.5 rounded-full`}>
                    {stats[c.key] ?? 0}
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {c.label}
              </p>
              <p className={`text-2xl sm:text-3xl font-black ${c.text}`}>
                {c.static ? c.static : stats[c.key] ?? 0}
              </p>
              <p className={`mt-3 text-[11px] sm:text-xs font-semibold ${c.text} opacity-60 group-hover:opacity-100 transition-opacity`}>
                {c.cta}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((q, i) => (
            <button
              key={q.label}
              onClick={() => navigate(q.path)}
              className={`group flex flex-col items-start gap-2 p-5 hover:bg-slate-50 transition-colors text-left
                ${i < quickLinks.length - 1 ? "border-b sm:border-b-0 sm:border-r border-slate-100" : ""}
                ${i === 1 ? "lg:border-r border-slate-100" : ""}
              `}
            >
              <span className="text-2xl">{q.icon}</span>
              <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                {q.label}
              </span>
              <span className="text-xs text-slate-400">{q.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}