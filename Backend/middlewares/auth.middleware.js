const jwt = require('jsonwebtoken');
const cookieParser=require('cookie-parser');
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

module.exports = {protect};