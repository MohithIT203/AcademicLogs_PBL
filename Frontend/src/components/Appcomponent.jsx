// import { Routes, Route } from "react-router-dom";
// import Login from "../assets/pages/Login/login.jsx";
// import Layout from "./Layout";
// import Users from "../assets/pages/Admin/users.jsx";
// import AdminDashboard from "../assets/pages/Admin/dashboard.jsx";
// import Course from "../assets/pages/Admin/course.jsx";

// import StudentExams from "../assets/pages/Student/exams.jsx";
// import StudentAttendance from "../assets/pages/Student/attendance.jsx";
// import StudentDashboard from "../assets/pages/Student/dashboard.jsx";
// import StudentCourses from "../assets/pages/Student/courses.jsx";
// import StudentPTScores from "../assets/pages/Student/ptscores.jsx";
// import StudentSemesterScores from "../assets/pages/Student/semesterscores.jsx";
// import AdminLogs from "../assets/pages/Admin/logs.jsx";
// import FacultyDashboard from "../assets/pages/Faculty/dashboard.jsx";
// import FacultyAttendance from "../assets/pages/Faculty/attendance.jsx";
// import FacultyMarks from "../assets/pages/Faculty/marks.jsx";

// // import FacultyRewardPoints from "../assets/pages/Faculty/rewards.jsx";

// function AppComponent() {
//   return (
//     <Routes>

//       {/* Public Route */}
//       <Route path="/" element={<Login />} />

//       {/* Protected Layout Routes */}
//       <Route path="/" element={<Layout />}>
//         {/* Admin Routes */}
//         <Route path="dashboard" element={<AdminDashboard />} />
//         <Route path="users" element={<Users />} />
//         <Route path="courses" element={<Course />} />
//         <Route path="audit-logs" element={<AdminLogs />} />

//         {/* Student Routes */}
//         <Route path="student/dashboard" element={<StudentDashboard />} />
//         <Route path="student/attendance" element={<StudentAttendance />} />
//         <Route path="student/ptscores" element={<StudentPTScores />} />
//         <Route path="student/semesterscores" element={<StudentSemesterScores />} />
//         <Route path="student/exams" element={<StudentExams />} />
//         <Route path="student/courses" element={<StudentCourses />} />

//         {/* Faculty Routes */}
//         <Route path="faculty/dashboard" element={<FacultyDashboard />} />
//         <Route path="faculty/attendance" element={<FacultyAttendance />} />
//         <Route path="faculty/marks" element={<FacultyMarks />} />


//         {/* Legacy Routes (backward compatibility) */}
        
// {/* <Route path="/faculty/rewards" element={<FacultyRewardPoints />} /> */}
//         <Route path="my-exams" element={<StudentExams />} />
//         <Route path="my-attendance" element={<StudentAttendance />} />
//         <Route path="my-dashboard" element={<StudentDashboard />} />
//         <Route path="my-courses" element={<StudentCourses />} />
//       </Route>

//     </Routes>
//   );
// }

// export default AppComponent;



import { Routes, Route } from "react-router-dom";
import Login from "../assets/pages/Login/login.jsx";
import Layout from "./Layout";
import Users from "../assets/pages/Admin/users.jsx";
import AdminDashboard from "../assets/pages/Admin/dashboard.jsx";
import Course from "../assets/pages/Admin/course.jsx";
import AdminLogs from "../assets/pages/Admin/logs.jsx";
import AdminSettings from "../assets/pages/Admin/Settings.jsx";
import AdminAttendance from "../assets/pages/Admin/AdminAttendence.jsx";
import AdminExams from "../assets/pages/Admin/Adminexams.jsx";
import AdminStudents from "../assets/pages/Admin/AdminStudents.jsx";

import StudentExams from "../assets/pages/Student/exams.jsx";
import StudentAttendance from "../assets/pages/Student/attendance.jsx";
import StudentDashboard from "../assets/pages/Student/dashboard.jsx";
import StudentCourses from "../assets/pages/Student/courses.jsx";
import StudentPTScores from "../assets/pages/Student/ptscores.jsx";
import StudentSemesterScores from "../assets/pages/Student/semesterscores.jsx";

import FacultyDashboard from "../assets/pages/Facultyv2/FacDashboard.jsx";
import FacultyAttendance from "../assets/pages/Facultyv2/FacAttendance.jsx";
import FacultyMarks from "../assets/pages/Facultyv2/FacMarks.jsx";

function AppComponent() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* Protected Layout Routes */}
      <Route path="/" element={<Layout />}>
        {/* Admin Routes */}
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="courses" element={<Course />} />
        <Route path="audit-logs" element={<AdminLogs />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="admin/students" element={<AdminStudents />} />
        <Route path="attendance" element={<AdminAttendance />} />
        <Route path="exams" element={<AdminExams />} />

        {/* Student Routes */}
        <Route path="student/dashboard" element={<StudentDashboard />} />
        <Route path="student/attendance" element={<StudentAttendance />} />
        <Route path="student/ptscores" element={<StudentPTScores />} />
        <Route path="student/semesterscores" element={<StudentSemesterScores />} />
        <Route path="student/exams" element={<StudentExams />} />
        <Route path="student/courses" element={<StudentCourses />} />

        {/* Faculty Routes */}
        <Route path="faculty/dashboard" element={<FacultyDashboard />} />
        <Route path="faculty/attendance" element={<FacultyAttendance />} />
        <Route path="faculty/marks" element={<FacultyMarks />} />

        {/* Legacy Routes */}
        <Route path="my-exams" element={<StudentExams />} />
        <Route path="my-attendance" element={<StudentAttendance />} />
        <Route path="my-dashboard" element={<StudentDashboard />} />
        <Route path="my-courses" element={<StudentCourses />} />
      </Route>
    </Routes>
  );
}

export default AppComponent;