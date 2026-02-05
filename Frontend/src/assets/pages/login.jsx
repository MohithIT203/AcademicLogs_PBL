import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import KeyIcon from "@mui/icons-material/Key";
import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

//   const handleGoogleSignIn = () => {
//     signInWithPopup(auth, provider)
//       .then((result) => {
//         const emailFromGoogle = result.user.email;
//         console.log("Signed in with:", emailFromGoogle);
//         setEmail(emailFromGoogle);
//         handlelogin(emailFromGoogle);
//       })
//       .catch((error) => {
//         console.error("Google sign-in error:", error);
//       });
//   };
  

const handlelogin = async (loginemail) => {
  const loginId=loginemail|| email;
  try {
        const response = await axios.post(
        `${import.meta.env.VITE_SERVER_APP_URL}/login`,
        { email: loginId, },
        { withCredentials: true }
      );

    navigate("/dashboard",
        {state:{response}});
  } catch (err) {
    console.error(err);
  }
};



  return (
    <div className="mainContainer">
      <div className="outerdiv">
        <h2 className="head">Academic Log Management</h2>
        <form onSubmit={(e) =>{ e.preventDefault();handlelogin();}}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ color: "#4b5563", display: "flex", gap: "8px" }}>
              <EmailIcon style={{ color: "#24c98b" }} /> Email:
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="inputField"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ color: "#4b5563", display: "flex", gap: "8px" }}>
              <KeyIcon style={{ color: "#24c98b" }} /> Password:
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="inputField"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <button type="submit" className="submitBtn">
              Login
            </button>
          </div>
          <p style={{ fontSize: "12px", fontWeight: "500" }}>Or</p>
        </form>

        <button className="google" onClick={/*handleGoogleSignIn*/null}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png" alt="Google" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
