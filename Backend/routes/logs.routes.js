const router = require("express").Router();
const { getAcademicLogs,getLogs } = require("../controllers/logs.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/academic-logs", protect, getAcademicLogs);
router.get("/logs", protect, getLogs);

module.exports = router;