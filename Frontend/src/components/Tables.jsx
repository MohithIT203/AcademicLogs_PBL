import React from "react";
import { useNavigate } from "react-router-dom";

function AdminTable({
  data = [],
  columns = [],
  basePath = "",
  loadingText = "Loading...",
  emptyText = "No data found.",
}) {
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="p-10 text-center text-blue-500">
        {loadingText}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-10 text-center text-gray-500">
        {emptyText}
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
                {columns.map((col) => (
                  <th key={col.key} className="px-6 py-4">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-blue-50">
              {data.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => basePath && navigate(`${basePath}/${row.id}`)}
                  className={`${
                    basePath
                      ? "cursor-pointer hover:bg-blue-50 transition"
                      : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 text-gray-700">
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y flex flex-col">
          {data.map((row) => (
            <div
              key={row.id}
              onClick={() => basePath && navigate(`${basePath}/${row.id}`)}
              className={`p-4 ${
                basePath
                  ? "hover:bg-blue-50 cursor-pointer transition"
                  : ""
              }`}
            >
              {columns.map((col) => (
                <div key={col.key} className="mb-2">
                  <p className="text-xs text-gray-400">{col.label}</p>
                  <p className="text-sm text-gray-700 font-medium">
                    {col.render
                      ? col.render(row[col.key], row)
                      : row[col.key]}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AdminTable;
