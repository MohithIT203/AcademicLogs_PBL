const pool = require("../db.js");
const createLog = require("./logs.service.js").createLog;


const getAllStudents = async (facultyUserId = null) => {
  try {
    let query = `SELECT s.id AS student_id, u.username, u.mail_id, s.regno, s.department
       FROM students s
       JOIN userAccess u ON s.user_id = u.id`;
    const params = [];

    if (facultyUserId) {
      query += `
        WHERE s.department = (
            SELECT department FROM faculty WHERE user_id = ?
        )`;
      params.push(facultyUserId);
    }

    const [rows] = await pool.promise().query(query, params);
    return rows;
  } catch (err) {
    throw err;
  }
};

// fetch all courses
const getAllCourses = async () => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT id AS course_id, course_name, course_code, department, semester, credits
       FROM courses`
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

// attendance queries
const getAttendanceRecords = async (studentId = null) => {
  try {
    let query = `SELECT a.id,
              a.student_id,
              u.username,
              c.course_name,
              a.session_date,
              a.status,
              a.marked_by
       FROM attendance a
       JOIN students s ON a.student_id = s.id
       JOIN userAccess u ON s.user_id = u.id
       JOIN courses c ON a.course_id = c.id`;
    const params = [];
    if (studentId) {
      query += ` WHERE s.id = ?`;
      params.push(studentId);
    }
    query += ` ORDER BY a.session_date DESC`;
    const [rows] = await pool.promise().query(query, params);
    return rows;
  } catch (err) {
    throw err;
  }
};

const markAttendance = async ({
  studentId,
  courseId,
  sessionDate,
  status,
  markedBy,
  actorId,
  updatedAt,
  actorRole = "",
  ipAddress = "",
  userAgent = "",
}) => {
  try {
    const [result] = await pool.promise().query(
      `INSERT INTO attendance
         (student_id, course_id, session_start,session_date, status, marked_by, created_at)
       VALUES (?, ?,NOW(), ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [studentId, courseId, sessionDate, status, markedBy]
    );

    await createLog({
      actorId,
      actorRole,
      action: "CREATE",
      affectedTable: "attendance",
      affectedRecordId: result.insertId || null,
      status: "SUCCESS",
      message: `Marked attendance for student ${studentId}`,
      newData: JSON.stringify({ studentId, courseId, sessionDate, status }),
      ipAddress,
      userAgent,
    });

    return result;
  } catch (err) {
    // log failure
    await createLog({
      actorId,
      actorRole,
      action: "CREATE",
      affectedTable: "attendance",
      affectedRecordId: null,
      status: "FAILURE",
      message: `Failed to mark attendance: ${err.message}`,
      errorDetails: err.message,
      ipAddress,
      userAgent,
    });
    throw err;
  }
};

const updateAttendance = async (
  id,
  status,
  actorId,
  actorRole = "",
  ipAddress = "",
  userAgent = ""
) => {
  // const connection = await pool.promise().getConnection();
  try {
    const [oldRows] = await pool.promise().query(
      `SELECT * FROM attendance WHERE id = ?`,
      [id]
    );
    if (oldRows.length === 0) {
      throw new Error("Attendance record not found");
    }
    const oldData = oldRows[0];

    await pool.promise().query(
      `UPDATE attendance SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    await createLog({
      actorId,
      actorRole,
      action: "UPDATE",
      affectedTable: "attendance",
      affectedRecordId: id,
      status: "SUCCESS",
      message: `Updated attendance record ${id}`,
      oldData: JSON.stringify(oldData),
      newData: JSON.stringify({ ...oldData, status }),
      ipAddress,
      userAgent,
    });

    return { success: true };
  } catch (err) {
    await createLog({
      actorId,
      actorRole,
      action: "UPDATE",
      affectedTable: "attendance",
      affectedRecordId: id,
      status: "FAILURE",
      message: `Failed to update attendance: ${err.message}`,
      errorDetails: err.message,
      ipAddress,
      userAgent,
    });
    throw err;
  }
};

// periodic test marks
const addPtScore = async ({
  studentId,
  courseId,
  ptTestNo,
  marks,
  correctedBy,
  actorId,
  actorRole = "",
  ipAddress = "",
  userAgent = "",
}) => {
  try {
    const [result] = await pool.promise().query(
      `INSERT INTO pt_exams
         (student_id, course_id, pt_test_no, marks, corrected_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [studentId, courseId, ptTestNo, marks, correctedBy]
    );

    await createLog({
      actorId,
      actorRole,
      action: "CREATE",
      affectedTable: "pt_exams",
      affectedRecordId: result.insertId,
      status: "SUCCESS",
      message: `Added PT score for student ${studentId}`,
      newData: JSON.stringify({ studentId, courseId, ptTestNo, marks }),
      ipAddress,
      userAgent,
    });

    return result;
  } catch (err) {
    await createLog({
      actorId,
      actorRole,
      action: "CREATE",
      affectedTable: "pt_exams",
      affectedRecordId: null,
      status: "FAILURE",
      message: `Failed to add PT score: ${err.message}`,
      errorDetails: err.message,
      ipAddress,
      userAgent,
    });
    throw err;
  }
};

const updatePtScore = async (
  id,
  marks,
  actorId,
  actorRole = "",
  ipAddress = "",
  userAgent = ""
) => {
  // const connection = await pool.promise().getConnection();
  try {
    const [oldRows] = await pool.promise().query(
      `SELECT * FROM pt_exams WHERE id = ?`,
      [id]
    );
    if (oldRows.length === 0) {
      throw new Error("PT exam record not found");
    }
    const oldData = oldRows[0];

    await pool.promise().query(
      `UPDATE pt_exams SET marks = ?, updated_at = NOW() WHERE id = ?`,
      [marks, id]
    );

    await createLog({
      actorId,
      actorRole,
      action: "UPDATE",
      affectedTable: "pt_exams",
      affectedRecordId: id,
      status: "SUCCESS",
      message: `Updated PT score ${id}`,
      oldData: JSON.stringify(oldData),
      newData: JSON.stringify({ ...oldData, marks }),
      ipAddress,
      userAgent,
    });

    return { success: true };
  } catch (err) {
    await createLog({
      actorId,
      actorRole,
      action: "UPDATE",
      affectedTable: "pt_exams",
      affectedRecordId: id,
      status: "FAILURE",
      message: `Failed to update PT score: ${err.message}`,
      errorDetails: err.message,
      ipAddress,
      userAgent,
    });
    throw err;
  }
};

// end semester scores
const addEndsemScore = async ({
  studentId,
  courseId,
  semesterNo,
  grade,
  actorId,
  actorRole = "",
  ipAddress = "",
  userAgent = "",
}) => {
  try {
    const [result] = await pool.promise().query(
      `INSERT INTO endsemScores
         (student_id, course_id, semester_no, grade, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [studentId, courseId, semesterNo, grade]
    );

    await createLog({
      actorId,
      actorRole,
      action: "CREATE",
      affectedTable: "endsemScores",
      affectedRecordId: result.insertId,
      status: "SUCCESS",
      message: `Added endsem score for student ${studentId}`,
      newData: JSON.stringify({ studentId, courseId, semesterNo, grade }),
      ipAddress,
      userAgent,
    });

    return result;
  } catch (err) {
    await createLog({
      actorId,
      actorRole,
      action: "CREATE",
      affectedTable: "endsemScores",
      affectedRecordId: null,
      status: "FAILURE",
      message: `Failed to add endsem score: ${err.message}`,
      errorDetails: err.message,
      ipAddress,
      userAgent,
    });
    throw err;
  }
};

const updateEndsemScore = async (
  id,
  grade,
  actorId,
  actorRole = "",
  ipAddress = "",
  userAgent = ""
) => {
  // const connection = await pool.promise().getConnection();
  try {
    const [oldRows] = await pool.promise().query(
      `SELECT * FROM endsemScores WHERE id = ?`,
      [id]
    );
    if (oldRows.length === 0) {
      throw new Error("End semester score record not found");
    }
    const oldData = oldRows[0];

    await pool.promise().query(
      `UPDATE endsemScores SET grade = ?, updated_at = NOW() WHERE id = ?`,
      [grade, id]
    );

    await createLog({
      actorId,
      actorRole,
      action: "UPDATE",
      affectedTable: "endsemScores",
      affectedRecordId: id,
      status: "SUCCESS",
      message: `Updated endsem score ${id}`,
      oldData: JSON.stringify(oldData),
      newData: JSON.stringify({ ...oldData, grade }),
      ipAddress,
      userAgent,
    });

    return { success: true };
  } catch (err) {
    await createLog({
      actorId,
      actorRole,
      action: "UPDATE",
      affectedTable: "endsemScores",
      affectedRecordId: id,
      status: "FAILURE",
      message: `Failed to update endsem score: ${err.message}`,
      errorDetails: err.message,
      ipAddress,
      userAgent,
    });
    throw err;
  }
};

// list pt exam records (optionally later we could filter by student/course)
const getPtRecords = async (studentId = null) => {
  try {
    let query = `SELECT p.id, s.id AS student_id, u.username, c.course_name, p.pt_test_no, p.marks
       FROM pt_exams p
       JOIN students s ON p.student_id = s.id
       JOIN userAccess u ON s.user_id = u.id
       JOIN courses c ON p.course_id = c.id`;
    const params = [];
    if (studentId) {
      query += ` WHERE s.id = ?`;
      params.push(studentId);
    }
    query += ` ORDER BY p.created_at DESC`;
    const [rows] = await pool.promise().query(query, params);
    return rows;
  } catch (err) {
    throw err;
  }
};

// list end semester records
const getEndsemRecords = async (studentId = null) => {
  try {
    let query = `SELECT e.id, s.id AS student_id, u.username, c.course_name, e.semester_no, e.grade
       FROM endsemScores e
       JOIN students s ON e.student_id = s.id
       JOIN userAccess u ON s.user_id = u.id
       JOIN courses c ON e.course_id = c.id`;
    const params = [];
    if (studentId) {
      query += ` WHERE s.id = ?`;
      params.push(studentId);
    }
    query += ` ORDER BY e.created_at DESC`;
    const [rows] = await pool.promise().query(query, params);
    return rows;
  } catch (err) {
    throw err;
  }
};


///
const getRewardRecords = async (studentId = null) => {
  try {
    let query = `
      SELECT rp.id, s.id AS student_id, u.username, rp.points, rp.activity, rp.created_at
      FROM reward_points rp
      JOIN students s ON rp.student_id = s.id
      JOIN userAccess u ON s.user_id = u.id
    `;
    const params = [];
    if (studentId) {
      query += ` WHERE s.id = ?`;
      params.push(studentId);
    }
    query += ` ORDER BY rp.created_at DESC`;
    const [rows] = await pool.promise().query(query, params);
    return rows;
  } catch (err) {
    throw err;
  }
};

const addRewardPoints = async ({
  studentId,
  points,
  activity,
  updatedBy,
  actorId,
  actorRole = "",
  ipAddress = "",
  userAgent = "",
}) => {
  try {
    const [result] = await pool.promise().query(
      `INSERT INTO reward_points (student_id, points, activity, updated_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [studentId, points, activity, updatedBy]
    );
    await createLog({
      actorId,
      actorRole,
      action: "CREATE",
      affectedTable: "reward_points",
      affectedRecordId: result.insertId,
      status: "SUCCESS",
      message: `Awarded ${points} reward points to student ${studentId} for: ${activity}`,
      newData: JSON.stringify({ studentId, points, activity }),
      ipAddress,
      userAgent,
    });
    return result;
  } catch (err) {
    await createLog({
      actorId,
      actorRole,
      action: "CREATE",
      affectedTable: "reward_points",
      affectedRecordId: null,
      status: "FAILURE",
      message: `Failed to add reward points: ${err.message}`,
      errorDetails: err.message,
      ipAddress,
      userAgent,
    });
    throw err;
  }
};
module.exports = {
  getAllStudents,
  getAllCourses,
  getAttendanceRecords,
  markAttendance,
  updateAttendance,
  addPtScore,
  updatePtScore,
  addEndsemScore,
  updateEndsemScore,
  getPtRecords,
  getEndsemRecords,
  getRewardRecords,
  addRewardPoints,
};
