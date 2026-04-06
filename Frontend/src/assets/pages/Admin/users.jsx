import { useState, useEffect } from "react";
import axios from "axios";
import AdminTable from "../../../components/Tables";
import CommonDialog from "../../../components/dialogbox";

const BLANK_FORM = {
  username: "",
  mail_id: "",
  regno: "",
  department: "",
  user_id: "",
};

function Users() {
  const [activeTab, setActiveTab]   = useState("students");
  const [students,  setStudents]    = useState([]);
  const [faculty,   setFaculty]     = useState([]);
  const [loading,   setLoading]     = useState(true);
  const [error,     setError]       = useState(null);

  // --- add dialog ---
  const [addOpen,    setAddOpen]    = useState(false);
  const [formData,   setFormData]   = useState(BLANK_FORM);
  const [formError,  setFormError]  = useState("");

  // --- edit dialog ---
  const [editOpen,     setEditOpen]     = useState(false);
  const [editTarget,   setEditTarget]   = useState(null);   // full row object
  const [editForm,     setEditForm]     = useState(BLANK_FORM);
  const [editError,    setEditError]    = useState("");

  // ── fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [studentRes, facultyRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/all-students`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/all-faculty`,  { withCredentials: true }),
        ]);
        setStudents(studentRes.data.data.students || []);
        setFaculty(facultyRes.data.data.faculty   || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load users. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ── add handlers ────────────────────────────────────────────────────────────
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const { username, mail_id, department, regno, user_id } = formData;
    if (activeTab === "students" && (!username || !mail_id || !department || !regno)) {
      setFormError("All fields are required."); return;
    }
    if (activeTab === "faculty" && (!username || !mail_id || !department || !user_id)) {
      setFormError("All fields are required."); return;
    }
    setFormError("");

    const endpoint = activeTab === "students" ? "/add-students" : "/add-faculty";
    const payload  = activeTab === "students"
      ? formData
      : { username, mail_id, department, user_id };

    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_APP_URL}${endpoint}`,
        payload,
        { withCredentials: true }
      );
      // re-fetch so counts stay accurate
      const key  = activeTab === "students" ? "students" : "faculty";
      const path = activeTab === "students" ? "/all-students" : "/all-faculty";
      const res  = await axios.get(`${import.meta.env.VITE_SERVER_APP_URL}${path}`, { withCredentials: true });
      activeTab === "students"
        ? setStudents(res.data.data[key] || [])
        : setFaculty(res.data.data[key]  || []);

      setAddOpen(false);
      setFormData(BLANK_FORM);
    } catch (err) {
      setFormError("Failed to create user. Please try again.");
    }
  };

  // ── edit handlers ────────────────────────────────────────────────────────────
  const handleEditClick = (row) => {
    setEditTarget(row);
    setEditForm({
      username:   row.username   || "",
      mail_id:    row.mail_id    || "",
      regno:      row.regno      || "",
      department: row.department || "",
      user_id:    row.student_id    || "",
    });
    setEditError("");
    setEditOpen(true);
  };

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleEditSave = async () => {
    const { username, mail_id, department, regno } = editForm;
    if (!username || !mail_id || !department) {
      setEditError("Name, email and department are required."); return;
    }
    if (activeTab === "students" && !regno) {
      setEditError("Register number is required."); return;
    }
    setEditError("");

    const endpoint = activeTab === "students"
      ? `/edit-student/${editTarget.student_id}`
      : `/edit-faculty/${editTarget.id}`;

    const payload = activeTab === "students"
      ? { username, mail_id, regno, department }
      : { username, mail_id, department };

    try {
      await axios.put(
        `${import.meta.env.VITE_SERVER_APP_URL}${endpoint}`,
        payload,
        { withCredentials: true }
      );

      // Update local state — no extra network call needed
      if (activeTab === "students") {
        setStudents((prev) =>
          prev.map((s) => s.id === editTarget.id ? { ...s, ...payload } : s)
        );
      } else {
        setFaculty((prev) =>
          prev.map((f) => f.id === editTarget.id ? { ...f, ...payload } : f)
        );
      }

      setEditOpen(false);
      setEditTarget(null);
    } catch (err) {
      setEditError("Failed to update. Please try again.");
    }
  };

  const sharedColumns = [
    { key: "username",   label: "Name" },
    { key: "mail_id",    label: "Email" },
    { key: "department", label: "Department" },
    {
      key: "updated_at",
      label: "Updated",
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "__actions",
      label: "",
      render: (_, row) => (
        <button
          onClick={() => handleEditClick(row)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Edit
        </button>
      ),
    },
  ];

  const data = activeTab === "students" ? students : faculty;

  return (
    <div className="h-screen bg-blue-50 flex flex-col overflow-hidden">

      {/* Header */}
      <div className="bg-white shadow-sm flex-shrink-0 mb-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <h1 className="text-xl sm:text-2xl font-semibold text-blue-700">User Management</h1>

          <div className="flex flex-col justify-between sm:flex-row gap-3 sm:gap-4 mt-5">
            <div className="flex flex-row gap-3">
              {["students", "faculty"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow"
                      : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                  ({tab === "students" ? students.length : faculty.length})
                </button>
              ))}
            </div>

            <button
              onClick={() => { setFormError(""); setAddOpen(true); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm cursor-pointer"
            >
              + Add New {activeTab === "students" ? "Student" : "Faculty"}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto sm:px-6 py-6">
          {error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <AdminTable
              data={data}
              loading={loading}
              basePath={activeTab === "students" ? "/students" : "/faculty"}
              loadingText={`Loading ${activeTab}...`}
              emptyText={`No ${activeTab} found.`}
              columns={sharedColumns}
            />
          )}
        </div>
      </div>

      {/* ── Add Dialog ── */}
      <CommonDialog
        open={addOpen}
        setOpen={setAddOpen}
        title={`Create New ${activeTab === "students" ? "Student" : "Faculty"}`}
        onSave={handleSave}
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-500 border-b pb-2">Basic Information</div>
          {formError && <p className="text-sm text-red-500">{formError}</p>}

          {activeTab === "faculty" && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">User Id</label>
              <input type="text" name="user_id" value={formData.user_id}
                onChange={handleChange} placeholder="FAC123"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input type="text" name="username" value={formData.username}
              onChange={handleChange} placeholder="Enter full name"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Email Address</label>
            <input type="email" name="mail_id" value={formData.mail_id}
              onChange={handleChange} placeholder="example@college.edu"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
          </div>

          {activeTab === "students" && (
            <>
              <div className="text-sm text-gray-500 border-b pb-2">Academic Details</div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">Register Number</label>
                <input type="text" name="regno" value={formData.regno}
                  onChange={handleChange} placeholder="Enter register number"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
              </div>
            </>
          )}

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Department</label>
            <input type="text" name="department" value={formData.department}
              onChange={handleChange} placeholder="Enter department"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
          </div>
        </div>
      </CommonDialog>

      {/* ── Edit Dialog ── */}
      <CommonDialog
        open={editOpen}
        setOpen={setEditOpen}
        title={`Edit ${activeTab === "students" ? "Student" : "Faculty"}`}
        onSave={handleEditSave}
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-500 border-b pb-2">Edit Information</div>
          {editError && <p className="text-sm text-red-500">{editError}</p>}

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input type="text" name="username" value={editForm.username}
              onChange={handleEditChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Email Address</label>
            <input type="email" name="mail_id" value={editForm.mail_id}
              onChange={handleEditChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
          </div>

          {activeTab === "students" && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Register Number</label>
              <input type="text" name="regno" value={editForm.regno}
                onChange={handleEditChange}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Department</label>
            <input type="text" name="department" value={editForm.department}
              onChange={handleEditChange}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition" />
          </div>
        </div>
      </CommonDialog>
    </div>
  );
}

export default Users;