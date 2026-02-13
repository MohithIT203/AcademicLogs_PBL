const pool = require('../db.js');

const loginUser = async (email) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT id, username, role FROM userAccess WHERE mail_id = ?`,
      [email]
    );

    if (rows.length === 0) {
      return { success: false, message: "User not found" };
    }

    const user = rows[0];
    const role = user.role;

    if (role === "student") {
      const [student_rows] = await pool.promise().query(
        `SELECT id, regno, department FROM students WHERE user_id = ?`,
        [user.id]
      );

      return {
        success: true,
        data: { ...user, ...student_rows[0] }
      };

    } else if (role === "faculty") {
      const [faculty_rows] = await pool.promise().query(
        `SELECT id, department FROM faculty WHERE user_id = ?`,
        [user.id]
      );

      return {
        success: true,
        data: { ...user, department: faculty_rows[0]?.department }
      };
    }

    return {
      success: true,
      data: user
    };

  } catch (err) {
    console.error(err);
    throw err;
  }
};

module.exports = { loginUser };
