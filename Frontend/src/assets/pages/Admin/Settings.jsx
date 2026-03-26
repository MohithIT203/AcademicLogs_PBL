import { useState, useEffect } from "react";
import axios from "axios";
import {
  Settings,
  ToggleLeft,
  ToggleRight,
  Shield,
  Users,
  Bell,
  Lock,
  Save,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

function AdminSettings() {
  const [editEnabled, setEditEnabled] = useState(false);
  const [loadingPerm, setLoadingPerm] = useState(true);
  const [savingPerm, setSavingPerm] = useState(false);
  const [permSaved, setPermSaved] = useState(false);

  const [notifyOnEdit, setNotifyOnEdit] = useState(true);
  const [autoLockAfterDays, setAutoLockAfterDays] = useState(7);
  const [maxPtTests, setMaxPtTests] = useState(3);
  const [maxSemester, setMaxSemester] = useState(8);

  const baseURL = import.meta.env.VITE_SERVER_APP_URL;

  useEffect(() => {
    const fetchPerm = async () => {
      try {
        const res = await axios.get(`${baseURL}/admin/settings`, { withCredentials: true });
        const s = res.data.data || {};
        setEditEnabled(s.editEnabled ?? false);
        setNotifyOnEdit(s.notifyOnEdit ?? true);
        setAutoLockAfterDays(s.autoLockAfterDays ?? 7);
        setMaxPtTests(s.maxPtTests ?? 3);
        setMaxSemester(s.maxSemester ?? 8);
      } catch (err) {
        console.error("Error fetching settings", err);
      } finally {
        setLoadingPerm(false);
      }
    };
    fetchPerm();
  }, []);

  const toggleEditPermission = async () => {
    setSavingPerm(true);
    try {
      const newVal = !editEnabled;
      await axios.patch(
        `${baseURL}/admin/settings/edit-permission`,
        { editEnabled: newVal },
        { withCredentials: true }
      );
      setEditEnabled(newVal);
      setPermSaved(true);
      setTimeout(() => setPermSaved(false), 3000);
    } catch (err) {
      console.error("Error updating edit permission", err);
    } finally {
      setSavingPerm(false);
    }
  };

  const saveGeneralSettings = async () => {
    try {
      await axios.patch(
        `${baseURL}/admin/settings/general`,
        { notifyOnEdit, autoLockAfterDays, maxPtTests, maxSemester },
        { withCredentials: true }
      );
      setPermSaved(true);
      setTimeout(() => setPermSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings", err);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-3">
            <Settings size={28} /> System Settings
          </h1>
          <p className="text-gray-500 mt-1">Control platform permissions and configurations</p>
        </div>

        {/* Success Toast */}
        {permSaved && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm font-medium">
            <CheckCircle2 size={18} /> Settings saved successfully!
          </div>
        )}

        {/* ===================== Faculty Edit Permission ===================== */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="text-blue-600" size={22} />
            <h2 className="text-lg font-semibold text-blue-700">Faculty Record Editing</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Control whether faculty members can add or modify student records (attendance, PT scores, semester grades).
            When disabled, faculty can only view records.
          </p>

          {loadingPerm ? (
            <div className="text-blue-500 text-sm animate-pulse">Loading permission status...</div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-blue-50 rounded-xl p-5 border border-blue-100">
              <div>
                <p className="font-semibold text-gray-800 text-sm">
                  Allow Faculty to Edit Records
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Applies to: Attendance, PT Scores, End-Semester Grades
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    editEnabled
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {editEnabled ? "ENABLED" : "DISABLED"}
                </span>

                <button
                  onClick={toggleEditPermission}
                  disabled={savingPerm}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition shadow-sm ${
                    editEnabled
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  } disabled:opacity-60`}
                >
                  {editEnabled ? (
                    <>
                      <ToggleRight size={18} />
                      {savingPerm ? "Disabling..." : "Disable Editing"}
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={18} />
                      {savingPerm ? "Enabling..." : "Enable Editing"}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {editEnabled && (
            <div className="mt-4 flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>
                Faculty can currently <strong>add and modify</strong> student records. All edits are tracked in the audit log.
              </span>
            </div>
          )}
        </div>

        {/* ===================== Academic Configuration ===================== */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="text-blue-600" size={22} />
            <h2 className="text-lg font-semibold text-blue-700">Academic Configuration</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Set limits for academic data entry across the platform.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Max PT Tests per Course
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxPtTests}
                onChange={(e) => setMaxPtTests(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Faculty cannot add more PT tests than this limit.</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600 mb-1 block">
                Maximum Semesters
              </label>
              <input
                type="number"
                min="4"
                max="12"
                value={maxSemester}
                onChange={(e) => setMaxSemester(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Maximum semester number allowed.</p>
            </div>
          </div>
        </div>

        {/* ===================== Notification Settings ===================== */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-blue-600" size={22} />
            <h2 className="text-lg font-semibold text-blue-700">Audit & Notifications</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">Configure audit log and notification preferences.</p>

          <div className="space-y-4">
            {/* Notify on edit toggle */}
            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div>
                <p className="font-medium text-sm text-gray-800">Log all faculty edits to audit trail</p>
                <p className="text-xs text-gray-500 mt-0.5">Every create/update action by faculty is recorded</p>
              </div>
              <button
                onClick={() => setNotifyOnEdit(!notifyOnEdit)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  notifyOnEdit ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifyOnEdit ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Auto-lock */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div>
                <p className="font-medium text-sm text-gray-800">Auto-disable editing after (days)</p>
                <p className="text-xs text-gray-500 mt-0.5">Automatically disable faculty editing after this many days</p>
              </div>
              <input
                type="number"
                min="1"
                max="90"
                value={autoLockAfterDays}
                onChange={(e) => setAutoLockAfterDays(Number(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm text-center"
              />
            </div>
          </div>
        </div>

        {/* ===================== User Management Shortcuts ===================== */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="text-blue-600" size={22} />
            <h2 className="text-lg font-semibold text-blue-700">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <QuickAction label="Export Audit Logs" desc="Download full audit trail as CSV" color="blue" />
            <QuickAction label="Reset All Passwords" desc="Force password reset for all users" color="amber" />
            <QuickAction label="Bulk Import Students" desc="Upload CSV to add students" color="green" />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={saveGeneralSettings}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition"
          >
            <Save size={16} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ label, desc, color }) {
  const colors = {
    blue: "border-blue-200 hover:bg-blue-50 text-blue-700",
    amber: "border-amber-200 hover:bg-amber-50 text-amber-700",
    green: "border-green-200 hover:bg-green-50 text-green-700",
  };
  return (
    <button
      className={`text-left p-4 rounded-xl border transition ${colors[color]}`}
    >
      <p className="font-semibold text-sm">{label}</p>
      <p className="text-xs text-gray-500 mt-1">{desc}</p>
    </button>
  );
}

export default AdminSettings;