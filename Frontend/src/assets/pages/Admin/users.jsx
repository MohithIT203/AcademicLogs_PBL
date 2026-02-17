import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminTable from "../../../components/Tables";
import CommonDialog from "../../../components/dialogbox";

function Users() {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    username: "",
    mail_id: "",
    regno: "",
    department: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const studentRes = await axios.get(
          `${import.meta.env.VITE_SERVER_APP_URL}/all-students`,
          { withCredentials: true },
        );

        const facultyRes = await axios.get(
          `${import.meta.env.VITE_SERVER_APP_URL}/all-faculty`,
          { withCredentials: true },
        );

        setStudents(studentRes.data.data.students || []);
        setFaculty(facultyRes.data.data.faculty || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSave = async () => {
    const endpoint =
      activeTab === "students" ? "/add-students" : "/add-faculty";

    const payload =
      activeTab === "students"
        ? formData
        : {
            username: formData.username,
            mail_id: formData.mail_id,
            department: formData.department,
          };

    await axios.post(
      `${import.meta.env.VITE_SERVER_APP_URL}${endpoint}`,
      payload,
      { withCredentials: true },
    );

    setOpen(false);

    setFormData({
      user_id: "",
      username: "",
      mail_id: "",
      regno: "",
      department: "",
    });
  };

  const handleAddNew = () => {
    setOpen(true);
  };

  const data = activeTab === "students" ? students : faculty;

  return (
    <div className="h-screen bg-blue-50 flex flex-col overflow-hidden">
      <div className="bg-white shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-blue-700">
              User Management
            </h1>
          </div>

          <div className="flex flex-col justify-between sm:flex-row gap-3 sm:gap-4 mt-5">
            <div className="flex flex-row gap-3">
              <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeTab === "students"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-100"
                }`}
              >
                Students ({students.length})
              </button>

              <button
                onClick={() => setActiveTab("faculty")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                  activeTab === "faculty"
                    ? "bg-blue-600 text-white shadow"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-100"
                }`}
              >
                Faculty ({faculty.length})
              </button>
            </div>

            <button
              onClick={handleAddNew}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm cursor-pointer"
            >
              + Add New {activeTab === "students" ? "Student" : "Faculty"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto sm:px-6py-6">
          {activeTab === "students" && (
            <AdminTable
              data={students}
              basePath="/students"
              loadingText="Loading students..."
              emptyText="No students found."
              columns={[
                { key: "username", label: "Name" },
                { key: "mail_id", label: "Email" },
                { key: "department", label: "Department" },
                {
                  key: "updated_at",
                  label: "Updated",
                  render: (value) => new Date(value).toLocaleDateString(),
                },
              ]}
            />
          )}
          {activeTab === "faculty" && (
            <AdminTable
              data={faculty}
              basePath="/faculty"
              loadingText="Loading faculty..."
              emptyText="No faculty found."
              columns={[
                { key: "username", label: "Name" },
                { key: "mail_id", label: "Email" },
                { key: "department", label: "Department" },
                {
                  key: "updated_at",
                  label: "Updated",
                  render: (value) => new Date(value).toLocaleDateString(),
                },
              ]}
            />
          )}
        </div>
      </div>
      <CommonDialog
        open={open}
        setOpen={setOpen}
        title={`Create New ${activeTab === "students" ? "Student" : "Faculty"}`}
        onSave={handleSave}
      >
        <div className="space-y-6">
          {/* Section Header */}
          <div className="text-sm text-gray-500 border-b pb-2">
            Basic Information
          </div>
          {activeTab == "faculty" && (
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">
                User Id
              </label>
              <input
                type="text"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                placeholder="FAC123"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </div>
          )}
          {/* Full Name */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter full name"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="mail_id"
              value={formData.mail_id}
              onChange={handleChange}
              placeholder="example@college.edu"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          {/* Student-only Section */}
          {activeTab === "students" && (
            <>
              <div className="text-sm text-gray-500 border-b pb-2">
                Academic Details
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-1">
                  Register Number
                </label>
                <input
                  type="text"
                  name="regno"
                  value={formData.regno}
                  onChange={handleChange}
                  placeholder="Enter register number"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                />
              </div>
            </>
          )}

          {/* Department */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>
        </div>
      </CommonDialog>
    </div>
  );
}

export default Users;
