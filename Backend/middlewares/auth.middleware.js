const jwt = require('jsonwebtoken');
const cookieParser=require('cookie-parser');
require('dotenv').config;

const protect = (req, res, next) => {
  const token = req.cookies.token;
  if (!token){
     return res.status(401).json({ message: "Authorization token not found" });
  }

  try {
    const user = jwt.verify(token, process.env.SECRET_KEY);
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ message:"Authorization Token Required"});
  }
};

module.exports = {protect};