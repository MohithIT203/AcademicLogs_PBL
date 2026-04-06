const facultyService = require("../services/faculty.service.js");

// middleware to ensure user is faculty or super_admin
const ensureFaculty = (req, res, next) => {
  if (!req.user || (req.user.role !== "faculty" && req.user.role !== "super_admin")) {
    return res.status(403).json({ message: "Access forbidden: faculty only" });
  }
  next();
};

// fetch resources
const getStudents = async (req, res) => {
  try {
    const facultyId = req.user?.id;
    const students = await facultyService.getAllStudents(facultyId);
    res.status(200).json({ output: "Success", data: students });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error retrieving students", error: err.message });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await facultyService.getAllCourses();
    res.status(200).json({ output: "Success", data: courses });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error retrieving courses", error: err.message });
  }
};

const getAttendanceRecords = async (req, res) => {
  try {
    const studentId = req.query.studentId || null;
    const attendance = await facultyService.getAttendanceRecords(studentId);
    res.status(200).json({ output: "Success", data: attendance });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error retrieving attendance records", error: err.message });
  }
};

// mark or update attendance
const markAttendance = async (req, res) => {
  const actorId = req.user.id;
  const actorRole = req.user.role;
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  const { studentId, courseId, sessionDate, status } = req.body;
  if (!studentId || !courseId || !sessionDate || !status) {
    return res.status(400).json({ output: "Failed", message: "studentId, courseId, sessionDate and status are required" });
  }
  
  // console.log(req.body);
  try {
    await facultyService.markAttendance({
      studentId,
      courseId,
      sessionDate,
      status,
      markedBy: actorId,
      actorId,
      actorRole,
      ipAddress,
      userAgent,
   
    });
    res.status(201).json({ output: "Success", message: "Attendance recorded" });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error marking attendance", error: err.message });
  }
};

const patchAttendance = async (req, res) => {
  const actorId = req.user.id;
  const actorRole = req.user.role;
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  const attendanceId = req.params.id;
  const { status } = req.body;
  if (!attendanceId || !status) {
    return res.status(400).json({ output: "Failed", message: "attendance id and new status required" });
  }

  try {
    await facultyService.updateAttendance(attendanceId, status, actorId, actorRole, ipAddress, userAgent, new Date());
    res.status(200).json({ output: "Success", message: "Attendance updated" });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error updating attendance", error: err.message });
  }
};

// periodic test marks
const getPtScores = async (req, res) => {
  try {
    const studentId = req.query.studentId || null;
    const rows = await facultyService.getPtRecords(studentId);
    res.status(200).json({ output: "Success", data: rows });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error retrieving PT scores", error: err.message });
  }
};

const addPtScore = async (req, res) => {
  const actorId = req.user.id;
  const actorRole = req.user.role;
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  const { studentId, courseId, ptTestNo, marks } = req.body;
  if (!studentId || !courseId || ptTestNo == null || marks == null) {
    return res.status(400).json({ output: "Failed", message: "studentId, courseId, ptTestNo and marks are required" });
  }
  // console.log(req.body);
  try {
    await facultyService.addPtScore({
      studentId,
      courseId,
      ptTestNo,
      marks,
      correctedBy: actorId,
      actorId,
      actorRole,
      ipAddress,
      userAgent,
    });
    res.status(201).json({ output: "Success", message: "PT score added" });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error adding PT score", error: err.message });
  }
};


const getEndsemScores = async (req, res) => {
  try {
    const studentId = req.query.studentId || null;
    const rows = await facultyService.getEndsemRecords(studentId);
    res.status(200).json({ output: "Success", data: rows });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error retrieving end semester scores", error: err.message });
  }
};

const patchPtScore = async (req, res) => {
  const actorId = req.user.id;
  const actorRole = req.user.role;
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  const scoreId = req.params.id;
  const { marks } = req.body;
  if (!scoreId || marks == null) {
    return res.status(400).json({ output: "Failed", message: "score id and marks required" });
  }

  try {
    await facultyService.updatePtScore(scoreId, marks, actorId, actorRole, ipAddress, userAgent);
    res.status(200).json({ output: "Success", message: "PT score updated" });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error updating PT score", error: err.message });
  }
};

// end semester
const addEndsemScore = async (req, res) => {
  const actorId = req.user.id;
  const actorRole = req.user.role;
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  const { studentId, courseId, semesterNo, grade } = req.body;
  if (!studentId || !courseId || semesterNo == null || !grade) {
    return res.status(400).json({ output: "Failed", message: "studentId, courseId, semesterNo and grade are required" });
  }

  try {
    await facultyService.addEndsemScore({
      studentId,
      courseId,
      semesterNo,
      grade,
      actorId,
      actorRole,
      ipAddress,
      userAgent,
    });
    res.status(201).json({ output: "Success", message: "End semester score added" });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error adding end semester score", error: err.message });
  }
};

const patchEndsemScore = async (req, res) => {
  const actorId = req.user.id;
  const actorRole = req.user.role;
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  const scoreId = req.params.id;
  const { grade } = req.body;
  if (!scoreId || !grade) {
    return res.status(400).json({ output: "Failed", message: "score id and grade required" });
  }

  try {
    await facultyService.updateEndsemScore(scoreId, grade, actorId, actorRole, ipAddress, userAgent);
    res.status(200).json({ output: "Success", message: "End semester score updated" });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error updating end semester score", error: err.message });
  }
};

const getRewardPoints = async (req, res) => {
  try {
    const studentId = req.query.studentId || null;
    const rows = await facultyService.getRewardRecords(studentId);
    res.status(200).json({ output: "Success", data: rows });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error retrieving reward points", error: err.message });
  }
};

const addRewardPointsCtrl = async (req, res) => {
  const actorId = req.user.id;
  const actorRole = req.user.role;
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  const { studentId, points, activity } = req.body;
  if (!studentId || points == null || !activity) {
    return res.status(400).json({
      output: "Failed",
      message: "studentId, points and activity are required",
    });
  }
  try {
    await facultyService.addRewardPoints({
      studentId,
      points,
      activity,
      updatedBy: actorId,
      actorId,
      actorRole,
      ipAddress,
      userAgent,
    });
    res.status(201).json({ output: "Success", message: "Reward points added" });
  } catch (err) {
    res.status(500).json({ output: "Failed", message: "Error adding reward points", error: err.message });
  }
};

module.exports = {
  ensureFaculty,
  getStudents,
  getCourses,
  getAttendanceRecords,
  markAttendance,
  patchAttendance,
  getPtScores,
  addPtScore,
  patchPtScore,
  getEndsemScores,
  addEndsemScore,
  patchEndsemScore,
  getRewardPoints,
addRewardPointsCtrl,
};
