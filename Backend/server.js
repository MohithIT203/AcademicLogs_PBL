const express = require('express');
const db = require('./db.js');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const studentRoutes = require('./routes/student.routes.js');
// const logRoutes = require('./routes/admin.routes.js');
const loginRoutes = require('./routes/login.routes.js');
const adminRoutes = require('./routes/admin.routes.js');
const { protect } = require('./middlewares/auth.middleware.js');

require('dotenv').config();

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());


app.use(studentRoutes);
app.use(loginRoutes);
app.use(adminRoutes);
// app.use(logRoutes);


app.get("/me",protect, (req, res) => {
   if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({
    id: req.user.id,
    role: req.user.role,
    name:req.user.name,
  });
});

app.listen(process.env.PORT, () => {
  console.log(`PORT CONNECTED AT ${process.env.PORT}`);
});
