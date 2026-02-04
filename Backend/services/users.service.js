const pool= require('../db.js');
const createLog = require('./logs.service.js').createLog;

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


//------------------------------------------------------------------------------
const updateAccess = async(
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
    // Insert user
    const [result] = await connection.query(
      `UPDATE userAccess 
       SET username=?, mail_id=?, role=?, updated_at=NOW()
       WHERE id=?`,
      [username, mail_id, role,id]
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


module.exports = { addUserAccess, updateAccess };