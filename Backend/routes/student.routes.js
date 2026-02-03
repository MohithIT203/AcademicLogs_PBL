const router = require("express").Router();
const { createUserAccess } = require("../controllers/users.controller");

router.post("/user-access", createUserAccess);

module.exports = router;
