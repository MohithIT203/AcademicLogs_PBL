const router = require("express").Router();

const {
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
} = require("../controllers/faculty.controller.js");

const { protect, checkEditPermission } = require("../middlewares/auth.middleware.js");
const { getSettings } = require("../controllers/admin.settings.controller.js");

// ✅ DEFINE ROUTES FIRST
router.get("/students", protect, ensureFaculty, getStudents);
router.get("/courses", protect, ensureFaculty, getCourses);
router.get("/attendance-records", protect, ensureFaculty, getAttendanceRecords);
router.get("/ptscores", protect, ensureFaculty, getPtScores);
router.get("/endsem", protect, ensureFaculty, getEndsemScores);
router.get("/edit-permission", protect, ensureFaculty, getSettings);

router.post("/attendance", protect, ensureFaculty, checkEditPermission, markAttendance);
router.patch("/attendance/:id", protect, ensureFaculty, checkEditPermission, patchAttendance);
router.post("/ptscores", protect, ensureFaculty, checkEditPermission, addPtScore);
router.patch("/ptscores/:id", protect, ensureFaculty, checkEditPermission, patchPtScore);
router.post("/endsem", protect, ensureFaculty, checkEditPermission, addEndsemScore);
router.patch("/endsem/:id", protect, ensureFaculty, checkEditPermission, patchEndsemScore);

// ✅ EXPORT LAST
module.exports = router;