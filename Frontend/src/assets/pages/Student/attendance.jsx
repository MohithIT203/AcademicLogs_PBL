import { useEffect, useState } from "react";
import axios from "axios";

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const weekdays = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export default function StudentAttendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const studentId = 1;

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attendanceData, selectedCourse, selectedStatus, currentDate]);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`/attendance/${studentId}`);
      if (res.data && Array.isArray(res.data.data)) {
        setAttendanceData(res.data.data);
      } else {
        setAttendanceData([]);
      }
    } catch (err) {
      console.error(err);
      setAttendanceData([]);
    }
  };

  const applyFilters = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const filtered = attendanceData.filter((item) => {
      const date = new Date(item.session_date);
      const matchesMonth =
        date.getFullYear() === year && date.getMonth() === month;

      const matchesCourse =
        selectedCourse === "all" || item.course_name === selectedCourse;

      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;

      return matchesMonth && matchesCourse && matchesStatus;
    });

    setFilteredData(filtered);
  };

  const attendanceMap = {};
  filteredData.forEach((item) => {
    attendanceMap[item.session_date.split("T")[0]] = item.status;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = (firstDay.getDay() + 6) % 7;

  const changeMonth = (dir) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const presentCount = filteredData.filter(d => d.status === "present").length;
  const absentCount = filteredData.filter(d => d.status === "absent").length;

  return (
    <div className="px-3 sm:px-6 md:px-10 py-6 space-y-6">

      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select
            className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {[...new Set(attendanceData.map(d => d.course_name))].map(course => (
              <option key={course}>{course}</option>
            ))}
          </select>

          <select
            className="border rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        <div className="flex gap-6 text-sm font-medium justify-between md:justify-start">
          <span className="text-green-600">Present: {presentCount}</span>
          <span className="text-red-500">Absent: {absentCount}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* CALENDAR */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1 text-lg"
            >
              ‹
            </button>

            <h2 className="font-semibold text-base sm:text-lg">
              {months[month]} {year}
            </h2>

            <button
              onClick={() => changeMonth(1)}
              className="bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1 text-lg"
            >
              ›
            </button>
          </div>

          {/* WEEKDAYS */}
          <div className="grid grid-cols-7 text-[10px] sm:text-xs text-gray-500 text-center mb-2">
            {weekdays.map(day => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* DAYS */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {[...Array(startDay)].map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {[...Array(daysInMonth)].map((_, index) => {
              const day = index + 1;
              const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const status = attendanceMap[dateKey];

              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-[10px] sm:text-xs
                  ${
                    status === "present"
                      ? "bg-green-100 text-green-700"
                      : status === "absent"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100"
                  }`}
                >
                  <span className="font-semibold text-xs sm:text-sm">{day}</span>
                  {status && (
                    <span className="capitalize text-[9px] sm:text-[10px] mt-1">
                      {status}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* LEGEND */}
          <div className="flex justify-around mt-5 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-600 rounded-full"></span> Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-600 rounded-full"></span> Absent
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 overflow-x-auto">
          <h3 className="font-semibold mb-4 text-sm sm:text-base">
            Attendance Records
          </h3>

          <table className="min-w-[400px] w-full text-xs sm:text-sm">
            <thead className="bg-slate-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 text-center">Date</th>
                <th className="px-4 py-2 text-center">Course</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {filteredData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-center">
                    {item.session_date.split("T")[0]}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {item.course_name}
                  </td>
                  <td
                    className={`px-4 py-2 text-center font-medium 
                      ${item.status === "present"
                        ? "text-green-600"
                        : "text-red-500"}`}
                  >
                    {item.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
