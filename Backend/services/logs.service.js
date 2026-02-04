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
        await pool.query(
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

module.exports = { createLog };
