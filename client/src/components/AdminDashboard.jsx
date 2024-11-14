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
  faObjectGroup,
  faSquareCheck,
  faSitemap,
  faChartSimple,
  faDownload,
  faArrowDown,
  faCircleCheck,
  faPencil,
  faFileDownload,
  faEye,
  faInfoCircle,
  faExclamationCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GeneratePO from "./GeneratePO";
import nshmLogo from "../assets/nshm-logo.png";
import AddRequisition from "./AddRequisition";
import ItemsTable from "./ItemsTable";
import StatusPieChart from "./StatusPieChart";
import ProfileNavbar from "./ProfileNavbar";
import html2pdf from "html2pdf.js";
import * as XLSX from "xlsx";

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState([]);
  const { currentUser, showItemsTable, setShowItemsTable } =
    useContext(AuthContext);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState("allRequisitions"); // "manageUsers" or "viewRequests"
  const [pageViewMode, setPageViewMode] = useState("Manage Requisitions");
  const [removing, setRemoving] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [searchRequisitions, setSearchRequisitions] = useState("");
  const [filteredRequisitions, setFilteredRequisitions] = useState([]);
  const [requisitionsModalOpen, setRequisitionsModalOpen] = useState(false);
  const [showItems, setShowItems] = useState({});
  const [requisitionPropsData, setRequisitionPropsData] = useState(null);
  const [showingRequisition, setShowingRequisition] = useState([]);
  const [requisitionInactiveTooLong, setRequisitionInactiveTooLong] =
    useState(false);
  const [actionIndication, setActionIndication] = useState("");
  const [requisitionPropsOperationType, setRequisitionPropsOperationType] =
    useState("");
  const navigate = useNavigate();

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
  const handleShowItems = (requisitionId) => {
    setShowItems((prevState) => ({
      ...prevState,
      [requisitionId]: !prevState[requisitionId],
    }));
  };

  const handleGeneratePOClick = (requisition) => {
    setSelectedRequisition(requisition);
  };

  const openAddRequisitionsModal = () => {
    setRequisitionsModalOpen(true);
  };

  const handleEditItems = (requisition) => {
    setRequisitionPropsData(requisition);
    setRequisitionPropsOperationType("edit");

    openAddRequisitionsModal();
  };

  const handleAddNewRequisition = () => {
    setRequisitionPropsData(null);
    setRequisitionPropsOperationType("new requisition");
    openAddRequisitionsModal();
  };

  const handleCloseModal = () => {
    setSelectedRequisition(null);
    setRequisitionsModalOpen(false);
    fetchPurchaseRequisitions();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("token again:", token);
        if (!token) {
          throw new Error("No token stored");
        }
        toast.success(`Welcome back, ${currentUser.name}`);

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
  const handleRemoveRequisition = (id, status, message) => {
    setRemoving(id);
    setTimeout(async () => {
      try {
        await axios.put(`http://localhost:3001/admin/requisitions/${id}`, {
          status,
        });
        setPurchaseRequisitions((prevRequisitions) =>
          prevRequisitions.map((requisition) =>
            requisition.requisition_id === id
              ? { ...requisition, status }
              : requisition
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
  const handleRequisitionApprove = (id) => {
    handleRemoveRequisition(id, "approved", "Requisition approved");
  };
  const handleRequisitionPending = (id) => {
    handleRemoveRequisition(
      id,
      "pending",
      "Requisition status updated to 'pending'"
    );
  };
  const handleMarkRequisitionAsClose = (id) => {
    handleRemoveRequisition(
      id,
      "closed",
      "Requisition status updated to 'closed'"
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
  const handleRejectRequisition = (id) => {
    handleRemoveRequisition(id, "rejected", "Requisition rejected");
  };

  const flattenObject = (data) => {
    const flattened = [];
    data.forEach((requisition) => {
      requisition.items.forEach((item) => {
        flattened.push({
          requisition_id:
            requisition.created_at.split("T")[0].replace(/[^a-zA-Z0-9]/g, "") +
            requisition.requisition_id,
          requisition_created_at: new Date(
            requisition.created_at
          ).toLocaleString(),
          requisition_required_by:
            requisition.required_by &&
            new Date(requisition.required_by).toLocaleDateString(),
          requisition_required_on:
            requisition.required_on &&
            new Date(requisition.required_on).toLocaleDateString(),
          department: requisition.department,
          created_by_name: requisition.name,
          created_by_username: requisition.username,
          created_by_email: requisition.email,
          selected_vendor: requisition.selected_vendor,
          requisition_status: requisition.status,
          item_name: item.name,
          item_category: item.category,
          item_specifications: item.specification,
          item_qty: item.quantity,
          item_estd_cost: item.cost,
        });
      });
    });
    return flattened;
  };
  const exportToExcel = (data, fileName = "PurchaseRequisitions.xlsx") => {
    const flattened_purchase_requisitions = flattenObject(data);
    const worksheet = XLSX.utils.json_to_sheet(flattened_purchase_requisitions);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseRequisitions");

    XLSX.writeFile(workbook, fileName);
  };
  const handleDownloadReports = () => {
    exportToExcel(filteredRequisitions);
  };

  const checkDeadline = (requisition) => {
    // const isDeadlineNear =
    //   Math.round(
    //     (new Date(requisition.required_by) - new Date()) / (1000 * 60 * 60)
    //   ) <= 72;
    // const isDeadlinePast =
    //   Math.round(
    //     (new Date(requisition.required_by) - new Date()) / (1000 * 60 * 60)
    //   ) < 0;

    if (
      Math.round(
        (new Date(requisition.required_by) - new Date()) / (1000 * 60 * 60)
      ) <= 72
    ) {
      setActionIndication("nearDeadline");
    }
    if (
      Math.round(
        (new Date(requisition.required_by) - new Date()) / (1000 * 60 * 60)
      ) < 0
    ) {
      setActionIndication("pastDeadline");
    }
    if (
      Math.round((new Date() - requisition.required_by) / (1000 * 60 * 60)) >=
      24
    ) {
      setRequisitionInactiveTooLong(true);
    }
  };

  const getActionIndicatorColor = (requisition) => {
    const currentTime = new Date();
    const requiredBy = new Date(requisition.required_by);
    const hoursDifference = (requiredBy - currentTime) / (1000 * 60 * 60);

    if (hoursDifference < 0 && requisition.status !== "closed") return "red";
    if (hoursDifference <= 72 && requisition.status !== "closed")
      return "yellow";
    if (
      Math.round(
        (currentTime - new Date(requisition.created_at)) / (1000 * 60 * 60)
      ) > 24 &&
      ["null", "pending", "rejected"].includes(requisition.status)
    ) {
      return "green"; // Pending action for over 24 hours
    }
    return null; // No action indicator needed
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const filteredRequests =
    viewMode === "manageUsers"
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
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        requisition.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        requisition.department
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        requisition.email
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        requisition.username
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        requisition.status
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        requisition.selected_vendor
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );

    setFilteredRequisitions(filtered);
    console.log(filteredRequisitions.length > 0);
    setViewMode("search");
  };

  // Logic to filter requisitions based on viewMode
  useEffect(() => {
    let filtered = [];

    if (viewMode === "pendingRequisitions") {
      filtered = purchaseRequisitions.filter((requisition) =>
        requisition.status.includes("pending")
      );
    } else if (viewMode === "approvedRequisitions") {
      filtered = purchaseRequisitions.filter((requisition) =>
        requisition.status.includes("approved")
      );
    } else if (viewMode === "rejectedRequisitions") {
      filtered = purchaseRequisitions.filter((requisition) =>
        requisition.status.includes("rejected")
      );
    } else if (viewMode === "allRequisitions") {
      filtered = purchaseRequisitions;
    }

    // sorting such that latest requisitions are on top

    filtered.sort((a, b) => b.requisition_id - a.requisition_id);
    setFilteredRequisitions(filtered);
  }, [viewMode, purchaseRequisitions]);

  if (!currentUser) {
    return <Navigate to="/admin/login" />;
  }

  return (
    <div className="admin-dashboard">
      <nav className="dashboard--navbar">
        {/* <img src={nshmLogo} alt="" width="50px" className="nshmLogo" /> */}
        <div className="title--admin-panel">
          <h1 id="organization-name">NSHM Kolkata</h1>
          <span id="system-title">Purchase Order Portal</span>
          <div className="linebreak"></div>
          <p>Admin Panel</p>
          <p className="role">Your role : admin</p>
        </div>
        <div className="linebreak"></div>
        <div className="inner-nav nav">
          <div
            className={`manage-users ${
              pageViewMode === "Manage Users" ? "active" : ""
            }`}
            onClick={() => {
              setPageViewMode("Manage Users");
              setViewMode("manageUsers");
            }}
          >
            <FontAwesomeIcon icon={faUserGear} />
            Manage Users
          </div>
          <div
            className={`manage-requisitions ${
              pageViewMode === "Manage Requisitions" ? "active" : ""
            }`}
            onClick={() => {
              setPageViewMode("Manage Requisitions");
              setViewMode("allRequisitions");
            }}
          >
            <FontAwesomeIcon icon={faList} />
            Manage Requisitions
          </div>
          {/* <div
            className={`manage-categories ${
              pageViewMode === "Manage Categories" ? "active" : ""
            }`}
            onClick={() => {
              setPageViewMode("Manage Categories");
              setViewMode("allCategories");
            }}
          >
            <FontAwesomeIcon icon={faSitemap} />
            Manage Categories
          </div> */}
          <div
            className={`view-detailed-dashboard ${
              pageViewMode === "Detailed Dashboard" ? "active" : ""
            }`}
            onClick={() => setPageViewMode("Detailed Dashboard")}
          >
            <FontAwesomeIcon icon={faChartSimple} />
            Analytics
          </div>
          <div className="button-log-out" onClick={handleLogOut}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            Log Out
          </div>
        </div>
        <div className="linebreak"></div>
        <div className="nav-options nav">
          {/* Todo : Change to reusable component - NavSection.jsx; Start of component -> */}
          {pageViewMode && pageViewMode === "Manage Users" && (
            <>
              <div
                className={viewMode === "manageUsers" ? "active" : ""}
                onClick={() => setViewMode("manageUsers")}
              >
                <FontAwesomeIcon icon={faUserFriends} /> Active Users
              </div>
              <div
                className={viewMode === "viewRequests" ? "active" : ""}
                onClick={() => setViewMode("viewRequests")}
              >
                <FontAwesomeIcon icon={faSliders} />
                Pending Requests
              </div>
            </>
          )}
          {pageViewMode && pageViewMode === "Manage Requisitions" && (
            <>
              <div
                className={viewMode === "allRequisitions" ? "active" : ""}
                onClick={() => setViewMode("allRequisitions")}
              >
                <FontAwesomeIcon icon={faList} />
                All
                <span className="metric">{filteredRequisitions.length}</span>
              </div>
              <div
                className={viewMode === "pendingRequisitions" ? "active" : ""}
                onClick={() => setViewMode("pendingRequisitions")}
              >
                <FontAwesomeIcon icon={faTableList} />
                Pending
                <span className="metric">{filteredRequisitions.length}</span>
              </div>
              <div
                className={viewMode === "rejectedRequisitions" ? "active" : ""}
                onClick={() => setViewMode("rejectedRequisitions")}
              >
                <FontAwesomeIcon icon={faX} />
                Rejected
                <span className="metric">{filteredRequisitions.length}</span>
              </div>
              <div
                className={viewMode === "approvedRequisitions" ? "active" : ""}
                onClick={() => setViewMode("approvedRequisitions")}
              >
                <FontAwesomeIcon icon={faListCheck} />
                Ready for PO generation
                <span className="metric">{filteredRequisitions.length}</span>
              </div>
            </>
          )}
        </div>
        {/* <FontAwesomeIcon icon={faBars} className="hamburg" /> */}
      </nav>
      {pageViewMode && pageViewMode === "Manage Users" && (
        <div className="container">
          <ProfileNavbar />

          <h1 className="section-title">Users</h1>
          <div className="quick-analytics">
            <StatusPieChart
              className="quick-analytics--pie"
              userRequests={requests}
            />
            <div className="analytics-container quick-analytics--drafted-requisitions">
              <div className="quick-analytics--title">Active Users</div>
              <div className="quick-analytics--metric-value">
                {
                  requests.filter((req) => req.status.includes("accepted"))
                    .length
                }
              </div>
            </div>

            <div className="analytics-container quick-analytics--pending-requisitions">
              <div className="quick-analytics--title">Pending</div>
              <div className="quick-analytics--metric-value">
                {requests.filter((req) => req.status === "rejected").length}
              </div>
            </div>
            <div className="analytics-container quick-analytics--accepted-requisitions">
              <div className="quick-analytics--title">Admins</div>
              <div className="quick-analytics--metric-value">
                {
                  requests.filter((req) => req.status === "accepted as admin")
                    .length
                }
              </div>
            </div>

            <div className="analytics-container quick-analytics--created-requisitions">
              <div className="quick-analytics--title">General Users</div>
              <div className="quick-analytics--metric-value">
                {requests.filter((req) => req.status === "accepted").length}
              </div>
            </div>
          </div>
          <div className="search-container">
            <label htmlFor="search-field" id="search-field-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                name="search"
                id="search-field"
                placeholder="Search User"
              />
            </label>
          </div>
          {filteredRequests.length > 0 && (
            <div className="table-container">
              <table className="userTable">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Organization</th>
                    <th>Location</th>
                    <th>Desired Role</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className={removing === request.id ? "fade-out" : ""}
                    >
                      <td>{request.id}</td>
                      <td>{request.name}</td>
                      <td>{request.username}</td>
                      <td>{request.email}</td>
                      <td>{request.organization}</td>
                      <td>{request.location}</td>
                      <td>{request.desired_role}</td>
                      <td>{request.reason}</td>
                      <td>{request.status}</td>
                      <td>
                        {request.status === "null" && (
                          <div className="buttons">
                            <button
                              className="button-accept"
                              onClick={() => handleAccept(request.id)}
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="icon"
                              />
                              Accept
                            </button>
                            <button
                              className="button-accept"
                              onClick={() => handleAcceptAsAdmin(request.id)}
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="icon"
                              />
                              Accept as Admin{" "}
                              <FontAwesomeIcon icon={faUserGear} />
                            </button>
                            <button
                              className="button-reject"
                              onClick={() => handleReject(request.id)}
                            >
                              Reject
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
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="icon"
                              />
                              Change to accept
                            </button>
                            <button
                              className="button-accept"
                              onClick={() => handleAcceptAsAdmin(request.id)}
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="icon"
                              />
                              Change to accept as admin{" "}
                              <FontAwesomeIcon icon={faUserGear} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {pageViewMode && pageViewMode === "Detailed Dashboard" && (
        <div className="container">
          <ProfileNavbar />
          {/* User Analytics */}
          <h1 className="section-title">Analytics</h1>
          <h2 className="section-title">Users</h2>

          <div className="quick-analytics">
            <StatusPieChart
              className="quick-analytics--pie"
              userRequests={requests}
            />
            <div className="analytics-container quick-analytics--drafted-requisitions">
              <div className="quick-analytics--title">Active Users</div>
              <div className="quick-analytics--metric-value">
                {
                  requests.filter((req) => req.status.includes("accepted"))
                    .length
                }
              </div>
            </div>

            <div className="analytics-container quick-analytics--pending-requisitions">
              <div className="quick-analytics--title">Pending</div>
              <div className="quick-analytics--metric-value">
                {requests.filter((req) => req.status === "rejected").length}
              </div>
            </div>
            <div className="analytics-container quick-analytics--accepted-requisitions">
              <div className="quick-analytics--title">Admins</div>
              <div className="quick-analytics--metric-value">
                {
                  requests.filter((req) => req.status === "accepted as admin")
                    .length
                }
              </div>
            </div>

            <div className="analytics-container quick-analytics--created-requisitions">
              <div className="quick-analytics--title">General Users</div>
              <div className="quick-analytics--metric-value">
                {requests.filter((req) => req.status === "accepted").length}
              </div>
            </div>
          </div>
          {/* Requisition Analytics */}
          <h2 className="section-title">Requisitions</h2>

          <div className="quick-analytics">
            <StatusPieChart
              className="quick-analytics--pie"
              purchaseRequisitions={purchaseRequisitions}
            />
            <div className="analytics-container quick-analytics--drafted-requisitions">
              <div className="quick-analytics--title">
                Ready for PO Generation
              </div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter(
                    (req) => req.status === "approved"
                  ).length
                }
              </div>
            </div>
            <div className="analytics-container quick-analytics--all-requisitions">
              <div className="quick-analytics--title">All</div>
              <div className="quick-analytics--metric-value">
                {purchaseRequisitions.length}
              </div>
            </div>
            <div className="analytics-container quick-analytics--pending-requisitions">
              <div className="quick-analytics--title">Pending</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter((req) => req.status === "pending")
                    .length
                }
              </div>
            </div>
            <div className="analytics-container quick-analytics--accepted-requisitions">
              <div className="quick-analytics--title">Accepted</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter(
                    (req) => req.status === "approved"
                  ).length
                }
              </div>
            </div>

            <div className="analytics-container quick-analytics--created-requisitions">
              <div className="quick-analytics--title">Created</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter(
                    (req) => req.status === "approved"
                  ).length
                }
              </div>
            </div>
            <div className="analytics-container quick-analytics--rejected-requisitions">
              <div className="quick-analytics--title">Rejected</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter(
                    (req) => req.status === "rejected"
                  ).length
                }
              </div>
            </div>
            <div className="analytics-container quick-analytics--closed-requisitions">
              <div className="quick-analytics--title">Closed</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter((req) => req.status === "closed")
                    .length
                }
              </div>
            </div>
            <div className="analytics-container quick-analytics--completed-requisitions">
              <div className="quick-analytics--title">Completed</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter(
                    (req) => req.status === "complete"
                  ).length
                }
              </div>
            </div>
          </div>
        </div>
      )}
      {pageViewMode && pageViewMode === "Manage Categories" && (
        <div className="container">
          <ProfileNavbar />
        </div>
      )}
      {pageViewMode && pageViewMode === "Manage Requisitions" && (
        <div className="container">
          <ProfileNavbar />
          <h1 className="section-title">Requisitions</h1>
          <div className="quick-analytics">
            <StatusPieChart
              className="quick-analytics--pie"
              purchaseRequisitions={purchaseRequisitions}
            />
            <div className="analytics-container quick-analytics--drafted-requisitions">
              <div className="quick-analytics--title">
                Ready for PO Generation
              </div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter(
                    (req) => req.status === "approved"
                  ).length
                }
              </div>
            </div>
            <div className="analytics-container quick-analytics--all-requisitions">
              <div className="quick-analytics--title">All</div>
              <div className="quick-analytics--metric-value">
                {purchaseRequisitions.length}
              </div>
            </div>
            <div className="analytics-container quick-analytics--pending-requisitions">
              <div className="quick-analytics--title">Pending</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter((req) => req.status === "pending")
                    .length
                }
              </div>
            </div>
            <div className="analytics-container quick-analytics--accepted-requisitions">
              <div className="quick-analytics--title">Accepted</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter(
                    (req) => req.status === "approved"
                  ).length
                }
              </div>
            </div>

            <div className="analytics-container quick-analytics--created-requisitions">
              <div className="quick-analytics--title">Created</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter(
                    (req) => req.status === "approved"
                  ).length
                }
              </div>
            </div>
            <div className="analytics-container quick-analytics--rejected-requisitions">
              <div className="quick-analytics--title">Rejected</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter(
                    (req) => req.status === "rejected"
                  ).length
                }
              </div>
            </div>
            <div className="analytics-container quick-analytics--closed-requisitions">
              <div className="quick-analytics--title">Closed</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter((req) => req.status === "closed")
                    .length
                }
              </div>
            </div>
            <div className="analytics-container quick-analytics--completed-requisitions">
              <div className="quick-analytics--title">Completed</div>
              <div className="quick-analytics--metric-value">
                {
                  purchaseRequisitions.filter(
                    (req) => req.status === "complete"
                  ).length
                }
              </div>
            </div>
          </div>
          <div className="search-container">
            <label htmlFor="search-field" id="search-field-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                name="search"
                id="search-field"
                value={searchRequisitions}
                onChange={handleSearchRequisitions}
                placeholder="Search Requisitions"
              />
            </label>
            <div className="buttons">
              <div
                className="btn--download-reports"
                onClick={handleDownloadReports}
              >
                Reports
                <FontAwesomeIcon icon={faArrowDown} />
              </div>
              <div
                className="btn--add-new add-new-requisition"
                onClick={handleAddNewRequisition}
              >
                <FontAwesomeIcon icon={faPlus} className="fa-icon plus-icon" />
                New
              </div>
            </div>
          </div>

          <div className="table-container">
            {!filteredRequisitions.length && (
              <p className="no-results">
                {viewMode === "search" &&
                  `No results found for "${searchRequisitions}"`}
                {viewMode === "allRequisitions" && `No requisitions found`}
                {viewMode === "pendingRequisitions" &&
                  `No pending requisitions found`}
                {viewMode === "rejectedRequisitions" &&
                  `No rejected requisitions found`}
                {viewMode === "approvedRequisitions" &&
                  `No approved requisitions found`}
              </p>
            )}
            {filteredRequisitions.length > 0 && (
              <table className="requisitions-table">
                <thead>
                  <tr>
                    <th>Requisition ID</th>
                    <th>Created At</th>
                    <th>Required By</th>
                    <th>Required On</th>
                    <th>Department</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Items</th>
                    <th>Selected Vendor</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequisitions.map((requisition) => (
                    <tr
                      key={requisition.requisition_id}
                      className={
                        removing === requisition.requisition_id
                          ? "fade-out"
                          : ""
                      }
                    >
                      {/* Requisition ID with Action Indicator */}
                      <td className="requisition-id-container">
                        {getActionIndicatorColor(requisition) && (
                          <div className="action-indicator">
                            {" "}
                            <FontAwesomeIcon
                              icon={faClock}
                              className={`action-indicator-icon ${getActionIndicatorColor(
                                requisition
                              )}`}
                            />
                          </div>
                        )}
                        {/* Requisition ID */}
                        {requisition.created_at
                          .split("T")[0]
                          .replace(/[^a-zA-Z0-9]/g, "") +
                          requisition.requisition_id}
                      </td>
                      {/* Requisition Created At  */}
                      <td>
                        {new Date(requisition.created_at).toLocaleString()}
                      </td>
                      {/* Requisition Required By */}
                      <td>
                        {requisition.required_by &&
                          new Date(
                            requisition.required_by
                          ).toLocaleDateString()}
                      </td>
                      {/* Requisition Required On */}
                      <td>
                        {requisition.required_on &&
                          new Date(
                            requisition.required_on
                          ).toLocaleDateString()}
                      </td>
                      <td>{requisition.department}</td>
                      <td>{requisition.name}</td>
                      <td>{requisition.username}</td>
                      <td>{requisition.email}</td>
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
                      <td>
                        {requisition.status === "null" && (
                          <div className="buttons">
                            <button className="button-accept">
                              Accept <FontAwesomeIcon icon={faCheck} />
                            </button>
                            <button className="button-accept">
                              Accept as Admin{" "}
                              <FontAwesomeIcon icon={faUserGear} />
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
                              <FontAwesomeIcon
                                icon={faFileDownload}
                                className="icon"
                              />
                              Generate PO receipt
                            </button>
                            <button
                              className="button-accept"
                              onClick={() => handleEditItems(requisition)}
                            >
                              <FontAwesomeIcon
                                icon={faPencil}
                                className="icon"
                              />
                              Edit
                            </button>
                            <button
                              className="button-accept"
                              onClick={() =>
                                handleMarkRequisitionAsClose(
                                  requisition.requisition_id
                                )
                              }
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="icon"
                              />
                              Mark as Complete
                            </button>
                            <button
                              className="button-reject"
                              onClick={() =>
                                handleRejectRequisition(
                                  requisition.requisition_id
                                )
                              }
                            >
                              Change to Reject
                            </button>

                            <button
                              className="button-reject"
                              onClick={() =>
                                handleMarkRequisitionAsClose(
                                  requisition.requisition_id
                                )
                              }
                            >
                              Mark as Closed
                            </button>
                          </div>
                        )}
                        {requisition.status.includes("rejected") && (
                          <div className="buttons">
                            <button
                              className="button-accept"
                              onClick={() => handleEditItems(requisition)}
                            >
                              <FontAwesomeIcon
                                icon={faPencil}
                                className="icon"
                              />
                              Edit
                            </button>
                            <button
                              className="button-accept"
                              onClick={() =>
                                handleRequisitionApprove(
                                  requisition.requisition_id
                                )
                              }
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="icon"
                              />
                              Change to Accept
                            </button>
                            <button
                              className="button-accept"
                              onClick={() =>
                                handleRequisitionPending(
                                  requisition.requisition_id
                                )
                              }
                            >
                              Change to pending
                            </button>
                            <button
                              className="button-reject"
                              onClick={() =>
                                handleMarkRequisitionAsClose(
                                  requisition.requisition_id
                                )
                              }
                            >
                              Mark as closed
                            </button>
                          </div>
                        )}
                        {requisition.status === "pending" && (
                          <div className="buttons">
                            <button
                              className="button-accept"
                              onClick={() => handleEditItems(requisition)}
                            >
                              <FontAwesomeIcon
                                icon={faPencil}
                                className="icon"
                              />
                              Edit
                            </button>

                            <button
                              className="button-accept"
                              onClick={() =>
                                handleRequisitionApprove(
                                  requisition.requisition_id
                                )
                              }
                            >
                              <FontAwesomeIcon
                                icon={faCheck}
                                className="icon"
                              />
                              Approve
                            </button>
                            <button
                              className="button-reject"
                              onClick={() =>
                                handleRejectRequisition(
                                  requisition.requisition_id
                                )
                              }
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
      {showItemsTable && <ItemsTable requisition={showingRequisition} />}
      <ToastContainer className="toast-container" position="bottom-right" />
      {selectedRequisition && (
        <GeneratePO
          requisition={selectedRequisition}
          onClose={handleCloseModal}
        />
      )}
      {requisitionsModalOpen && (
        <AddRequisition
          onClose={handleCloseModal}
          operationType={requisitionPropsOperationType}
          requisitionPropsData={requisitionPropsData}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
