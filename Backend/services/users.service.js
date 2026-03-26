const pool = require('../db.js');
const createLog = require('./logs.service.js').createLog;

// Add new User
// NOTE: `connection` is optional. Pass it when calling inside a transaction
// (e.g. from addStudent). Omit it for standalone inserts.
const addUserAccess = async (
  username,
  mail_id,
  role,
  actorId,
  actorRole,
  ipAddress,
  userAgent,
  connection  // optional — pass the transaction connection when inside a tx
) => {
  const db = connection || pool.promise();

  const [result] = await db.query(
    `INSERT INTO userAccess 
     (username, mail_id, role, created_at, updated_at)
     VALUES (?, ?, ?, NOW(), NOW())`,
    [username, mail_id, role]
  );

  await createLog({
    actorId,
    actorRole,
    action: 'CREATE',
    affectedTable: 'userAccess',
    affectedRecordId: result.insertId,
    status: 'SUCCESS',
    message: `User access created for ${username} (${role})`,
    newData: JSON.stringify({ username, mail_id, role }),
    ipAddress,
    userAgent,
  });

  return result;
};

// Update existing user
const updateAccess = async (
  id,
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

    const [oldRows] = await connection.query(
      `SELECT username, mail_id, role FROM userAccess WHERE id = ?`,
      [id]
    );

    if (oldRows.length === 0) {
      throw new Error('User not found');
    }

    const oldData = oldRows[0];

    if (
      oldData.username === username &&
      oldData.mail_id === mail_id &&
      oldData.role === role
    ) {
      await connection.rollback();
      return { success: true, message: 'No changes detected' };
    }

    await connection.query(
      `UPDATE userAccess
       SET username = ?, mail_id = ?, role = ?, updated_at = NOW()
       WHERE id = ?`,
      [username, mail_id, role, id]
    );

    // FIX: createLog takes a single object — not positional args
    await createLog({
      actorId,
      actorRole,
      action: 'UPDATE',
      affectedTable: 'userAccess',
      affectedRecordId: id,
      status: 'SUCCESS',
      message: `User ${id} updated`,
      oldData: JSON.stringify(oldData),
      newData: JSON.stringify({ username, mail_id, role }),
      ipAddress,
      userAgent,
    });

    await connection.commit();
    return { success: true };

  } catch (err) {
    await connection.rollback();

    await createLog({
      actorId,
      actorRole,
      action: 'UPDATE',
      affectedTable: 'userAccess',
      affectedRecordId: id,
      status: 'FAILURE',
      message: `Failed to update user ${id}: ${err.message}`,
      errorDetails: err.message,
      ipAddress,
      userAgent,
    });

    throw err;
  } finally {
    connection.release();
  }
};

module.exports = { addUserAccess, updateAccess };