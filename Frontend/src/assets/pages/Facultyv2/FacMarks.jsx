import { useState, useEffect } from "react";
import axios from "axios";
import CommonDialog from "../../../components/dialogbox";
import AdminTable from "../../../components/Tables";
import { NotebookPen, AlertCircle, Plus, Edit2 } from "lucide-react";

function FacultyMarks() {
  const [tab, setTab] = useState("pt");
  const [ptScores, setPtScores] = useState([]);
  const [endsemScores, setEndsemScores] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [editEnabled, setEditEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);

  const [ptForm, setPtForm] = useState({
    studentId: "",
    courseId: "",
    ptTestNo: "",
    marks: "",
  });
  const [endsemForm, setEndsemForm] = useState({
    studentId: "",
    courseId: "",
    semesterNo: "",
    grade: "",
  });
  const [filterStudent, setFilterStudent] = useState("");

  const baseURL = import.meta.env.VITE_SERVER_APP_URL;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [ptRes, endsemRes, studRes, courseRes, permRes] = await Promise.all(
        [
          axios.get(`${baseURL}/faculty/ptscores`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/endsem`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/students`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/courses`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/edit-permission`, {
            withCredentials: true,
          }),
        ],
      );
      setPtScores(ptRes.data.data || []);
      setEndsemScores(endsemRes.data.data || []);
      setStudents(studRes.data.data || []);
      setCourses(courseRes.data.data || []);
      // console.log(courseRes.data.data)
      setEditEnabled(permRes.data.data?.editEnabled || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPt = async () => {
    const { studentId, courseId, ptTestNo, marks } = ptForm;
    if (!studentId || !courseId || !ptTestNo || !marks) return;
    try {
      await axios.post(
        `${baseURL}/faculty/ptscores`,
        {
          studentId,
          courseId,
          ptTestNo: Number(ptTestNo),
          marks: Number(marks),
        },
        { withCredentials: true },
      );
      setAddOpen(false);
      setPtForm({ studentId: "", courseId: "", ptTestNo: "", marks: "" });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEndsem = async () => {
    const { studentId, courseId, semesterNo, grade } = endsemForm;
    if (!studentId || !courseId || !semesterNo || !grade) return;
    try {
      await axios.post(
        `${baseURL}/faculty/endsem`,
        { studentId, courseId, semesterNo: Number(semesterNo), grade },
        { withCredentials: true },
      );
      setAddOpen(false);
      setEndsemForm({ studentId: "", courseId: "", semesterNo: "", grade: "" });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPtSave = async () => {
    try {
      await axios.patch(
        `${baseURL}/faculty/ptscores/${editRecord.id}`,
        { marks: Number(editRecord.marks) },
        { withCredentials: true },
      );
      setEditOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditEndsemSave = async () => {
    try {
      await axios.patch(
        `${baseURL}/faculty/endsem/${editRecord.id}`,
        { grade: editRecord.grade },
        { withCredentials: true },
      );
      setEditOpen(false);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  const ptFiltered = filterStudent
    ? ptScores.filter((r) => String(r.student_id) === filterStudent)
    : ptScores;

  const endsemFiltered = filterStudent
    ? endsemScores.filter((r) => String(r.student_id) === filterStudent)
    : endsemScores;

  const gradeOptions = ["O", "A+", "A", "B+", "B", "C", "D", "F"];

  const ptColumns = [
    {
      key: "student_name",
      label: "Student",
      render: (v, r) => v || `${r.username.toUpperCase()}`,
    },
    {
      key: "course_name",
      label: "Course",
      render: (v, r) => v || `ID: ${r.course_id}`,
    },
    { key: "pt_test_no", label: "PT No." },
    {
      key: "marks",
      label: "Marks",
      render: (v) => (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
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

  const endsemColumns = [
    {
      key: "student_name",
      label: "Student",
      render: (v, r) => v || `${r.username.toUpperCase()}`,
    },
    {
      key: "course_name",
      label: "Course",
      render: (v, r) => v || `ID: ${r.course_id}`,
    },
    { key: "semester_no", label: "Semester" },
    {
      key: "grade",
      label: "Grade",
      render: (v) => {
        const color =
          v === "O" || v === "A+"
            ? "bg-green-100 text-green-700"
            : v === "A" || v === "B+"
              ? "bg-blue-100 text-blue-700"
              : v === "B" || v === "C"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-600";
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${color}`}>
            {v.toUpperCase()}
          </span>
        );
      },
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
              <NotebookPen className="text-blue-600" size={26} />
              <div>
                <h1 className="text-2xl font-semibold text-blue-700">
                  Exams & Marks
                </h1>
                <p className="text-sm text-gray-500">
                  Manage PT scores and semester grades
                </p>
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
                  onClick={() => setAddOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm"
                >
                  <Plus size={16} /> Add{" "}
                  {tab === "pt" ? "PT Score" : "Semester Grade"}
                </button>
              )}
            </div>
          </div>
        </div>

        {!editEnabled && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-sm">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
            <span>
              Admin has <strong>disabled record editing</strong>. You can view
              records only.
            </span>
          </div>
        )}

        {/* Tabs + Filter */}
        <div className="bg-white rounded-xl border border-blue-100 shadow-sm px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-3">
              <button
                onClick={() => setTab("pt")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === "pt"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                }`}
              >
                PT Scores ({ptScores.length})
              </button>
              <button
                onClick={() => setTab("endsem")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  tab === "endsem"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                }`}
              >
                Semester Grades ({endsemScores.length})
              </button>
            </div>

            <div className="sm:w-56">
              <select
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none"
              >
                <option value="">All Students</option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.username || s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-blue-600 py-10">
            Loading records...
          </div>
        ) : tab === "pt" ? (
          <AdminTable
            data={ptFiltered}
            columns={ptColumns}
            emptyText="No PT scores found."
          />
        ) : (
          <AdminTable
            data={endsemFiltered}
            columns={endsemColumns}
            emptyText="No semester grades found."
          />
        )}
      </div>

      {/* Add PT Dialog */}
      {tab === "pt" && (
        <CommonDialog
          open={addOpen}
          setOpen={setAddOpen}
          title="Add PT Score"
          onSave={handleAddPt}
          saveText="Add Score"
        >
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Student
              </label>
              <select
                value={ptForm.studentId}
                onChange={(e) =>
                  setPtForm({ ...ptForm, studentId: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Course
              </label>
              <select
                value={ptForm.courseId}
                onChange={(e) =>
                  setPtForm({ ...ptForm, courseId: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              >
                <option value="">Select Course</option>
               {courses.map((c) => (
  <option key={c.course_id} value={c.course_id}>
    {c.course_name}
  </option>
))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  PT Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={ptForm.ptTestNo}
                  onChange={(e) =>
                    setPtForm({ ...ptForm, ptTestNo: e.target.value })
                  }
                  placeholder="1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Marks
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={ptForm.marks}
                  onChange={(e) =>
                    setPtForm({ ...ptForm, marks: e.target.value })
                  }
                  placeholder="25"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                />
              </div>
            </div>
          </div>
        </CommonDialog>
      )}

      {/* Add Endsem Dialog */}
      {tab === "endsem" && (
        <CommonDialog
          open={addOpen}
          setOpen={setAddOpen}
          title="Add Semester Grade"
          onSave={handleAddEndsem}
          saveText="Add Grade"
        >
          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Student
              </label>
              <select
                value={endsemForm.studentId}
                onChange={(e) =>
                  setEndsemForm({ ...endsemForm, studentId: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              >
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Course
              </label>
              <select
                value={endsemForm.courseId}
                onChange={(e) =>
                  setEndsemForm({ ...endsemForm, courseId: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Semester No.
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={endsemForm.semesterNo}
                  onChange={(e) =>
                    setEndsemForm({ ...endsemForm, semesterNo: e.target.value })
                  }
                  placeholder="4"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Grade
                </label>
                <select
                  value={endsemForm.grade}
                  onChange={(e) =>
                    setEndsemForm({ ...endsemForm, grade: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
                >
                  <option value="">Select Grade</option>
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CommonDialog>
      )}

      {/* Edit PT Dialog */}
      {tab === "pt" && editRecord && (
        <CommonDialog
          open={editOpen}
          setOpen={setEditOpen}
          title="Edit PT Score"
          onSave={handleEditPtSave}
          saveText="Update"
        >
          <div className="space-y-4">
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
                <span className="font-medium">PT No.:</span>{" "}
                {editRecord.pt_test_no}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                New Marks
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={editRecord.marks}
                onChange={(e) =>
                  setEditRecord({ ...editRecord, marks: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              />
            </div>
          </div>
        </CommonDialog>
      )}

      {/* Edit Endsem Dialog */}
      {tab === "endsem" && editRecord && (
        <CommonDialog
          open={editOpen}
          setOpen={setEditOpen}
          title="Edit Semester Grade"
          onSave={handleEditEndsemSave}
          saveText="Update"
        >
          <div className="space-y-4">
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
                <span className="font-medium">Semester:</span>{" "}
                {editRecord.semester_no}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                New Grade
              </label>
              <select
                value={editRecord.grade}
                onChange={(e) =>
                  setEditRecord({ ...editRecord, grade: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              >
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CommonDialog>
      )}
    </div>
  );
}

export default FacultyMarks;
