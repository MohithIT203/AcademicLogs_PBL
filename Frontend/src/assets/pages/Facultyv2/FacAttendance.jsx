import { useState, useEffect } from "react";
import axios from "axios";
import CommonDialog from "../../../components/dialogbox";
import AdminTable from "../../../components/Tables";
import { CalendarCheck, AlertCircle, Plus, Edit2 } from "lucide-react";

function FacultyAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEnabled, setEditEnabled] = useState(false);

  const [markOpen, setMarkOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const [filterStudent, setFilterStudent] = useState("");
  const [filterCourse, setFilterCourse] = useState("");

  const [markForm, setMarkForm] = useState({
    studentId: "",
    courseId: "",
    sessionDate: "",
    status: "present",
  });

  const baseURL = import.meta.env.VITE_SERVER_APP_URL;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [attRes, studRes, courseRes, permRes] = await Promise.all([
        axios.get(`${baseURL}/faculty/attendance-records`, { withCredentials: true }),
        axios.get(`${baseURL}/faculty/students`, { withCredentials: true }),
        axios.get(`${baseURL}/faculty/courses`, { withCredentials: true }),
        axios.get(`${baseURL}/faculty/edit-permission`, { withCredentials: true }),
      ]);
      setAttendance(attRes.data.data || []);
      setStudents(studRes.data.data || []);
      setCourses(courseRes.data.data || []);
      
      setEditEnabled(permRes.data.data?.editEnabled || false);
      console.log(studRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkSave = async () => {
    if (!markForm.studentId || !markForm.courseId || !markForm.sessionDate) return;
    try {
      await axios.post(
        `${baseURL}/faculty/attendance`,
        {
          studentId: markForm.studentId,
          courseId: markForm.courseId,
          sessionDate: markForm.sessionDate,
          status: markForm.status,
        },
        { withCredentials: true }
      );
      setMarkOpen(false);
      setMarkForm({ studentId: "", courseId: "", sessionDate: "", status: "present" });
      fetchAll();
    } catch (err) {
      console.error("Error marking attendance:", err);
    }
  };

  const handleEditSave = async () => {
    if (!editRecord) return;
    try {
      await axios.patch(
        `${baseURL}/faculty/attendance/${editRecord.id}`,
        { status: editRecord.status },
        { withCredentials: true }
      );
      setEditOpen(false);
      setEditRecord(null);
      fetchAll();
    } catch (err) {
      console.error("Error updating attendance:", err);
    }
  };

  const filtered = attendance.filter((r) => {
    const matchStudent = filterStudent ? String(r.student_id) === filterStudent : true;
    const matchCourse = filterCourse ? String(r.course_id) === filterCourse : true;
    return matchStudent && matchCourse;
  });

  const columns = [
    { key: "student_name", label: "Student", render: (v, r) => v || `ID: ${r.student_id}` },
    { key: "course_name", label: "Course", render: (v, r) => v || `ID: ${r.course_id}` },
    {
      key: "session_date",
      label: "Date",
      render: (v) => new Date(v).toLocaleDateString(),
    },
    {
      key: "status",
      label: "Status",
      render: (v) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            v === "present" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
          }`}
        >
          {v}
        </span>
      ),
    },
    {
      key: "id",
      label: "Action",
      render: (_, row) =>
        editEnabled ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditRecord({ ...row });
              setEditOpen(true);
            }}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            <Edit2 size={14} /> Edit
          </button>
        ) : (
          <span className="text-xs text-gray-400">Locked</span>
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
              <CalendarCheck className="text-blue-600" size={26} />
              <div>
                <h1 className="text-2xl font-semibold text-blue-700">Attendance Management</h1>
                <p className="text-sm text-gray-500">Mark and manage student attendance</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <span
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                  editEnabled
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-500 border-red-200"
                }`}
              >
                Editing {editEnabled ? "Enabled" : "Disabled"}
              </span>

              {editEnabled && (
                <button
                  onClick={() => setMarkOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                >
                  <Plus size={16} /> Mark Attendance
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Edit disabled banner */}
        {!editEnabled && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
            <span>
              Admin has <strong>disabled record editing</strong>. You can view records but cannot mark or modify attendance.
            </span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                Filter by Student
              </label>
              <select
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">All Students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.student_id}>
                    {s.username || s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                Filter by Course
              </label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.course_id}>
                    {c.course_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-blue-600 py-10">Loading attendance records...</div>
        ) : (
          <AdminTable
            data={filtered}
            columns={columns}
            loadingText="Loading..."
            emptyText="No attendance records found."
          />
        )}
      </div>

      {/* Mark Attendance Dialog */}
      <CommonDialog
        open={markOpen}
        setOpen={setMarkOpen}
        title="Mark Attendance"
        onSave={handleMarkSave}
        saveText="Mark"
      >
        <div className="space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Student</label>
            <select
              value={markForm.studentId}
              onChange={(e) => setMarkForm({ ...markForm, studentId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            >
              <option value="">Select Student</option>
              {students.map((s) => (
                <option key={s.id} value={s.student_id}>
                  {s.username || s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Course</label>
            <select
              value={markForm.courseId}
              onChange={(e) => setMarkForm({ ...markForm, courseId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.course_id}>
                  {c.course_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Session Date</label>
            <input
              type="date"
              value={markForm.sessionDate}
              onChange={(e) => setMarkForm({ ...markForm, sessionDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">Status</label>
            <div className="flex gap-4">
              {["present", "absent"].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={markForm.status === s}
                    onChange={() => setMarkForm({ ...markForm, status: s })}
                    className="accent-blue-600"
                  />
                  <span className="text-sm capitalize font-medium text-gray-700">{s}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </CommonDialog>

      {/* Edit Attendance Dialog */}
      <CommonDialog
        open={editOpen}
        setOpen={setEditOpen}
        title="Edit Attendance Record"
        onSave={handleEditSave}
        saveText="Update"
      >
        {editRecord && (
          <div className="space-y-5">
            <div className="bg-blue-50 rounded-lg p-4 text-sm text-gray-700 space-y-1">
              <p>
                <span className="font-medium">Student:</span>{" "}
                {editRecord.student_name || editRecord.student_id}
              </p>
              <p>
                <span className="font-medium">Course:</span>{" "}
                {editRecord.course_name || editRecord.course_id}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {new Date(editRecord.session_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">
                Update Status
              </label>
              <div className="flex gap-4">
                {["present", "absent"].map((s) => (
                  <label key={s} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="edit-status"
                      value={s}
                      checked={editRecord.status === s}
                      onChange={() => setEditRecord({ ...editRecord, status: s })}
                      className="accent-blue-600"
                    />
                    <span className="text-sm capitalize font-medium text-gray-700">{s}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </CommonDialog>
    </div>
  );
}

export default FacultyAttendance;