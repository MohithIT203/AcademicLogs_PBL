import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Tables from "../../../components/Tables";
import ResponsiveDialog from "../../../components/dialogbox";

function Users() {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <Tables data={data} activeTab={activeTab} loading={loading} />
        </div>
      </div>
      <ResponsiveDialog open={open} setOpen={setOpen} type={activeTab} />
    </div>
  );
}

export default Users;
