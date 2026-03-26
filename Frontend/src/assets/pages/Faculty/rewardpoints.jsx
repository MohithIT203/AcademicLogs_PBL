import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Context/AuthContext.jsx";

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold border
      ${isError ? "bg-red-50 text-red-700 border-red-200" : "bg-green-50 text-green-700 border-green-200"}`}>
      <span>{isError ? "✗" : "✓"}</span>
      {toast.msg}
    </div>
  );
}

export default function FacultyMarks() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [ptRecords, setPtRecords] = useState([]);
  const [endsemRecords, setEndsemRecords] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("pt");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [editingPt, setEditingPt] = useState({});
  const [editingEnd, setEditingEnd] = useState({});
  const [ptForm, setPtForm] = useState({ courseId: "", ptTestNo: "", marks: "" });
  const [endForm, setEndForm] = useState({ courseId: "", semesterNo: "", grade: "" });
  const baseURL = import.meta.env.VITE_SERVER_APP_URL;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [stuRes, couRes] = await Promise.all([
          axios.get(`${baseURL}/faculty/students`, { withCredentials: true }),
          axios.get(`${baseURL}/faculty/courses`, { withCredentials: true }),
        ]);
        setStudents(stuRes.data.data || []);
        setCourses(couRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [baseURL]);

  const fetchRecords = async (studentId) => {
    try {
      const [ptRes, endRes] = await Promise.all([
        axios.get(`${baseURL}/faculty/ptscores?studentId=${studentId}`, { withCredentials: true }).catch(() => ({ data: {} })),
        axios.get(`${baseURL}/faculty/endsem?studentId=${studentId}`, { withCredentials: true }).catch(() => ({ data: {} })),
      ]);
      setPtRecords(ptRes.data.data || []);
      setEndsemRecords(endRes.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const selectStudent = (stu) => {
    setSelectedStudent(stu);
    setPtForm({ courseId: "", ptTestNo: "", marks: "" });
    setEndForm({ courseId: "", semesterNo: "", grade: "" });
    setEditingPt({});
    setEditingEnd({});
    fetchRecords(stu.student_id);
  };

  const clearSelection = () => {
    setSelectedStudent(null);
    setPtRecords([]);
    setEndsemRecords([]);
    setEditingPt({});
    setEditingEnd({});
  };

  const submitPt = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await axios.post(`${baseURL}/faculty/ptscores`, { studentId: selectedStudent.student_id, ...ptForm }, { withCredentials: true });
      showToast("PT score added");
      setPtForm({ courseId: "", ptTestNo: "", marks: "" });
      fetchRecords(selectedStudent.student_id);
    } catch (err) {
      showToast("Error adding PT score", "error");
    }
  };

  const submitEnd = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await axios.post(`${baseURL}/faculty/endsem`, { studentId: selectedStudent.student_id, ...endForm }, { withCredentials: true });
      showToast("End semester score added");
      setEndForm({ courseId: "", semesterNo: "", grade: "" });
      fetchRecords(selectedStudent.student_id);
    } catch (err) {
      showToast("Error adding endsem score", "error");
    }
  };

  const savePt = async (id) => {
    const marks = editingPt[id];
    if (marks == null) return;
    try {
      await axios.patch(`${baseURL}/faculty/ptscores/${id}`, { marks }, { withCredentials: true });
      setPtRecords((prev) => prev.map((r) => (r.id === id ? { ...r, marks } : r)));
      setEditingPt((prev) => { const n = { ...prev }; delete n[id]; return n; });
      showToast("PT score updated");
    } catch (err) {
      showToast("Failed to update", "error");
    }
  };

  const saveEnd = async (id) => {
    const grade = editingEnd[id];
    if (!grade) return;
    try {
      await axios.patch(`${baseURL}/faculty/endsem/${id}`, { grade }, { withCredentials: true });
      setEndsemRecords((prev) => prev.map((r) => (r.id === id ? { ...r, grade } : r)));
      setEditingEnd((prev) => { const n = { ...prev }; delete n[id]; return n; });
      showToast("Grade updated");
    } catch (err) {
      showToast("Failed to update", "error");
    }
  };

  if (user?.role !== "faculty") return <p className="text-red-500 p-8">Unauthorized</p>;

  const filtered = students.filter(
    (s) =>
      s.username?.toLowerCase().includes(search.toLowerCase()) ||
      s.regno?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-100";
  const labelCls = "text-xs font-semibold text-slate-500 uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-slate-50 px-4 sm:px-6 lg:px-10 py-8 max-w-6xl mx-auto">
      <Toast toast={toast} />

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">Manage Marks</h1>
          <p className="mt-1 text-sm text-slate-500">
            {selectedStudent
              ? `Editing marks for ${selectedStudent.username} (${selectedStudent.regno})`
              : "Select a student to add or update marks"}
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

      {/* ── Student List ── */}
      {!selectedStudent && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-700">Department Students</h2>
            <input
              className="w-full sm:w-64 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-slate-50"
              placeholder="Search by name or reg no…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Mobile */}
          <div className="sm:hidden divide-y divide-slate-100">
            {filtered.map((s) => (
              <div key={s.student_id} className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {s.username?.[0]?.toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{s.username}</p>
                    <p className="text-xs text-slate-400 font-mono">{s.regno}</p>
                  </div>
                </div>
                <button
                  onClick={() => selectStudent(s)}
                  className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Manage →
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-10">No students found</p>
            )}
          </div>

          {/* Desktop */}
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
                        <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {s.username?.[0]?.toUpperCase()}
                        </span>
                        {s.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400 text-sm">{s.regno}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => selectStudent(s)}
                        className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        Manage Marks →
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

      {/* ── Marks Panel ── */}
      {selectedStudent && (
        <div>
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-2xl w-fit mb-5 shadow-sm">
            {[{ key: "pt", label: "📝 Periodic Test" }, { key: "endsem", label: "🎓 End Semester" }].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all
                  ${activeTab === t.key
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── PT Tab ── */}
          {activeTab === "pt" && (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
              {/* Add Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-700">Add PT Score</h2>
                </div>
                <form onSubmit={submitPt} className="p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Course</label>
                    <select className={inputCls} value={ptForm.courseId} onChange={(e) => setPtForm({ ...ptForm, courseId: e.target.value })} required>
                      <option value="">Select course…</option>
                      {courses.map((c) => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Test No.</label>
                      <input type="number" className={inputCls} placeholder="e.g. 1" value={ptForm.ptTestNo} onChange={(e) => setPtForm({ ...ptForm, ptTestNo: e.target.value })} min="1" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Marks</label>
                      <input type="number" className={inputCls} placeholder="Score" value={ptForm.marks} onChange={(e) => setPtForm({ ...ptForm, marks: e.target.value })} min="0" required />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-sm transition-colors mt-1">
                    Save PT Score
                  </button>
                </form>
              </div>

              {/* Records */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-700">PT Records</h2>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{ptRecords.length} entries</span>
                </div>

                {/* Mobile */}
                <div className="sm:hidden divide-y divide-slate-100">
                  {ptRecords.map((r) => (
                    <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{r.course_name}</p>
                        <p className="text-xs text-slate-400">PT {r.pt_test_no}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingPt[r.id] !== undefined ? (
                          <>
                            <input
                              type="number"
                              className="w-16 border border-indigo-200 rounded-lg px-2 py-1 text-sm text-center"
                              value={editingPt[r.id]}
                              onChange={(e) => setEditingPt({ ...editingPt, [r.id]: e.target.value })}
                            />
                            <button onClick={() => savePt(r.id)} className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-lg">✓</button>
                            <button onClick={() => setEditingPt((p) => { const n = { ...p }; delete n[r.id]; return n; })} className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-lg">✗</button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">{r.marks}</span>
                            <button onClick={() => setEditingPt({ ...editingPt, [r.id]: r.marks })} className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Edit</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {ptRecords.length === 0 && <p className="text-center text-sm text-slate-400 py-10">No PT records</p>}
                </div>

                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["Course", "Test #", "Marks", ""].map((h) => <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {ptRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-700 font-medium max-w-[180px] truncate">{r.course_name}</td>
                          <td className="px-6 py-4 text-slate-500">PT {r.pt_test_no}</td>
                          <td className="px-6 py-4">
                            {editingPt[r.id] !== undefined ? (
                              <input
                                type="number"
                                className="w-20 border border-indigo-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                value={editingPt[r.id]}
                                onChange={(e) => setEditingPt({ ...editingPt, [r.id]: e.target.value })}
                              />
                            ) : (
                              <span className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">{r.marks}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            {editingPt[r.id] !== undefined ? (
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => savePt(r.id)} className="text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">Save</button>
                                <button onClick={() => setEditingPt((p) => { const n = { ...p }; delete n[r.id]; return n; })} className="text-xs font-semibold bg-red-50 text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setEditingPt({ ...editingPt, [r.id]: r.marks })} className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">Edit</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {ptRecords.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-slate-400">No PT records</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── End Sem Tab ── */}
          {activeTab === "endsem" && (
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
              {/* Add Form */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-700">Add End Sem Score</h2>
                </div>
                <form onSubmit={submitEnd} className="p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelCls}>Course</label>
                    <select className={inputCls} value={endForm.courseId} onChange={(e) => setEndForm({ ...endForm, courseId: e.target.value })} required>
                      <option value="">Select course…</option>
                      {courses.map((c) => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Semester</label>
                      <input type="number" className={inputCls} placeholder="e.g. 3" value={endForm.semesterNo} onChange={(e) => setEndForm({ ...endForm, semesterNo: e.target.value })} min="1" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Grade</label>
                      <input type="text" className={inputCls} placeholder="A+, B, C…" value={endForm.grade} onChange={(e) => setEndForm({ ...endForm, grade: e.target.value })} required />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl text-sm transition-colors mt-1">
                    Save End Sem Score
                  </button>
                </form>
              </div>

              {/* Records */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-700">End Semester Records</h2>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">{endsemRecords.length} entries</span>
                </div>

                {/* Mobile */}
                <div className="sm:hidden divide-y divide-slate-100">
                  {endsemRecords.map((r) => (
                    <div key={r.id} className="px-5 py-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-700 truncate max-w-[160px]">{r.course_name}</p>
                        <p className="text-xs text-slate-400">Sem {r.semester_no}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {editingEnd[r.id] !== undefined ? (
                          <>
                            <input type="text" className="w-16 border border-indigo-200 rounded-lg px-2 py-1 text-sm text-center" value={editingEnd[r.id]} onChange={(e) => setEditingEnd({ ...editingEnd, [r.id]: e.target.value })} />
                            <button onClick={() => saveEnd(r.id)} className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-lg">✓</button>
                            <button onClick={() => setEditingEnd((p) => { const n = { ...p }; delete n[r.id]; return n; })} className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded-lg">✗</button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">{r.grade}</span>
                            <button onClick={() => setEditingEnd({ ...editingEnd, [r.id]: r.grade })} className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">Edit</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {endsemRecords.length === 0 && <p className="text-center text-sm text-slate-400 py-10">No records</p>}
                </div>

                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["Course", "Semester", "Grade", ""].map((h) => <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {endsemRecords.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-700 font-medium max-w-[180px] truncate">{r.course_name}</td>
                          <td className="px-6 py-4 text-slate-500">Sem {r.semester_no}</td>
                          <td className="px-6 py-4">
                            {editingEnd[r.id] !== undefined ? (
                              <input type="text" className="w-20 border border-indigo-200 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none" value={editingEnd[r.id]} onChange={(e) => setEditingEnd({ ...editingEnd, [r.id]: e.target.value })} />
                            ) : (
                              <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">{r.grade}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            {editingEnd[r.id] !== undefined ? (
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => saveEnd(r.id)} className="text-xs font-semibold bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">Save</button>
                                <button onClick={() => setEditingEnd((p) => { const n = { ...p }; delete n[r.id]; return n; })} className="text-xs font-semibold bg-red-50 text-red-500 border border-red-100 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">Cancel</button>
                              </div>
                            ) : (
                              <button onClick={() => setEditingEnd({ ...editingEnd, [r.id]: r.grade })} className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">Edit</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {endsemRecords.length === 0 && <tr><td colSpan={4} className="text-center py-10 text-slate-400">No records</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}