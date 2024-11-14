import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import nshmLogo from "../assets/nshm-logo.png";
import {
  faCircleXmark,
  faExclamation,
  faExclamationCircle,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

  return (
    <div className="login register">
      <div className="login--navbar">
        <h1>NSHM Kolkata</h1>
        <div className="wordbreak"></div>
        <span>Purchase Order Portal</span>
      </div>
      <div className="style-form">
        <div className="form-container">
          <form onSubmit={handleRegister}>
            {message && <div className="message">{message}</div>}
            {errorMessage && (
              <div className="message errorMessage">
                <FontAwesomeIcon icon={faExclamationCircle} /> {errorMessage}
              </div>
            )}
            <h1>Register</h1>

            <div className="select-group">
              <label htmlFor="role">Desired Role</label>
              <select
                id="role"
                name="role"
                value={desiredRole}
                onChange={(e) => setDesiredRole(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select role
                </option>
                <option value="admin">Admin</option>
                <option value="general user">General User</option>
              </select>
            </div>
            <div className="linebreak"></div>
            <div className="input-container">
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
              {/* <div className="linebreak"></div> */}
            </div>
            <button type="submit" className="submit">
              Confirm Registration
            </button>
            <div className="nav-section--title">
              <div className="linebreak"></div>
              <div className="section-title">OR</div>
              <div className="linebreak"></div>
            </div>
            <div className="loginProvider">
              <div
                className="user-login-provider"
                onClick={handleUserLoginClick}
              >
                User Login
              </div>
              <div className="nav-section--title">
                <div className="linebreak"></div>
                <strong className="section-title">
                  Have an admin account ?
                </strong>
                <div className="linebreak"></div>
              </div>
              <div
                className="user-login-provider"
                onClick={handleAdminLoginClick}
              >
                Admin Login
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
