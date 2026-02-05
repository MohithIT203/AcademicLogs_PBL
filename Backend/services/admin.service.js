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
  const { username, userId, department, mail_id } = faculty;
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO faculty (user_id, department, joined_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [userId, department]
    );

    await addUserAccess(
      connection,
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
const addStudent = async (
  student,
  actorId,
  actorRole,
  ipAddress,
  userAgent
) => {
  const { username, userId, department, mail_id } = student;
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO students (user_id, department, joined_at, updated_at)
       VALUES (?, ?, NOW(), NOW())`,
      [userId, department]
    );

    await addUserAccess(
      connection,
      username,
      mail_id,
      'student',
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

module.exports = { addFaculty, addStudent, addCourse, allStudents, allFaculties };