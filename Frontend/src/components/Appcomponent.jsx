import { Routes, Route } from "react-router-dom";
import Login from "../assets/pages/Login/login.jsx";
import Layout from "./Layout";
import Users from "../assets/pages/Admin/users.jsx";
import AdminDashboard from "../assets/pages/Admin/dashboard.jsx";
import Course from "../assets/pages/Admin/course.jsx";


import StudentExams from "../assets/pages/Student/exams.jsx";
import StudentAttendance from "../assets/pages/Student/attendance.jsx";
import StudentDashboard from "../assets/pages/Student/dashboard.jsx";
import StudentCourses from "../assets/pages/Student/courses.jsx";

function AppComponent() {
  return (
    <Routes>

      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* Protected Layout Routes */}
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="courses" element={<Course />} />

      <Route path="my-exams" element={<StudentExams />} />  
        <Route path="my-attendance" element={<StudentAttendance />} />
        <Route path="my-dashboard" element={<StudentDashboard />} />
        <Route path="my-courses" element={<StudentCourses />} />
      </Route>

    </Routes>
  );
}

export default AppComponent;
