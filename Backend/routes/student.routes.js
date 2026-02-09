const router = require("express").Router();
const { createUserAccess } = require("../controllers/users.controller");
const { getPtscores, getsemesterscores,getAttendance } = require("../controllers/student.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/user-access", protect, createUserAccess);
router.get("/pt-scores/:id", protect, getPtscores);
router.get("/semester-scores/:id", protect, getsemesterscores);
router.get("/attendance/:id", protect, getAttendance);

module.exports = router;
