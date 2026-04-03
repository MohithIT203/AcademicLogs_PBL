const { get } = require("lodash");
const pool = require("../db.js");

//Get Periodic Test Scores for a Student
const getptScores = async (id) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT u.id, u.username, s.regno, s.department,
              p.course_id, c.semester, p.pt_test_no, p.marks
       FROM userAccess u
       JOIN students s ON u.id = s.user_id
       JOIN pt_exams p ON s.id = p.student_id
       JOIN courses c ON p.course_id = c.id
       WHERE u.id = ? AND u.role = 'student'`,
      [id]
    );

    return rows;
  } catch (err) {
    throw err;
  }
};

//Get semester Scores for a Student
const getSemesterScores = async (id) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT u.id, u.username, s.user_id ,s.regno, s.department, p.course_id,p.semester_no, p.grade
        FROM userAccess u
        JOIN students s ON u.id = s.user_id
        JOIN endsemScores p ON s.id = p.student_id
        JOIN courses c ON p.course_id = c.id
        WHERE u.id = ? AND u.role = 'student'
      `,
      [id],
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

//get Attendance
const getAttendance = async (id) => {
  try {
    const [rows] = await pool.promise().query(
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
const getStudentCourses = async (userId) => {
  try {
    // Step 1: Get the student's department using their user_id
    const [studentRows] = await pool.promise().query(
      `SELECT id, regno, department 
       FROM AcademicLogs.students 
       WHERE user_id = ?`,
      [userId]
    );
 
    if (studentRows.length === 0) {
      return { success: false, message: "Student record not found" };
    }
 
    const { department } = studentRows[0];
 
    // Step 2: Fetch all courses belonging to that department
    const [courseRows] = await pool.promise().query(
      `SELECT id, course_code, course_name, department, semester, credits 
       FROM AcademicLogs.courses 
       WHERE department = ?
       ORDER BY semester ASC, course_name ASC`,
      [department]
    );
 
    return {
      success: true,
      data: courseRows,
    };
 
  } catch (err) {
    console.error("getStudentCourses error:", err);
    throw err;
  }
};
module.exports = { getptScores, getSemesterScores, getAttendance,getStudentCourses};
