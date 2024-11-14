import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationCircle,
  faFileWaveform,
  faUser,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import InfoModal from "./InfoModal";
import iphone from "../assets/iphone.png";
import nshmLogo from "../assets/nshm-logo.png";
import mac from "../assets/mac.png";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { setCurrentUser } = useContext(AuthContext);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleAdminLoginClick = () => {
    navigate("/admin/login");
  };

  const handleRegisterClick = () => {
    navigate("/register");
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/login", {
        username,
        password,
      });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token); // Store token in localStorage
        setCurrentUser(response.data.user);
        // navigate("/dashboard");
        navigate("/dashboard");
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
      <div className="login--navbar">
        <h1>NSHM Kolkata</h1>
        <div className="wordbreak"></div>
        <span>Purchase Order Portal</span>
      </div>
      <div className="style-form">
        <div className="form-container">
          <form onSubmit={handleLogin}>
            <h1>User Login</h1>
            <input
              type="text"
              placeholder="Username"
              value={username}
              id="username"
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="submit">
              Login as user
            </button>
            <div className="nav-section--title">
              <div className="linebreak"></div>
              <div className="section-title">OR</div>
              <div className="linebreak"></div>
            </div>
            <div className="loginProvider">
              <div
                className="user-login-provider"
                onClick={handleAdminLoginClick}
              >
                {/* <FontAwesomeIcon icon={faUserGear} className="icon" /> */}
                Admin Login
              </div>
              <div className="nav-section--title">
                <div className="linebreak"></div>
                <strong className="section-title">
                  Don't have an account ?
                </strong>
                <div className="linebreak"></div>
              </div>
              <div
                className="user-login-provider"
                onClick={handleRegisterClick}
              >
                {/* <FontAwesomeIcon icon={faFileWaveform} className="icon" />{" "} */}
                Register
              </div>
            </div>
            {message && <div className="message">{message}</div>}
            {errorMessage && !errorMessage.includes("User not accepted") && (
              <div className="message errorMessage">
                <FontAwesomeIcon icon={faExclamationCircle} /> {errorMessage}
              </div>
            )}
            {errorMessage.includes("User not accepted") && (
              <InfoModal msg="You will be able to login if your registration requests have been approved" />
            )}
          </form>
        </div>
      </div>
      <div className="login-hero">
        <img src={iphone} alt="" id="iphone-img" className="login-hero--img" />
        <img src={iphone} alt="" id="iphone-img2" className="login-hero--img" />
      </div>
    </div>
  );
}

export default Login;
