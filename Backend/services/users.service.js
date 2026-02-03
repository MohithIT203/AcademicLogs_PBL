const pool= require('../db.js');
const addUserAccess = async (
  username,
  mail_id,
  role,
  actorId,
  actorRole,
  ipAddress,
  userAgent
) => {
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    // Insert user
    const [result] = await connection.query(
      `INSERT INTO userAccess 
       (username, mail_id, role, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [username, mail_id, role]
    );

    // Audit log
    // await connection.query(
    //   `INSERT INTO audit_logs 
    //   (actor_id, actor_role, action, affected_table, affected_record_id,
    //    old_data, new_data, ip_address, user_agent, created_at)
    //    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    //   [
    //     actorId,
    //     actorRole,
    //     'CREATE',
    //     'userAccess',
    //     result.insertId,
    //     null,
    //     JSON.stringify({ username, mail_id, role }),
    //     ipAddress,
    //     userAgent
    //   ]
    // );

    await connection.commit();
    return result;

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

// const removeAccess =async(() => {});
// const updateAccess =async(() => {});


module.exports = { addUserAccess };
