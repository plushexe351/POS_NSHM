import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function RequestStatus({ name }) {
  const [status, setStatus] = useState(null);
  const { setRegisterStatus } = useContext(AuthContext);

  useEffect(() => {
    if (name) {
      const fetchStatus = async () => {
        try {
          const response = await axios.post("http://localhost:3001/status", {
            name,
          }); // Adjust endpoint as per backend
          setStatus(response.data.status); // Assuming API returns { status: "accepted" } or { status: "null" }
        } catch (error) {
          console.error("Error fetching status:", error);
        }
      };
      fetchStatus();
    }
  }, [name]);

  if (!name) {
    return null;
  }

  if (status === "null") {
    return <div className="message success">Request sent successfully</div>;
  } else if (status === "accepted") {
    setRegisterStatus(true);
    return <Navigate to="/register" />;
  } else {
    setRegisterStatus(false);
    return null; // Handle other statuses as needed
  }
}

export default RequestStatus;
