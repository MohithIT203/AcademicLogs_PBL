import { NavLink } from "react-router-dom";
import { useAuth } from "../assets/pages/Context/AuthContext.jsx";
import { 
  X,
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardCheck,
  FileText,
  Shield,
  Settings,
  GraduationCap,
  CalendarCheck,
  NotebookPen
 } from "lucide-react";

const Sidebar = ({ open, setOpen }) => {
   const { user } = useAuth();

  const items = {
  admin: [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Users", path: "/users", icon: Users },
    { name: "Courses", path: "/courses", icon: BookOpen },
    { name: "Attendance", path: "/attendance", icon: ClipboardCheck },
    { name: "Exams", path: "/exams", icon: FileText },
    { name: "Audit Logs", path: "/audit-logs", icon: Shield },
    { name: "Settings", path: "/settings", icon: Settings },
  ],

  faculty: [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Attendance", path: "/attendance", icon: CalendarCheck },
    { name: "Exams / Marks", path: "/marks", icon: NotebookPen },
  ],

  student: [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "My Courses", path: "/my-courses", icon: GraduationCap },
    { name: "My Attendance", path: "/my-attendance", icon: ClipboardCheck },
    { name: "My Exams", path: "/my-exams", icon: FileText },
  ],
};
  const navItemsRoleBased = items[user?.role] || [];
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static z-30 w-64 h-full bg-white
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-16 flex items-center justify-between px-6 ">
          <span className="font-bold text-gray-800">Academic Log</span>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col justify-between h-[90%]">
        <nav className="p-5 space-y-2">
          {navItemsRoleBased.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium
                transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-800 hover:bg-gray-100"
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="p-5">
          <button className="w-full bg-red-500 text-white text-sm font-meduim py-2 rounded-lg hover:bg-red-600 transition">
            Logout
          </button>
        </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
