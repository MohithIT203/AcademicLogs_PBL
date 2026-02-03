const express = require('express');
const db = require('./db.js');
const cors = require('cors');
const studentRoutes = require('./routes/student.routes.js');


require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(studentRoutes);
app.listen(process.env.PORT, () => {
  console.log(`PORT CONNECTED AT ${process.env.PORT}`);
});
