const pool = require("../db.js");
const { addUserAccess } = require("./users.service.js");

// Add new Faculty
const addFaculty = async ({
  username,
  user_id,
  department,
  mail_id,
  actorId,
  actorRole = '',
  ipAddress = '',
  userAgent = '',
}) => {
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    // FIX: addUserAccess needs a connection when inside a transaction,
    // and user_id from the body is the external ID — we actually create
    // the userAccess row here and use its insertId for the faculty table.
    const userResult = await addUserAccess(
      username,
      mail_id,
      'faculty',
      actorId,
      actorRole,
      ipAddress,
      userAgent,
      connection   // pass the transaction connection
    );

    const userId = userResult.insertId;

    await connection.query(
      `INSERT INTO faculty (user_id, department, joined_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [userId, department]
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

// Add new Student
const addStudent = async ({
  username,
  regno,
  department,
  mail_id,
  actorId,
  actorRole = '',
  ipAddress = '',
  userAgent = '',
}) => {
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    const userResult = await addUserAccess(
      username,
      mail_id,
      'student',
      actorId,
      actorRole,
      ipAddress,
      userAgent,
      connection
    );

    const userId = userResult.insertId;

    await connection.query(
      `INSERT INTO students (user_id, regno, department, joined_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [userId, regno, department]
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

// All courses
const allCourses = async () => {
  try {
    const [courses] = await pool.promise().query(
      `SELECT id, course_code, course_name, department, semester, credits FROM courses`
    );
    return { success: true, courses };
  } catch (err) {
    throw err;
  }
};

// Add course
const addCourse = async (course) => {
  const { courseName, courseCode, department, semester, credits } = course;
  try {
    await pool.promise().query(
      `INSERT INTO courses (course_code, course_name, department, semester, credits, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [courseCode, courseName, department, semester, credits]
    );
    return { success: true };
  } catch (err) {
    throw err;
  }
};

// All students
const allStudents = async () => {
  const [rows] = await pool.promise().query(
    `SELECT s.id AS student_id, u.username, s.regno, s.department, u.mail_id, s.updated_at
     FROM students s
     JOIN userAccess u ON s.user_id = u.id`
  );
  return { success: true, students: rows };
};

// All faculties
const allFaculties = async () => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT f.id, u.username, f.department, u.mail_id, f.updated_at
       FROM faculty f
       JOIN userAccess u ON f.user_id = u.id`
    );
    return { success: true, faculty: rows };
  } catch (err) {
    throw err;
  }
};

// Stats
const getStats = async () => {
  try {
    const [[students]] = await pool.promise().query("SELECT COUNT(*) as count FROM students");
    const [[faculty]]  = await pool.promise().query("SELECT COUNT(*) as count FROM faculty");
    const [[courses]]  = await pool.promise().query("SELECT COUNT(*) as count FROM courses");
    const [[logs]]     = await pool.promise().query("SELECT COUNT(*) as count FROM audit_logs");

    return {
      totalStudents: students.count,
      totalFaculty: faculty.count,
      totalCourses: courses.count,
      totalLogs: logs.count,
    };
  } catch (err) {
    throw err;
  }
};
const getPtScores = async (studentId) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT 
        p.id,
        p.pt_test_no,
        p.marks,
        c.course_name,
        c.course_code,
        u.username AS corrected_by_name,
        p.created_at
       FROM pt_exams p
       JOIN courses c ON p.course_id = c.id
       LEFT JOIN userAccess u ON p.corrected_by = u.id
       WHERE p.student_id = ?
       ORDER BY p.pt_test_no ASC, c.course_name ASC`,
      [studentId]
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

const getSemesterScores = async (studentId) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT 
        e.id,
        e.semester_no,
        e.grade,
        c.course_name,
        c.course_code,
        c.credits,
        e.created_at
       FROM endsemScores e
       JOIN courses c ON e.course_id = c.id
       WHERE e.student_id = ?
       ORDER BY e.semester_no ASC, c.course_name ASC`,
      [studentId]
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

const getStudentAttendance = async (studentId) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT 
        a.id,
        a.session_date,
        a.session_start,
        a.session_end,
        a.status,
        c.course_name,
        c.course_code,
        u.username AS marked_by_name
       FROM attendance a
       JOIN courses c ON a.course_id = c.id
       JOIN userAccess u ON a.marked_by = u.id
       WHERE a.student_id = ?
       ORDER BY a.session_date DESC`,
      [studentId]
    );
    return rows;
  } catch (err) {
    throw err;
  }
};


module.exports = { addFaculty, addStudent, addCourse, allCourses, allStudents, allFaculties, getStats,getPtScores,getSemesterScores,getStudentAttendance };