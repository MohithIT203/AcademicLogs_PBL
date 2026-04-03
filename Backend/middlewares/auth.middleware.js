const jwt = require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const db = require("../db"); 
require('dotenv').config();

const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token){
     return res.status(401).json({ message: "Authorization token not found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

const checkEditPermission = async (req, res, next) => {
  const [rows] = await db.promise().query(
    "SELECT setting_value FROM AcademicLogs.system_settings WHERE setting_key = 'editEnabled'"
  );
  const enabled = rows[0]?.setting_value === "true";
  if (!enabled) {
    return res.status(403).json({
      output: "Failed",
      message: "Record editing is currently disabled by the administrator."
    });
  }
  next();
};

module.exports = { protect, checkEditPermission };