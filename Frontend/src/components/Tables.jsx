import React from "react";
import { useNavigate } from "react-router-dom";

function AdminTable({
  data = [],
  columns = [],
  basePath = "",
  loadingText = "Loading...",
  emptyText = "No data found.",
  title = "",
  showStats = false,
  statsConfig = {},
}) {
  const navigate = useNavigate();

  if (!data) {
    return (
      <div className="p-10 text-center text-gray-500">
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
    <div className="w-full">
     
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[700px] bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <table className="w-full border-collapse text-sm">
            
            {/* Header */}
            <thead className="bg-gradient-to-r from-green-50 to-green-100 text-gray-700">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-4 font-semibold text-left text-gray-800"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-200">
              {data.map((row, index) => (
                <tr
                  key={row.id || index}
                  onClick={() =>
                    basePath && navigate(`${basePath}/${row.id}`)
                  }
                  className={`${
                    basePath
                      ? "cursor-pointer hover:bg-green-50 transition-colors"
                      : "hover:bg-gray-50 transition-colors"
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-gray-700 whitespace-nowrap"
                    >
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
      </div>

    
      <div className="md:hidden flex flex-col gap-4 mt-4">
        {data.map((row, index) => (
          <div
            key={row.id || index}
            onClick={() =>
              basePath && navigate(`${basePath}/${row.id}`)
            }
            className={`p-5 bg-white rounded-lg shadow border border-gray-200 ${
              basePath
                ? "hover:bg-green-50 cursor-pointer transition-colors"
                : "hover:bg-gray-50 transition-colors"
            }`}
          >
            {columns.map((col) => (
              <div key={col.key} className="mb-3 flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase">
                  {col.label}
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key]}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminTable;
