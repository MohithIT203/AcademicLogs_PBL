const router = require("express").Router();
const { getAcademicLogs } = require("../controllers/logs.controller");
const { protect } = require("../middlewares/auth.middleware");

router.get("/academic-logs", protect, getAcademicLogs);

module.exports = router;