import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailIcon from "@mui/icons-material/Email";
import KeyIcon from "@mui/icons-material/Key";
import { auth, provider } from "./firebase.js";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { useAuth } from "../Context/AuthContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const emailFromGoogle = result.user.email;
        console.log("Signed in with:", emailFromGoogle);
        setEmail(emailFromGoogle);
        handlelogin(emailFromGoogle);
      })
      .catch((error) => {
        console.error("Google sign-in error:", error);
        setError("Google sign-in failed");
      });
  };
  

const handlelogin = async (loginemail) => {
    const loginId = loginemail || email;

    if (!loginId && !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_APP_URL}/login`,
        { email: loginId, password: password },
        { withCredentials: true }
      );

      setUser(response.data); 

      localStorage.setItem("role", response.data.role); 

      const roleRoutes = {
        admin: "/dashboard",
        faculty: "/faculty/dashboard",
        student: "/student/dashboard",
        super_admin: "/dashboard",
      };

      const redirectPath = roleRoutes[response.data.role] || "/student/dashboard";
      navigate(redirectPath);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div>
          <img src="https://i.pinimg.com/736x/86/d3/3f/86d33fd995f3d658fe0c6770be447c6c.jpg" alt="Logo" className="mx-auto h-16 w-16" />
          <h2 className="text-xl text-center font-semibold mb-6">Academic Log Management</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handlelogin(); }}>
          <div className="mb-4">
            <label className="text-gray-700 font-medium mb-2 flex items-center gap-2">
              <EmailIcon style={{ color: "#24c98b" }} /> Email:
            </label>
            <input
              className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="mb-4">
            <label className="text-gray-700 font-medium mb-2 flex items-center gap-2">
              <KeyIcon style={{ color: "#24c98b" }} /> Password:
            </label>
            <input
              className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-green-500 text-white font-medium py-2 rounded-md hover:bg-green-600 transition duration-200 cursor-pointer mb-4 mt-4 disabled:bg-gray-400"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
          <p className="text-center text-gray-500 mb-4">Or</p>
        </form>

        <button 
          className="h-10 w-full bg-gray-200 text-gray-700 font-medium py-2 rounded-md hover:bg-gray-300 transition duration-200 flex items-center justify-center gap-2 cursor-pointer" 
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/800px-Google_%22G%22_logo.svg.png" alt="Google" className="h-5 w-5" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
