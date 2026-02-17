const pool = require("../db.js");
const { addUserAccess } = require("./users.service.js");

//Service to Add new Faculty
const addFaculty = async (
  faculty,
  actorId,
  actorRole,
  ipAddress,
  userAgent
) => {
  const { username, user_id, department, mail_id } = faculty;
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO faculty (user_id, department, joined_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [user_id, department]
    );

    await addUserAccess(
      username,
      mail_id,
      'faculty',
      actorId,
      actorRole,
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

//Service to Add new Student
const addStudent = async ({
  username,
  regno,
  department,
  mail_id,
  actorId,
  actorRole = '',
  ipAddress = '',
  userAgent = ''
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

//all courses
const allCourses=async()=>{
    try{
      const [ courses ] = await pool.promise().query(
        `SELECT id,course_code,course_name,department,semester,credits FROM courses`
      );
      return { success: true, courses };
    }catch(err){
      throw err;
    }
}

//Add course
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
}

//all students
const allStudents = async () => {
    try {
        const [rows] = await pool.promise().query(
            `SELECT s.id, u.username, s.department, u.mail_id, s.department, s.updated_at
             FROM students s
             JOIN userAccess u ON s.user_id = u.id`
        );
        return { success: true, students: rows };
    } catch (err) {
        throw err;
    }
}

//all Faculties
const allFaculties = async () => {
    try {
        const [rows] = await pool.promise().query(
            `SELECT s.id, u.username, s.department, u.mail_id, s.department, s.updated_at
             FROM faculty s
             JOIN userAccess u ON s.user_id = u.id`
        );
        return { success: true, faculty: rows };
    } catch (err) {
        throw err;
    }
}

const getStats = async()=>{
 try {
    const [[students]] = await pool.promise().query(
      "SELECT COUNT(*) as count FROM students"
    );

    const [[faculty]] = await pool.promise().query(
      "SELECT COUNT(*) as count FROM faculty"
    );

    const [[courses]] = await pool.promise().query(
      "SELECT COUNT(*) as count FROM courses"
    );

    const [[logs]] = await pool.promise().query(
      "SELECT COUNT(*) as count FROM audit_logs"
    );
    return { totalStudents: students.count, totalFaculty: faculty.count, totalCourses: courses.count, totalLogs: logs.count };
  } catch (err) {
    throw err;
  }
}

module.exports = { addFaculty, addStudent, addCourse, allCourses, allStudents, allFaculties,getStats };