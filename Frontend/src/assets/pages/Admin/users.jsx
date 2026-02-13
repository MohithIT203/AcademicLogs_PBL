import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Users() {
  const [activeTab, setActiveTab] = useState("students");
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const studentRes = await axios.get(
          `${import.meta.env.VITE_SERVER_APP_URL}/all-students`,
          { withCredentials: true }
        );

        const facultyRes = await axios.get(
          `${import.meta.env.VITE_SERVER_APP_URL}/all-faculty`,
          { withCredentials: true }
        );

        setStudents(studentRes.data.data.students);
        setFaculty(facultyRes.data.data.faculty);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const data = activeTab === "students" ? students : faculty;

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Top Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-semibold text-blue-700">
            User Management
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab("students")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "students"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-100"
              }`}
            >
              Students
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "students"
                  ? "bg-white text-blue-600"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {students.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("faculty")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "faculty"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-100"
              }`}
            >
              Faculty
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === "faculty"
                  ? "bg-white text-blue-600"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {faculty.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">

          {loading ? (
            <div className="p-10 text-center text-blue-500">
              Loading users...
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-600 text-white text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Updated</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-blue-50">
                {data.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() =>
                      activeTab === "students"
                        ? navigate(`/students/${user.id}`)
                        : navigate(`/faculty/${user.id}`)
                    }
                    className="cursor-pointer hover:bg-blue-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.mail_id}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(user.updated_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
}

export default Users;
