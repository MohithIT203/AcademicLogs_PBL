// components/Layout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex flex-col flex-1">
        <Navbar setOpen={setOpen} />
        <main className="p-6 overflow-y-auto">
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default Layout;
