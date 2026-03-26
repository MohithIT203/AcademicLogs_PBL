import { useState, useEffect } from "react";
import { useAuth } from "../Context/AuthContext.jsx";
import axios from "axios";
import { CalendarCheck } from "lucide-react";

const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function StudentAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const studentId = user?.id;

  useEffect(() => { fetchAttendance(); }, []);
  useEffect(() => { applyFilters(); }, [attendanceData, selectedCourse, selectedStatus, currentDate]);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/attendance/${studentId}`, { withCredentials: true });
      setAttendanceData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch { setAttendanceData([]); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    const year = currentDate.getFullYear(), month = currentDate.getMonth();
    setFilteredData(attendanceData.filter((item) => {
      const d = new Date(item.session_date);
      return (
        d.getFullYear() === year && d.getMonth() === month &&
        (selectedCourse === "all" || item.course_name === selectedCourse) &&
        (selectedStatus === "all" || item.status === selectedStatus)
      );
    }));
  };

  const year = currentDate.getFullYear(), month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = (firstDay.getDay() + 6) % 7;

  const attendanceMap = {};
  filteredData.forEach((item) => { attendanceMap[item.session_date?.split("T")[0]] = item.status; });

  const presentCount = filteredData.filter((d) => d.status === "present").length;
  const absentCount = filteredData.filter((d) => d.status === "absent").length;
  const courses = [...new Set(attendanceData.map((d) => d.course_name))];

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <CalendarCheck className="text-blue-600" size={26} />
            <div>
              <h1 className="text-2xl font-semibold text-blue-700">Attendance</h1>
              <p className="text-sm text-gray-500">View your attendance records</p>
            </div>
          </div>
        </div>

        {/* Filters + Stats */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="all">All Courses</option>
                {courses.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div className="flex gap-6 text-sm font-medium">
              <span className="text-green-600">Present: {presentCount}</span>
              <span className="text-red-500">Absent: {absentCount}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-blue-600 py-10">Loading attendance records...</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Calendar */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
              {/* Month nav */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                  className="bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1 text-lg transition"
                >‹</button>
                <h2 className="font-semibold text-base text-blue-700">{months[month]} {year}</h2>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                  className="bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1 text-lg transition"
                >›</button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 text-xs text-gray-400 text-center mb-2">
                {weekdays.map((d) => <div key={d}>{d}</div>)}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {[...Array(startDay)].map((_, i) => <div key={`e${i}`} />)}
                {[...Array(daysInMonth)].map((_, idx) => {
                  const day = idx + 1;
                  const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const status = attendanceMap[key];
                  return (
                    <div key={day} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs
                      ${status === "present" ? "bg-green-100 text-green-700" : status === "absent" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                      <span className="font-semibold text-sm">{day}</span>
                      {status && <span className="text-[9px] mt-0.5 capitalize">{status}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex justify-around mt-5 text-xs">
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full" /> Present</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full" /> Absent</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-300 rounded-full" /> No class</span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 overflow-x-auto">
              <h3 className="font-semibold text-blue-700 mb-4">Records — {months[month]} {year}</h3>
              {filteredData.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">No records for this period.</p>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Date</th>
                      <th className="px-4 py-2 text-left font-medium">Course</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredData.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-500">{item.session_date?.split("T")[0]}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">{item.course_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}