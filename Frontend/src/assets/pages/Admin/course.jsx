import { useState, useEffect } from "react";
import axios from "axios";
import CommonDialog from "../../../components/dialogbox";
import AdminTable from "../../../components/Tables";

function Course() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    courseName: "",
    courseCode: "",
    department: "",
    semester: "",
    credits: "",
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_APP_URL}/all-course`,
          { withCredentials: true },
        );

        setData(response.data.data.courses || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_APP_URL}/add-course`,
        formData,
        { withCredentials: true },
      );

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_APP_URL}/all-course`,
        { withCredentials: true },
      );

      setData(response.data.data.courses || []);

      setOpen(false);

      setFormData({
        courseCode: "",
        courseName: "",
        department: "",
        semester: "",
        credits: "",
      });
    } catch (err) {
      console.error("Error creating course:", err);
    }
  };

  return (
    <div className="h-screen bg-blue-50 flex flex-col overflow-hidden">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
            <div>
          <h1 className="text-2xl font-semibold text-blue-700">
            Course Management
          </h1>
          </div>
        <div>
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Add Course
          </button>
          </div>
        </div>
      </div>

    
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto py-6">
          <AdminTable
            data={data}
            basePath="/courses"
            loadingText="Loading courses..."
            emptyText="No courses found."
            columns={[
              { key: "course_code", label: "Course Code" },
              { key: "course_name", label: "Course Name" },
              { key: "department", label: "Department" },
              { key: "semester", label: "Semester" },
              { key: "credits", label: "Credits" },
              {
                key: "updated_at",
                label: "Updated",
                render: (value) => new Date(value).toLocaleDateString(),
              },
            ]}
          />
        </div>
      </div>

      <CommonDialog
        open={open}
        setOpen={setOpen}
        title="Create New Course"
        onSave={handleSave}
      >
        <div className="space-y-6">
          <div className="text-sm text-gray-500 border-b pb-2">
            Course Information
          </div>


          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Course Code
            </label>
            <input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              placeholder="CS101"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Course Name
            </label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="Data Structures"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Computer Science"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Semester
              </label>
              <input
                type="number"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                placeholder="1"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1 block">
                Credits
              </label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                placeholder="3"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>
          </div>
        </div>
      </CommonDialog>
    </div>
  );
}

export default Course;
