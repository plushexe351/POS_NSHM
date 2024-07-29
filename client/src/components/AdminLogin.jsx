import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileWaveform,
  faPersonDotsFromLine,
  faUser,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import InfoModal from "./InfoModal";
function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setCurrentUser } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleUserLoginClick = () => {
    navigate("/login");
  };
  const handleRegisterClick = () => {
    navigate("/register");
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/adminLogin", {
        username,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token); // Store token in localStorage
        console.log("token:", response.data.token);
        setCurrentUser(response.data.user);
        // navigate("/dashboard");
        navigate("/admin/dashboard");
        setErrorMessage("");
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
        setMessage("");
      } else {
        console.error("Error logging in:", error);
        setErrorMessage("Couldn't connect to server");
        setMessage("");
      }
    }
  };

  return (
    <div className="login">
      <div className="style-form">
        <h2>Admin Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="submit">
            Login as admin
          </button>
        </form>
        {message && <div className="message">{message}</div>}
        {errorMessage && !errorMessage.includes("User not accepted") && (
          <div className="message errorMessage">{errorMessage}</div>
        )}
        {errorMessage.includes("User not accepted") && (
          <InfoModal msg="You will be able to login if your registration requests have been approved" />
        )}
      </div>
      <div className="loginProvider">
        <div
          className="style-form user-login-provider"
          onClick={handleUserLoginClick}
        >
          <FontAwesomeIcon icon={faUser} className="icon" /> User Login
        </div>
        <div className="nav-section--title">
          <div className="linebreak"></div>
          <h2 className="section-title">Don't have an account ?</h2>
          <div className="linebreak"></div>
        </div>
        <div
          className="style-form user-login-provider"
          onClick={handleRegisterClick}
        >
          <FontAwesomeIcon icon={faFileWaveform} className="icon" /> Register
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
