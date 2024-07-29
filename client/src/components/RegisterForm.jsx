import React, { useState } from "react";
import axios from "axios";
import RequestStatus from "./RequestStatus";
import { Link, Navigate } from "react-router-dom";
import InfoModal from "./InfoModal";

function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [redirect, setRedirect] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3001/register/request",
        {
          name,
          email,
          organisation,
          reason,
        }
      );
      if (response.data.redirect) {
        setRedirect(true);
      } else {
        setSubmitted(true);
        setMessage(response.data.message);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setErrorMessage(error.response.data.message);
      setMessage("");
    }
  };

  return (
    <div className="style-form">
      <h2>Request Access</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Organisation"
          value={organisation}
          onChange={(e) => setOrganisation(e.target.value)}
        />
        <input
          placeholder="Reason for Access"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        ></input>

        <button type="submit" className="submit">
          Register
        </button>

        <div className="link-container">
          Have an Account?
          <Link to="/login" className="link">
            Login
          </Link>
        </div>
      </form>
      {submitted && <RequestStatus name={name} />}
      {redirect && <RequestStatus name={name} />}
      {errorMessage && (
        <div className="message errorMessage">{errorMessage}</div>
      )}
    </div>
  );
}

export default RegisterForm;
