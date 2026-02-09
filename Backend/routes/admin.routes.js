const router = require("express").Router();
const {addFaculty,addCourse,getAllFaculty,getAllStudents, addStudent} = require("../controllers/admin.controller");
const{ protect } = require("../middlewares/auth.middleware");


router.post("/add-faculty",protect, addFaculty);
router.post("/add-students",protect, addStudent);
router.post("/add-course", protect, addCourse);
router.get('/all-students',protect ,getAllStudents);
router.get('/all-faculty',protect, getAllFaculty);

module.exports = router;
