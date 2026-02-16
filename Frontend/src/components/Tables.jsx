import React from "react";
import { useNavigate } from "react-router-dom";

function Tables({ data, activeTab }) {
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="p-10 text-center text-blue-500">
        Loading users...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500">
        No {activeTab} found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="bg-white rounded-lg shadow-md border border-blue-100">

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
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
                    navigate(
                      activeTab === "students"
                        ? `/students/${user.id}`
                        : `/faculty/${user.id}`
                    )
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
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y flex flex-col">
          {data.map((user) => (
            <div
              key={user.id}
              onClick={() =>
                navigate(
                  activeTab === "students"
                    ? `/students/${user.id}`
                    : `/faculty/${user.id}`
                )
              }
              className="p-4 hover:bg-blue-50 cursor-pointer transition"
            >
              <h3 className="font-semibold text-blue-700">
                {user.username}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {user.mail_id}
              </p>
              <p className="text-sm text-gray-600">
                {user.department}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Last Updated:{" "}
                {new Date(user.updated_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Tables;
