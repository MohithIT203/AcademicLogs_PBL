// components/Navbar.jsx
import { Menu } from "lucide-react";

const Navbar = ({ setOpen }) => {
  return (
    <header className="h-16 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded hover:bg-gray-100"
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>

        <h1 className="text-lg font-semibold text-gray-800">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600 hidden sm:block">
          {}
        </span>
        <img
          // src=""
          alt="profile"
          className="w-9 h-9 rounded-full border-2 border-blue-600"
        />
      </div>
    </header>
  );
};

export default Navbar;
