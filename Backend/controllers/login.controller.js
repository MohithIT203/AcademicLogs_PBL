const { loginUser } = require("../services/login.service");
const jwt = require("jsonwebtoken");


const login = async (req, res) => { //google sign-in
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Error login user",
      error: "Email is required"
    });
  }

  try {
    const result = await loginUser(email);
     const token = jwt.sign(
      { id: result.data.id, name:result.data.username, role: result.data.role, mail_id:email },
      process.env.SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    return res.status(200).json({
      output: "Success",
      message: "Login successful"
    });

  } catch (err) {
    return res.status(500).json({
      output: "Failed",
      message: "Error logging in user",
      error: err.message
    });
  }
};

module.exports = { login };
