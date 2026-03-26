const express = require("express");
const router = express.Router();
const { getPtscores, getsemesterscores, getAttendance } = require("../controllers/student.controller.js");
const { protect } = require("../middlewares/auth.middleware.js");


router.get("/ptscores/:id", protect, getPtscores);
router.get("/semesterscores/:id", protect, getsemesterscores);
router.get("/attendance/:id", protect, getAttendance);
// router.get("/student/courses", protect, getCourses);

module.exports = router;
