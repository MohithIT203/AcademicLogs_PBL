const router = require("express").Router();
const {addFaculty,addCourse,getAllFaculty,getAllStudents, addStudent,getAllCourses,getStats,getPtScores,getSemesterScores,getStudentAttendance } = require("../controllers/admin.controller");
const{ protect } = require("../middlewares/auth.middleware");


router.post("/add-faculty",protect, addFaculty);
router.post("/add-students",protect, addStudent);
router.post("/add-course", protect, addCourse);
router.get("/all-course", protect, getAllCourses);
router.get('/all-students',protect ,getAllStudents);
router.get('/all-faculty',protect, getAllFaculty);
router.get("/dashboard-stats", protect, getStats);
router.get("/scores/:studentId", protect, getPtScores);
router.get("/semester-scores/:studentId", protect, getSemesterScores);
router.get("/student-attendance/:studentId", protect, getStudentAttendance);


module.exports = router;
