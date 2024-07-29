import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faUserGear,
  faPowerOff,
  faSliders,
  faX,
  faBars,
  faList,
  faCheckCircle,
  faTruckLoading,
  faListCheck,
  faTableList,
  faListAlt,
  faListDots,
  faListSquares,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GeneratePO from "./GeneratePO";
// import "./App.scss"; // Import your CSS here

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState("viewRequests"); // "manageUsers" or "viewRequests"
  const [pageViewMode, setPageViewMode] = useState("Manage Users");
  const [removing, setRemoving] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);

  const navigate = useNavigate();

  const handleGeneratePOClick = (requisition) => {
    setSelectedRequisition(requisition);
  };

  const handleCloseModal = () => {
    setSelectedRequisition(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("token again:", token);
        if (!token) {
          throw new Error("No token stored");
        }
        toast.success(`Welcome back, ${currentUser.username}`);

        const response = await axios.get("http://localhost:3001/dashboard", {
          headers: { Authorization: token },
        });

        if (response.data.message === "success") {
          console.log("Logged in");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Error fetching dashboard data");
        setError(true);
      }
    };

    fetchData();
    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/admin/requests"
        );
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Error fetching requests");
      }
    };
    fetchRequests();
    const fetchPurchaseRequisitions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/admin/purchaseRequisitions"
        );
        setPurchaseRequisitions(response.data);
      } catch (error) {
        console.error("Error fetching Purchase Requisitions:", error);
        toast.error("Error fetching Purchase Requisitions");
      }
    };
    fetchPurchaseRequisitions();
  }, [currentUser]);

  const handleRemove = (id, status, message) => {
    setRemoving(id);
    setTimeout(async () => {
      try {
        await axios.put(`http://localhost:3001/admin/requests/${id}`, {
          status,
        });
        setRequests((prevRequests) =>
          prevRequests.map((request) =>
            request.id === id ? { ...request, status } : request
          )
        );
        toast.success(message);
      } catch (error) {
        console.error(`Error updating request status to ${status}:`, error);
        toast.error(`Error updating request status to ${status}`);
      } finally {
        setRemoving(null);
      }
    }, 500);
  };

  const handleAccept = (id) => {
    handleRemove(
      id,
      "accepted",
      "Request accepted and granted general user role"
    );
  };

  const handleAcceptAsAdmin = (id) => {
    handleRemove(
      id,
      "accepted as admin",
      "Request accepted and granted admin role"
    );
  };

  const handleReject = (id) => {
    handleRemove(id, "rejected", "User request rejected");
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filteredRequests =
    viewMode === "manageUsers"
      ? requests.filter((request) => request.status.includes("accepted"))
      : requests.filter((request) => !request.status.includes("accepted"));

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="admin-dashboard">
      <nav className="dashboard--navbar">
        <h2>
          <i>POS</i>
          <span className="wordbreak">.</span>Admin Panel
        </h2>
        <div className="inner-nav">
          <div
            className={`manage-users ${
              pageViewMode === "Manage Users" ? "active" : ""
            }`}
            onClick={() => setPageViewMode("Manage Users")}
          >
            Manage Users
          </div>
          <div
            className={`manage-requisitions ${
              pageViewMode === "Manage Requisitions" ? "active" : ""
            }`}
            onClick={() => setPageViewMode("Manage Requisitions")}
          >
            Manage Requisitions
          </div>
          <div
            className={`view-detailed-dashboard ${
              pageViewMode === "Detailed Dashboard" ? "active" : ""
            }`}
            onClick={() => setPageViewMode("Detailed Dashboard")}
          >
            Detailed Dashboard
          </div>
          <div className="button-log-out" onClick={handleLogOut}>
            Log Out <FontAwesomeIcon icon={faPowerOff} />
          </div>
        </div>
        <FontAwesomeIcon icon={faBars} className="hamburg" />
      </nav>
      {pageViewMode && pageViewMode === "Manage Users" && (
        <div className="container">
          <ul className="nav">
            {/* Todo : Change to reusable component - NavSection.jsx; Start of component -> */}

            <li
              className={viewMode === "manageUsers" ? "active" : ""}
              onClick={() => setViewMode("manageUsers")}
            >
              Active Users <FontAwesomeIcon icon={faUserGear} />
            </li>
            <li
              className={viewMode === "viewRequests" ? "active" : ""}
              onClick={() => setViewMode("viewRequests")}
            >
              Pending Requests
              <FontAwesomeIcon icon={faSliders} />
            </li>
          </ul>
          <ul className="userCards">
            {filteredRequests.map((request) => (
              <li
                key={request.id}
                className={`userCard ${
                  removing === request.id ? "fade-out" : ""
                }`}
              >
                <p>
                  <span>Request ID</span>
                  {request.id}
                </p>
                <p>
                  <span>Name</span>
                  {request.name}
                </p>

                <p>
                  <span>Username</span>
                  {request.username}
                </p>
                <p>
                  <span>Email</span> {request.email}
                </p>
                <p>
                  <span>Organization</span>
                  {request.organization}
                </p>
                <p>
                  <span>Location</span>
                  {request.location}
                </p>
                <p>
                  <span>Desired Role</span>
                  {request.desired_role}
                </p>
                <p>
                  <span>Reason</span>
                  {request.reason}
                </p>
                <p>
                  <span>Status</span>
                  {request.status}
                </p>
                {request.status === "null" && (
                  <div className="buttons">
                    <button
                      className="button-accept"
                      onClick={() => handleAccept(request.id)}
                    >
                      Accept
                      {/* <FontAwesomeIcon icon={faCheck} /> */}
                    </button>
                    <button
                      className="button-accept"
                      onClick={() => handleAcceptAsAdmin(request.id)}
                    >
                      Accept as Admin <FontAwesomeIcon icon={faUserGear} />
                    </button>
                    <button
                      className="button-reject"
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                      {/* <FontAwesomeIcon icon={faX} /> */}
                    </button>
                  </div>
                )}
                {request.status.includes("accepted") && (
                  <div className="buttons">
                    <button
                      className="button-reject"
                      onClick={() => handleReject(request.id)}
                    >
                      Remove
                    </button>
                  </div>
                )}
                {request.status === "rejected" && (
                  <div className="buttons">
                    <button
                      className="button-accept"
                      onClick={() => handleAccept(request.id)}
                    >
                      Change to accept
                      {/* <FontAwesomeIcon icon={faCheck} /> */}
                    </button>
                    <button
                      className="button-accept"
                      onClick={() => handleAcceptAsAdmin(request.id)}
                    >
                      Change to accept as admin{" "}
                      <FontAwesomeIcon icon={faUserGear} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {pageViewMode && pageViewMode === "Manage Requisitions" && (
        <div className="container">
          <ul className="nav">
            <li
              className={viewMode === "manageUsers" ? "active" : ""}
              onClick={() => setViewMode("manageUsers")}
            >
              All <FontAwesomeIcon icon={faList} />
            </li>
            <li
              className={viewMode === "viewRequests" ? "active" : ""}
              onClick={() => setViewMode("viewRequests")}
            >
              Pending
              <FontAwesomeIcon icon={faTableList} />
            </li>
            <li
              className={viewMode === "viewApprovedRequests" ? "active" : ""}
              onClick={() => setViewMode("viewApprovedRequests")}
            >
              Ready for PO generation
              <FontAwesomeIcon icon={faReceipt} />
            </li>
          </ul>
          <ul className="userCards">
            {purchaseRequisitions.map((requisition) => (
              <li
                key={requisition.id}
                className={`userCard ${
                  removing === requisition.id ? "fade-out" : ""
                }`}
              >
                <p>
                  <span>Request ID</span>
                  {requisition.requisition_id}
                </p>
                <p>
                  <span>Name</span>
                  {requisition.name}
                </p>
                <p>
                  <span>Username</span>
                  {requisition.username}
                </p>
                <p>
                  <span>Email</span>
                  {requisition.email}
                </p>
                {/* <p>
                  <span>Item</span>
                  {requisition.item}
                </p> */}
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Quantity</th>
                      <th>Estimated Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requisition.items &&
                      requisition.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{item.cost}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                {requisition.status === "approved" && (
                  <p>
                    <span>Selected vendor</span>
                    {requisition.selected_vendor}
                  </p>
                )}
                <p>
                  <span>Status</span>
                  {requisition.status}
                </p>
                {requisition.status === "null" && (
                  <div className="buttons">
                    <button className="button-accept">
                      Accept <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button className="button-accept">
                      Accept as Admin <FontAwesomeIcon icon={faUserGear} />
                    </button>
                    <button className="button-reject">Reject</button>
                  </div>
                )}
                {requisition.status.includes("approved") && (
                  <div className="buttons">
                    <button
                      className="button-accept"
                      onClick={() => handleGeneratePOClick(requisition)}
                    >
                      Generate PO receipt
                    </button>
                    <button className="button-accept">Change Vendor</button>
                    <button className="button-reject">Remove</button>
                  </div>
                )}
                {requisition.status === "pending" && (
                  <div className="buttons">
                    <button className="button-accept">Approve</button>
                    <button className="button-reject">Reject</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedRequisition && (
        <GeneratePO
          requisition={selectedRequisition}
          onClose={handleCloseModal}
        />
      )}
      <ToastContainer className="toast-container" position="bottom-right" />
    </div>
  );
}

export default AdminDashboard;
