import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalLogs: 0,
  });

  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const getActionColor = (action) => {
    switch (action) {
      case "CREATE":
        return "bg-green-100 text-green-600";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-600";
      case "DELETE":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

 useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      const baseURL = import.meta.env.VITE_SERVER_APP_URL;

     const logRes = await axios.get(`${baseURL}/academic-logs`, { withCredentials: true });
      const statsRes = await axios.get(`${baseURL}/dashboard-stats`, { withCredentials: true });

      setStats(statsRes.data.data);
    
      setRecentLogs(logRes.data.data);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, []);

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Overview and recent system activity
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center text-blue-600 py-10">
            Loading dashboard...
          </div>
        )}

        {!loading && (
          <>
            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              <div
                onClick={() => navigate("/users")}
                className="bg-white rounded-xl shadow-md border border-blue-100 p-6 flex justify-between items-center hover:shadow-lg cursor-pointer transition"
              >
                <div>
                  <p className="text-sm text-gray-500">Total Students</p>
                  <h2 className="text-2xl font-bold text-blue-700">
                    {stats.totalStudents}
                  </h2>
                </div>
                <Users className="text-blue-600" size={32} />
              </div>

              <div
                onClick={() => navigate("/users")}
                className="bg-white rounded-xl shadow-md border border-blue-100 p-6 flex justify-between items-center hover:shadow-lg cursor-pointer transition"
              >
                <div>
                  <p className="text-sm text-gray-500">Total Faculty</p>
                  <h2 className="text-2xl font-bold text-blue-700">
                    {stats.totalFaculty}
                  </h2>
                </div>
                <GraduationCap className="text-blue-600" size={32} />
              </div>

              <div
                onClick={() => navigate("/courses")}
                className="bg-white rounded-xl shadow-md border border-blue-100 p-6 flex justify-between items-center hover:shadow-lg cursor-pointer transition"
              >
                <div>
                  <p className="text-sm text-gray-500">Total Courses</p>
                  <h2 className="text-2xl font-bold text-blue-700">
                    {stats.totalCourses}
                  </h2>
                </div>
                <BookOpen className="text-blue-600" size={32} />
              </div>

              <div
                onClick={() => navigate("/logs")}
                className="bg-white rounded-xl shadow-md border border-blue-100 p-6 flex justify-between items-center hover:shadow-lg cursor-pointer transition"
              >
                <div>
                  <p className="text-sm text-gray-500">Total Logs</p>
                  <h2 className="text-2xl font-bold text-blue-700">
                    {stats.totalLogs}
                  </h2>
                </div>
                <ClipboardList className="text-blue-600" size={32} />
              </div>

            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-blue-700">
                  Recent Activities
                </h2>
                <button
                  onClick={() => navigate("/logs")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View All
                </button>
              </div>

              {recentLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-6">
                  No recent activities found.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-blue-50 border border-blue-100 rounded-lg p-4 hover:shadow transition"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>

                          <span className="text-sm font-medium text-gray-700">
                            {log.actor_role} (ID: {log.actor_id})
                          </span>

                          <span className="text-sm text-gray-500">
                            → {log.affected_table}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400">
                          Record ID: {log.affected_record_id || "N/A"}
                        </p>
                      </div>

                      <div className="text-xs text-gray-400 mt-2 sm:mt-0">
                        {new Date(log.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
