const logService = require("../services/logs.service");

const getAcademicLogs = async (req, res) => {
  try {
    const logs = await logService.getLogs();
    res.status(200).json({
      message: "Successfully retrieved academic logs",
      data: logs,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving academic logs",
      error: err.message,
    });
  }
};

module.exports = { getAcademicLogs };
