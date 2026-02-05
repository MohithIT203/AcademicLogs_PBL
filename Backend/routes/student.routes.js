const router = require("express").Router();
const { createUserAccess } = require("../controllers/users.controller");
const { getPtscores, getsemesterscores } = require("../controllers/student.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/user-access", protect, createUserAccess);
router.get("/pt-scores", protect, getPtscores);
router.get("/semester-scores", protect, getsemesterscores);

module.exports = router;
