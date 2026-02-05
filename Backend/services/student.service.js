const pool = require("../db.js");

//Get Periodic Test Scores for a Student
const getptScores = async (mail_id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT u.id, u.username, s.user_id ,s.regno, s.department, p.course_id, c.semester, p.pt_test_no, p.marks
        FROM userAccess u
        JOIN students s ON u.id = s.user_id
        JOIN pt_exams p ON s.id = p.student_id
        JOIN courses c ON p.course_id = c.id
        WHERE u.mail_id = ? AND u.role = 'student'
      `,
      [mail_id],
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

//Get semester Scores for a Student
const getSemesterScores = async (mail_id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT u.id, u.username, s.user_id ,s.regno, s.department, p.course_id,e.semester_no, p.marks
        FROM userAccess u
        JOIN students s ON u.id = s.user_id
        JOIN endsemScores p ON s.id = p.student_id
        JOIN courses c ON p.course_id = c.id
        WHERE u.mail_id = ? AND u.role = 'student'
      `,
      [mail_id],
    );
    return rows;
  } catch (err) {
    throw err;
  } finally {
    connection.release();
  }
};

//get Attendance
const getAttendance = async (mail_id) => {
  const connection = await pool.promise().getConnection();
  try {
    const [rows] = await connection.query(
      `
  SELECT 
    u.id AS user_id,
    u.username,
    s.id AS student_id,
    a.session_date,
    a.session_start,
    a.session_end,
    a.status,
    c.course_name,
    f.user_id AS marked_by
  FROM AcademicLogs.userAccess u
  JOIN AcademicLogs.students s 
    ON s.user_id = u.id
  JOIN AcademicLogs.attendance a 
    ON a.student_id = s.id
  JOIN AcademicLogs.courses c 
    ON c.id = a.course_id
  JOIN AcademicLogs.faculty f
    ON f.user_id = a.marked_by
  WHERE u.id = ?
  `,
      [id],
    );

    return rows;
  } catch (err) {
    throw err;
  }
};

module.exports = { getptScores, getSemesterScores, getAttendance };
