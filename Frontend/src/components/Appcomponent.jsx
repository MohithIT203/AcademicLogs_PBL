import { Routes, Route } from "react-router-dom";
import Login from "../assets/pages/Login/login.jsx";
import Layout from "./Layout";
import Users from "../assets/pages/Admin/users.jsx";
import Dashboard from "../assets/pages/Admin/dashboard.jsx";
import Course from "../assets/pages/Admin/course.jsx";

function AppComponent() {
  return (
    <Routes>

      {/* Public Route */}
      <Route path="/" element={<Login />} />

      {/* Protected Layout Routes */}
      <Route path="/" element={<Layout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="courses" element={<Course />} />
      </Route>

    </Routes>
  );
}

export default AppComponent;
