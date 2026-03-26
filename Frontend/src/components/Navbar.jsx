// components/Navbar.jsx
import { Menu } from "lucide-react";
import { useAuth } from "../assets/pages/Context/AuthContext.jsx";

const Navbar = ({ setOpen }) => {
  const { user } = useAuth();
  
  const pageTitle = {
    admin: "Admin Dashboard",
    faculty: "Faculty Dashboard",
    student: "Student Dashboard",
  };

  return (
    <header className="h-16 bg-white flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded hover:bg-gray-100"
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>

        <h1 className="text-lg font-semibold text-gray-800">
          {pageTitle[user?.role] || "Dashboard"}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-800 hidden sm:block">
            {user?.username || user?.name}
          </span>
          <span className="text-xs text-gray-500 capitalize hidden sm:block">
            {user?.role}
          </span>
        </div>
        <img
          alt="profile"
          className="w-9 h-9 rounded-full border-2 border-blue-600 bg-gray-300"
        />
      </div>
    </header>
  );
};

export default Navbar;
