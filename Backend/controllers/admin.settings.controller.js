const db = require("../db"); 

const getAllSettings = async () => {
  const [rows] = await db.promise().query("SELECT setting_key, setting_value FROM AcademicLogs.system_settings");
  const settings = {};
  rows.forEach((r) => {
    const val = r.setting_value;
    if (val === "true") settings[r.setting_key] = true;
    else if (val === "false") settings[r.setting_key] = false;
    else if (!isNaN(val)) settings[r.setting_key] = Number(val);
    else settings[r.setting_key] = val;
  });
  return settings;
};

const getSettings = async (req, res) => {
  try {
    const settings = await getAllSettings();
    res.status(200).json({ output: "Success", data: settings });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: err.message });
  }
};

const toggleEditPermission = async (req, res) => {
  const { editEnabled } = req.body;
  if (typeof editEnabled !== "boolean") {
    return res.status(400).json({ output: "Failed", message: "editEnabled (boolean) required" });
  }

  const actorId = req.user.id;
  const actorRole = req.user.role;
  const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  try {
    await db.promise().query(
      "UPDATE AcademicLogs.system_settings SET setting_value = ?, updated_by = ? WHERE setting_key = 'editEnabled'",
      [String(editEnabled), actorId]
    );

    await db.promise().query(
      `INSERT INTO AcademicLogs.audit_logs 
        (actor_id, actor_role, action, affected_table, affected_record_id, new_data, ip_address, user_agent, status)
       VALUES (?, ?, 'UPDATE', 'system_settings', NULL, ?, ?, ?, 'SUCCESS')`,
      [actorId, actorRole, JSON.stringify({ editEnabled }), ipAddress, userAgent]
    );

    res.status(200).json({ output: "Success", message: `Faculty editing ${editEnabled ? "enabled" : "disabled"}` });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: err.message });
  }
};

const updateGeneralSettings = async (req, res) => {
  const { notifyOnEdit, autoLockAfterDays, maxPtTests, maxSemester } = req.body;
  const actorId = req.user.id;

  const updates = { notifyOnEdit, autoLockAfterDays, maxPtTests, maxSemester };

  try {
    for (const [key, val] of Object.entries(updates)) {
      if (val !== undefined && val !== null) {
        await db.promise().query(
          "UPDATE AcademicLogs.system_settings SET setting_value = ?, updated_by = ? WHERE setting_key = ?",
          [String(val), actorId, key]
        );
      }
    }
    res.status(200).json({ output: "Success", message: "Settings updated" });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: err.message });
  }
};

module.exports = { getSettings, toggleEditPermission, updateGeneralSettings };