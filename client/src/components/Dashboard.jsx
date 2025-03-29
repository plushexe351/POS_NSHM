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
  faUser,
  faPager,
  faSearch,
  faDoorClosed,
  faArrowAltCircleLeft,
  faArrowRightFromBracket,
  faUserFriends,
  faPlus,
  faStar,
  faStarAndCrescent,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GeneratePO from "./GeneratePO";
import ItemsTable from "./ItemsTable";

import nshmLogo from "../assets/nshm-logo.png";
import AddRequisition from "./AddRequisition";
import StatusPieChart from "./StatusPieChart";
import { AnimatePresence } from "framer-motion";
import REACT_APP_API_BASE_URL from "../config";
// import "./App.scss"; // Import your CSS here

function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState([]);
  const { currentUser, showItemsTable, setShowItemsTable } =
    useContext(AuthContext);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState("allRequisitions"); // "manageUsers" or "viewRequests"
  const [pageViewMode, setPageViewMode] = useState("Requisitions");
  const [removing, setRemoving] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [searchRequisitions, setSearchRequisitions] = useState("");
  const [filteredRequisitions, setFilteredRequisitions] = useState([]);
  const [requisitionsModalOpen, setRequisitionsModalOpen] = useState(false);
  const [showItems, setShowItems] = useState({});
  const [showingRequisition, setShowingRequisition] = useState([]);

  const navigate = useNavigate();

  const fetchPurchaseRequisitions = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/admin/purchaseRequisitions`
      );
      setPurchaseRequisitions(response.data);
    } catch (error) {
      console.error("Error fetching Purchase Requisitions:", error);
      toast.error("Error fetching Purchase Requisitions");
    }
  };

  const handleGeneratePOClick = (requisition) => {
    setSelectedRequisition(requisition);
  };

  const handleCloseModal = () => {
    setSelectedRequisition(null);
    setRequisitionsModalOpen(false);
    fetchPurchaseRequisitions();
  };

  const openAddRequisitionsModal = () => {
    setRequisitionsModalOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        console.log("token again:", token);
        if (!token) {
          throw new Error("No token stored");
        }

        const response = await axios.get(
          `${REACT_APP_API_BASE_URL}/dashboard`,
          {
            headers: { Authorization: token },
          }
        );

        if (response.data.message === "success") {
          console.log("Logged in");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
    const fetchRequests = async () => {
      try {
        const response = await axios.get(
          `${REACT_APP_API_BASE_URL}/admin/requests`
        );
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Error fetching requests");
      }
    };
    fetchRequests();

    fetchPurchaseRequisitions();
  }, [currentUser]);

  const handleRemove = (id, status, message) => {
    setRemoving(id);
    setTimeout(async () => {
      try {
        await axios.put(`${REACT_APP_API_BASE_URL}/admin/requests/${id}`, {
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
    viewMode === "approvedRequisitions"
      ? requests.filter((request) => request.status.includes("accepted"))
      : requests.filter((request) => !request.status.includes("accepted"));

  const handleSearchRequisitions = (e) => {
    const searchTerm = e.target.value;
    setSearchRequisitions(searchTerm);

    const filtered = purchaseRequisitions.filter(
      (requisition) =>
        (
          requisition.created_at.split("T")[0].replace(/[^a-zA-Z0-9]/g, "") +
          requisition.requisition_id
        )
          .toString()
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        requisition.name
          .toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        requisition.username
          .toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        requisition.status
          .toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        requisition.selected_vendor
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase()) ||
        requisition.department
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase())
    );

    setFilteredRequisitions(filtered);
    console.log(filteredRequisitions.length > 0);
    setViewMode("search");
  };

  // Logic to filter requisitions based on viewMode
  useEffect(() => {
    let filtered = [];

    if (viewMode === "pendingRequisitions") {
      filtered = purchaseRequisitions.filter(
        (requisition) =>
          (requisition.status.includes("pending") ||
            requisition.status.includes("null")) &&
          requisition.name === currentUser.name
      );
    } else if (viewMode === "approvedRequisitions") {
      filtered = purchaseRequisitions.filter(
        (requisition) =>
          requisition.status.includes("approved") &&
          requisition.name === currentUser.name
      );
    } else if (viewMode === "allRequisitions") {
      filtered = purchaseRequisitions.filter(
        (requisition) => requisition.name === currentUser.name
      );
    }
    filtered.sort((a, b) => b.requisition_id - a.requisition_id);

    setFilteredRequisitions(filtered);
  }, [viewMode, purchaseRequisitions, currentUser?.name]);

  if (!currentUser || !currentUser.name) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="admin-dashboard">
      <nav className="dashboard--navbar">
        <div className="title--admin-panel">
          <h1 id="organization-name">NSHM Kolkata</h1>
          <span id="system-title">Purchase Order Portal</span>
          <div className="linebreak"></div>
          <p>Admin Panel</p>
          <p className="role">Your role : user</p>
        </div>
        <div className="linebreak"></div>
        <div className="inner-nav nav">
          <div
            className={`manage-users ${
              pageViewMode === "Requisitions" ? "active" : ""
            }`}
            onClick={() => {
              setPageViewMode("Requisitions");
              setViewMode("allRequisitions");
            }}
          >
            <FontAwesomeIcon icon={faUserGear} />
            Dashboard
          </div>

          {/* <div
            className={`view-detailed-dashboard ${
              pageViewMode === "dashboard" ? "active" : ""
            }`}
            onClick={() => setPageViewMode("dashboard")}
          >
            <FontAwesomeIcon icon={faPager} />
            Dashboard
          </div> */}
          <div className="button-log-out" onClick={handleLogOut}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            Log Out
          </div>
        </div>
        <div className="linebreak"></div>
        <div className="nav-options nav">
          {/* Todo : Change to reusable component - NavSection.jsx; Start of component -> */}
          {pageViewMode && pageViewMode === "Requisitions" && (
            <>
              <div
                className={viewMode === "allRequisitions" ? "active" : ""}
                onClick={() => setViewMode("allRequisitions")}
              >
                <FontAwesomeIcon icon={faList} />
                All
              </div>
              <div
                className={viewMode === "pendingRequisitions" ? "active" : ""}
                onClick={() => setViewMode("pendingRequisitions")}
              >
                <FontAwesomeIcon icon={faTableList} />
                Pending
              </div>
              <div
                className={viewMode === "approvedRequisitions" ? "active" : ""}
                onClick={() => setViewMode("approvedRequisitions")}
              >
                <FontAwesomeIcon icon={faListCheck} />
                Ready for PO generation
              </div>
            </>
          )}
        </div>
        {/* <FontAwesomeIcon icon={faBars} className="hamburg" /> */}
      </nav>
      {pageViewMode && pageViewMode === "dashboard" && (
        <div className="container">
          <div className="nav">Nothing here yet</div>
        </div>
      )}
      {pageViewMode && pageViewMode === "Requisitions" && (
        <div className="container">
          <div className="nav">
            <FontAwesomeIcon icon={faUser} id="profile-icon" />
            <p>{currentUser.name}</p>
          </div>
          <h1 className="section-title">Your Requisitions</h1>
          {purchaseRequisitions.length > 0 && (
            <div className="quick-analytics">
              <StatusPieChart
                className="quick-analytics--pie"
                purchaseRequisitions={purchaseRequisitions}
              />
              {/* <div className="analytics-container quick-analytics--untouched-requisitions">
              <div className="quick-analytics--title">Require Action</div>
              <div className="quick-analytics--metric-value">
                {deadlineCounts.red}
              </div>
            </div> */}
              <div className="analytics-container quick-analytics--drafted-requisitions">
                <div className="quick-analytics--title">
                  Ready for PO Generation
                </div>
                <div className="quick-analytics--metric-value">
                  {
                    filteredRequisitions.filter(
                      (req) => req.status === "approved"
                    ).length
                  }
                </div>
              </div>
              <div className="analytics-container quick-analytics--all-requisitions">
                <div className="quick-analytics--title">All</div>
                <div className="quick-analytics--metric-value">
                  {filteredRequisitions.length}
                </div>
              </div>
              <div className="analytics-container quick-analytics--pending-requisitions">
                <div className="quick-analytics--title">Pending</div>
                <div className="quick-analytics--metric-value">
                  {
                    filteredRequisitions.filter(
                      (req) => req.status === "pending"
                    ).length
                  }
                </div>
              </div>
              <div className="analytics-container quick-analytics--accepted-requisitions">
                <div className="quick-analytics--title">Accepted</div>
                <div className="quick-analytics--metric-value">
                  {
                    filteredRequisitions.filter(
                      (req) => req.status === "approved"
                    ).length
                  }
                </div>
              </div>

              <div className="analytics-container quick-analytics--created-requisitions">
                <div className="quick-analytics--title">Created</div>
                <div className="quick-analytics--metric-value">
                  {
                    filteredRequisitions.filter(
                      (req) => req.status === "approved"
                    ).length
                  }
                </div>
              </div>
              <div className="analytics-container quick-analytics--rejected-requisitions">
                <div className="quick-analytics--title">Rejected</div>
                <div className="quick-analytics--metric-value">
                  {
                    filteredRequisitions.filter(
                      (req) => req.status === "rejected"
                    ).length
                  }
                </div>
              </div>
              <div className="analytics-container quick-analytics--closed-requisitions">
                <div className="quick-analytics--title">Closed</div>
                <div className="quick-analytics--metric-value">
                  {
                    filteredRequisitions.filter(
                      (req) => req.status === "closed"
                    ).length
                  }
                </div>
              </div>
              <div className="analytics-container quick-analytics--completed-requisitions">
                <div className="quick-analytics--title">Completed</div>
                <div className="quick-analytics--metric-value">
                  {
                    filteredRequisitions.filter(
                      (req) => req.status === "complete"
                    ).length
                  }
                </div>
              </div>
            </div>
          )}

          <div className="search-container">
            <label htmlFor="search-field" id="search-field-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                name="search"
                id="search-field"
                placeholder="Search Requisition"
                value={searchRequisitions}
                onChange={handleSearchRequisitions}
              />
            </label>
            <div className="buttons">
              <div
                className="btn--add-new add-new-requisition"
                onClick={openAddRequisitionsModal}
              >
                <FontAwesomeIcon icon={faPlus} className="fa-icon plus-icon" />
                New
              </div>
            </div>
          </div>
          <div className="table-container">
            {!filteredRequisitions.length && (
              <p className="no-results">Nothing here yet</p>
            )}
            {filteredRequisitions.length > 0 && (
              <table className="requisitions-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Created At</th>
                    <th>Department</th>
                    <th>Items</th>
                    <th>Vendor</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.map((requisition) => (
                    <tr
                      key={requisition.id}
                      className={removing === requisition.id ? "fade-out" : ""}
                    >
                      {/* Requisition ID */}
                      <td>
                        {requisition.created_at
                          .split("T")[0]
                          .replace(/[^a-zA-Z0-9]/g, "") +
                          requisition.requisition_id}
                      </td>
                      {/* Requisition Created At */}
                      <td>
                        {new Date(requisition.created_at).toLocaleString()}
                      </td>
                      <td>
                        {requisition.department || "No Department Selected"}
                      </td>
                      {/* Show Items Toggle */}
                      <td>
                        <button
                          className="button-accept show-items"
                          onClick={() => {
                            setShowItems(!showItems);
                            setShowingRequisition(requisition);
                            setShowItemsTable(true);
                          }}
                        >
                          {" "}
                          <FontAwesomeIcon icon={faEye} /> Show Items
                        </button>
                      </td>
                      {requisition.selected_vendor &&
                      requisition.selected_vendor !== "NULL" ? (
                        <td>{requisition.selected_vendor}</td>
                      ) : (
                        <td>No vendor assigned</td>
                      )}
                      <td>{requisition.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {pageViewMode && pageViewMode === "Detailed Dashboard" && (
        <div className="container">
          <div className="nav">Nothing here yet</div>
        </div>
      )}
      <AnimatePresence>
        {showItemsTable && <ItemsTable requisition={showingRequisition} />}
      </AnimatePresence>
      <AnimatePresence>
        {requisitionsModalOpen && <AddRequisition onClose={handleCloseModal} />}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;
