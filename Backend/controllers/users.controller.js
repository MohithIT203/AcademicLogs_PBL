const addUserAccess = require("../services/users.service.js").addUserAccess;

const createUserAccess = async (req, res) => {
  const { username, mail_id, role } = req.body;
  console.log("Request Body:", req.body);
  const actorId = 1;
  const actorRole = "Admin";
  const ipAddress = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "";
  const userAgent = req.headers["user-agent"] || "";

  if (!username || !mail_id || !role) {
    return res.status(400).json({
      output: "Failed",
      message: "username, mail_id and role are required",
    });
  }
  try {
    const result = await addUserAccess(
      username,
      mail_id,
      role,
      actorId,
      actorRole,
      ipAddress,
      userAgent,
    );
    res.status(201).json({
      output: "Success",
      message: "User access created successfully",
      data: result,
    });
  } catch (err) {
    res.status(500).json({
      output: "Failed",
      message: "Error creating user access",
      error: err.message,
    });
  }
};

module.exports = { createUserAccess };
