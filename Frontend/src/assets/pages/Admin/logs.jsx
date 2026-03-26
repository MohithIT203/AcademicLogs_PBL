import { useEffect, useState } from "react";
import axios from "axios";
import AdminTable from "../../../components/Tables";

function AdminLogs() {
  const [logs, setLogs] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/academic-logs`, { withCredentials: true });
      setLogs(res.data.data);
    } catch (error) {
      console.error("Error fetching logs", error);
      setLogs([]);
    }
  };

  const columns = [
    {
      key: "actor_id",
      label: "Actor ID",
    },
    {
      key: "actor_role",
      label: "Role",
      render: (value) => (
        <span className="capitalize font-medium text-indigo-600">
          {value}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (value) => {
        const color =
          value === "CREATE"
            ? "bg-green-100 text-green-700"
            : value === "UPDATE"
            ? "bg-yellow-100 text-yellow-700"
            : "bg-red-100 text-red-700";

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}
          >
            {value}
          </span>
        );
      },
    },
    {
      key: "affected_table",
      label: "Table",
    },
    {
      key: "affected_record_id",
      label: "Record ID",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            value === "SUCCESS"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "ip_address",
      label: "IP Address",
    },
    {
      key: "created_at",
      label: "Time",
      render: (value) =>
        new Date(value).toLocaleString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        System Audit Logs
      </h2>

      <AdminTable
        data={logs}
        columns={columns}
        basePath="" 
        loadingText="Fetching logs..."
        emptyText="No audit logs found."
      />
    </div>
  );
}

export default AdminLogs;
