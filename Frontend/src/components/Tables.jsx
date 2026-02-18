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
    <div className="px-4 md:px-10 py-6">

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[700px] bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <table className="w-full border-collapse text-sm">
            
            {/* Header */}
            <thead className="bg-slate-100 text-gray-700">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 font-semibold text-center"
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
                      ? "cursor-pointer hover:bg-gray-50 transition"
                      : ""
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-6 py-4 text-center text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]"
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

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden flex flex-col gap-3 mt-2">
        {data.map((row, index) => (
          <div
            key={row.id || index}
            onClick={() =>
              basePath && navigate(`${basePath}/${row.id}`)
            }
            className={`p-4 bg-white rounded-xl shadow-sm border border-gray-200 ${
              basePath
                ? "hover:bg-gray-50 cursor-pointer transition"
                : ""
            }`}
          >
            {columns.map((col) => (
              <div key={col.key} className="mb-2">
                <p className="text-xs text-gray-400">
                  {col.label}
                </p>
                <p className="text-sm font-medium text-gray-700">
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
  );
}

export default AdminTable;
