const logService = require("../services/logs.service");
const pool = require("../db.js");

const getAcademicLogs = async (req, res) => {
  try {
    const logs = await logService.getLogs();
    res.status(200).json({
      message: "Successfully retrieved academic logs",
      data: logs,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving academic logs",
      error: err.message,
    });
  }
};

const getLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 25,
      action,
      status,
      role,
      table,
      search,
      dateFrom,
      dateTo,
    } = req.query;
 
    const safePage  = Math.max(1, parseInt(page)  || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 25));
    const offset    = (safePage - 1) * safeLimit;

    const conditions = [];
    const params     = [];
 
    if (action)   { conditions.push("action = ?");       params.push(action); }
    if (status)   { conditions.push("status = ?");       params.push(status); }
    if (role)     { conditions.push("actor_role = ?");   params.push(role); }
    if (table)    { conditions.push("affected_table = ?"); params.push(table); }
    if (dateFrom) { conditions.push("created_at >= ?");  params.push(dateFrom); }
    if (dateTo)   { conditions.push("created_at <= ?");  params.push(dateTo + " 23:59:59"); }
    if (search) {
      conditions.push("(message LIKE ? OR affected_table LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }
 
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
 
    const dataSQL = `
      SELECT
        id,
        actor_id,
        actor_role,
        action,
        affected_table,
        affected_record_id,
        old_data,
        new_data,
        ip_address,
        user_agent,
        status,
        message,
        error_details,
        created_at
      FROM audit_logs
      ${where}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
 
    const countSQL = `SELECT COUNT(*) AS total FROM audit_logs ${where}`;
 
    const statsSQL = `
      SELECT
        COUNT(*)                                        AS total,
        SUM(status = 'SUCCESS')                         AS success_count,
        SUM(status = 'FAILURE')                         AS failure_count,
        COUNT(DISTINCT actor_id)                        AS unique_actors,
        COUNT(DISTINCT affected_table)                  AS unique_tables
      FROM audit_logs
    `;

    const tablesSQL = `
      SELECT DISTINCT affected_table
      FROM audit_logs
      ORDER BY affected_table
    `;
 
    const [rows]       = await pool.promise().query(dataSQL,  [...params, safeLimit, offset]);
    const [[{ total }]] = await pool.promise().query(countSQL, params);
    const [[stats]]    = await pool.promise().query(statsSQL);
    const [tableRows]  = await pool.promise().query(tablesSQL);
 
    return res.status(200).json({
      success: true,
      data: {
        logs: rows,
        pagination: {
          page:       safePage,
          limit:      safeLimit,
          total:      parseInt(total),
          totalPages: Math.ceil(total / safeLimit),
        },
        stats: {
          total:        parseInt(stats.total),
          successCount: parseInt(stats.success_count),
          failureCount: parseInt(stats.failure_count),
          uniqueActors: parseInt(stats.unique_actors),
          uniqueTables: parseInt(stats.unique_tables),
        },
        tables: tableRows.map((r) => r.affected_table),
      },
    });
  } catch (err) {
    console.error("getLogs error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch logs", error: err.message });
  }
};
module.exports = { getAcademicLogs,getLogs };
