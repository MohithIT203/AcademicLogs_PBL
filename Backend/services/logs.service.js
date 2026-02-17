const pool = require('../db.js');

const createLog = async (log) => {
    const {
        actorId,
        actorRole,
        action,
        affectedTable,
        affectedRecordId,
        status,
        message,
        oldData = null,
        newData = null,
        errorDetails = null,
        ipAddress = '',
        userAgent = ''
    } = log;

    try {
        await pool.promise().query(  //to return a promise and use async/await syntax
            `INSERT INTO audit_logs
            (actor_id, actor_role, action, affected_table, affected_record_id,
             status, message, old_data, new_data, error_details,
             ip_address, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
                actorId,
                actorRole,
                action,
                affectedTable,
                affectedRecordId,
                status,
                message,
                oldData,
                newData,
                errorDetails,
                ipAddress,
                userAgent
            ]
        );
    } catch (err) {
        console.error("❌ Failed to create log entry:", err.message);
    }
};

const getLogs = async () => {
    try {
    const [rows] = await pool.promise().query(
      `SELECT id, actor_id, actor_role, action,
              affected_table, affected_record_id, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 10`
    );

    return rows;
  } catch (err) {
    console.error(err);
    throw err;
  }    
}


module.exports = { createLog, getLogs };