const pool= require('../db.js');
const createLog = require('./logs.service.js').createLog;

//Add new User
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

    //Create log entry
    await createLog(
        actorId,
        actorRole,
        'CREATE',
        'userAccess',
        result.insertId,
        null,
        JSON.stringify({ username, mail_id, role }),
        ipAddress,
        userAgent
      );
    await connection.commit();
    return result;

  } catch (err) {
    console.log(err);
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

//Update user
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
      throw new Error("User not found");
    }

    const oldData = oldRows[0];

    if (
      oldData.username === username &&
      oldData.mail_id === mail_id &&
      oldData.role === role
    ) {
      await connection.rollback();
      return { success: true, message: "No changes detected" };
    }

    await connection.query(
      `UPDATE userAccess
       SET username = ?, mail_id = ?, role = ?, updated_at = NOW()
       WHERE id = ?`,
      [username, mail_id, role, id]
    );

    await createLog(
      actorId,
      actorRole,
      'UPDATE',
      'userAccess',
      id,
      JSON.stringify(oldData),
      JSON.stringify({ username, mail_id, role }),
      ipAddress,
      userAgent
    );

    await connection.commit();
    return { success: true };

  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};



module.exports = { addUserAccess, updateAccess };