const facultyService = require("../services/admin.service");
const StudentService = require("../services/admin.service");
const CourseService = require("../services/admin.service");

//Add a faculty member
const addFaculty = async (req, res) => {
  const { username, userId, department, mail_id } = req.body;
  if (!username || !userId || !department || !mail_id) {
    return res.status(400).json({
      output: "Failed",
      message: "username, userId, department and mail_id are required",
    });
  }
  try {
    await facultyService.addFaculty({ username, userId, department, mail_id });
    res.status(201).json({
      output: "Success",
      message: "Faculty added successfully",
    });
  } catch (err) {
    res.status(500).json({
      output: "Failed",
      message: "Error adding faculty",
      error: err.message,
    });
  }
};

//Add a student member
const addStudent = async (req, res) => {
  const actorId = req.user.id;
  const actorRole = req.user.role;
  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress ||
    "";
  const userAgent = req.headers["user-agent"] || "";
  const { username, regno, department, mail_id } = req.body;
  if (!username || !regno || !department || !mail_id) {
    return res.status(400).json({
      output: "Failed",
      message: "username, regno, department and mail_id are required",
    });
  }
  try {
    await StudentService.addStudent({
      username,
      regno,
      department,
      mail_id,
      actorId,
      actorRole,
      ipAddress,
      userAgent,
    });
    res.status(201).json({
      output: "Success",
      message: "Student added successfully",
    });
  } catch (err) {
    res.status(500).json({
      output: "Failed",
      message: "Error adding student",
      error: err.message,
    });
  }
};

//Add a course
const addCourse = async (req, res) => {
  const { courseName, courseCode, department, semester, credits } = req.body;
  if (!courseName || !courseCode || !department || !semester || !credits) {
    return res.status(400).json({
      output: "Failed",
      message:
        "courseName, courseCode, department, semester and credits are required",
    });
  }
  try {
    await CourseService.addCourse({
      courseName,
      courseCode,
      department,
      semester,
      credits,
    });
    res.status(201).json({
      output: "Success",
      message: "Course added successfully",
    });
  } catch (err) {
    res.status(500).json({
      output: "Failed",
      message: "Error adding course",
      error: err.message,
    });
  }
};

//Get all students
const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseService.allCourses();
    res.status(200).json({
      output: "Success",
      message: "Courses retrieved successfully",
      data: courses,
    });
  } catch (err) {
    res.status(500).json({
      output: "Failed",
      message: "Error retrieving courses",
      error: err.message,
    });
  }
};

//Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await StudentService.allStudents();
    res.status(200).json({
      output: "Success",
      message: "Students retrieved successfully",
      data: students,
    });
  } catch (err) {
    res.status(500).json({
      output: "Failed",
      message: "Error retrieving students",
      error: err.message,
    });
  }
};

//Get All Faculties
const getAllFaculty = async (req, res) => {
  try {
    const faculty = await facultyService.allFaculties();
    res.status(200).json({
      output: "Success",
      message: "Faculty retrieved successfully",
      data: faculty,
    });
  } catch (err) {
    res.status(500).json({
      output: "Failed",
      message: "Error retrieving faculty",
      error: err.message,
    });
  }
};

module.exports = {
  addFaculty,
  addStudent,
  addCourse,
  getAllStudents,
  getAllFaculty,
  getAllCourses
};
