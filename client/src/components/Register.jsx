import React, { useContext, useState } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileWaveform, faUserGear } from "@fortawesome/free-solid-svg-icons";

function Register() {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [location, setLocation] = useState("");
  const [reason, setReason] = useState("");
  const [desiredRole, setDesiredRole] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  // const { registerStatus, setRegisterStatus } = useContext(AuthContext);
  const handleAdminLoginClick = () => {
    navigate("/admin/login");
  };

  const handleUserLoginClick = () => {
    navigate("/login");
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:3001/register", {
        name,
        username,
        email,
        organization,
        location,
        reason,
        desiredRole,
        password,
      });

      setMessage(response.data.message);
      setErrorMessage("");

      navigate("/login");
    } catch (error) {
      console.error("Error registering user:", error);
      setErrorMessage(error.response?.data.message);
      setMessage("");
    }
  };
  // if (!registerStatus) {
  //   return <Navigate to="/register/request" />;
  // }
  // if (registerStatus) {
  return (
    <div className="register">
      <div className="hero"></div>
      <div className="style-form">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Reason for access"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Desired role (admin / general user)"
            value={desiredRole}
            onChange={(e) => setDesiredRole(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Set Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Set Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="submit">
            Confirm Registration
          </button>
        </form>
        {/* <div className="link-container">
          Have an Account ?
          <Link to="/login" className="link">
            Login
          </Link>
        </div> */}
        {message && <div className="message">{message}</div>}
        {errorMessage && (
          <div className="message errorMessage">{errorMessage}</div>
        )}
      </div>
      <div className="loginProvider">
        <div className="nav-section--title">
          <div className="linebreak"></div>
          <h2 className="section-title">Have an account ?</h2>
          <div className="linebreak"></div>
        </div>
        <div
          className="style-form user-login-provider"
          onClick={handleUserLoginClick}
        >
          <FontAwesomeIcon icon={faFileWaveform} className="icon" /> User Login
        </div>
        <div
          className="style-form user-login-provider"
          onClick={handleAdminLoginClick}
        >
          <FontAwesomeIcon icon={faUserGear} className="icon" /> Admin Login
        </div>
      </div>
    </div>
  );
}
// }

export default Register;
