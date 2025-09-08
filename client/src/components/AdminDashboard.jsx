import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faUserGear,
  faSliders,
  faX,
  faList,
  faListCheck,
  faTableList,
  faSearch,
  faArrowRightFromBracket,
  faUserFriends,
  faPlus,
  faChartSimple,
  faArrowDown,
  faPencil,
  faFileDownload,
  faEye,
  faClock,
  faTags,
  faLayerGroup,
  faTruck,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GeneratePO from "./GeneratePO";

import AddRequisition from "./AddRequisition";
import ItemsTable from "./ItemsTable";
import StatusPieChart from "./StatusPieChart";
import ProfileNavbar from "./ProfileNavbar";

import * as XLSX from "xlsx";
import AddDepartment from "./AddDepartment";
import AddCategory from "./AddCategory";
import AddVendor from "./AddVendor";
import RequisitionsCharts from "./RequisitionsCharts";

import { AnimatePresence } from "framer-motion";
import WritingTools from "./WritingTools";

import REACT_APP_API_BASE_URL from "../config";

function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [purchaseRequisitions, setPurchaseRequisitions] = useState([]);
  const [departments, setDepartments] = useState("");
  const [vendors, setVendors] = useState("");
  const [categories, setCategories] = useState("");
  const {
    currentUser,
    setCurrentUser,
    showItemsTable,
    setShowItemsTable,
    writingToolsMode,
    setWritingToolsMode,
    showNavbarInMobile,
    setShowNavbarInMobile,
  } = useContext(AuthContext);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useState("allRequisitions"); // "manageUsers" or "viewRequests"
  const [pageViewMode, setPageViewMode] = useState("Manage Requisitions");
  const [updating, setupdating] = useState(null);
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [searchRequisitions, setSearchRequisitions] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [searchDepartments, setSearchDepartments] = useState("");
  const [searchVendors, setSearchVendors] = useState("");
  const [searchCategories, setSearchCategories] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [filteredRequisitions, setFilteredRequisitions] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [requisitionsModalOpen, setRequisitionsModalOpen] = useState(false);
  const [vendorsModalOpen, setVendorsModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [departmentsModalOpen, setDepartmentsModalOpen] = useState(false);
  const [showItems, setShowItems] = useState({});
  const [requisitionPropsData, setRequisitionPropsData] = useState(null);
  const [showingRequisition, setShowingRequisition] = useState([]);

  const [requisitionPropsOperationType, setRequisitionPropsOperationType] =
    useState("");
  const [deadlineCounts, setDeadlineCounts] = useState({
    red: 0,
    yellow: 0,
    green: 0,
  });
  const navigate = useNavigate();

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
    setDepartmentsModalOpen(false);
    setCategoriesModalOpen(false);
    setVendorsModalOpen(false);
    fetchVendors();
    fetchCategories();
    fetchPurchaseRequisitions();
    fetchDepartments();
  };

  const fetchPurchaseRequisitions = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/admin/purchaseRequisitions`,
        {
          headers: { Authorization: sessionStorage.getItem("token") },
        }
      );
      setPurchaseRequisitions(response.data);
    } catch (error) {
      console.error("Error fetching Purchase Requisitions:", error);
      if (currentUser) toast.error("Error fetching Purchase Requisitions");
    }
  };
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/admin/departments`,
        {
          headers: { Authorization: sessionStorage.getItem("token") },
        }
      );
      setDepartments(response.data);
      setFilteredDepartments(response.data);
    } catch (error) {
      console.error("Error fetching Departments:", error);
      toast.error("Error fetching Departments");
    }
  };
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/admin/itemCategories`,
        {
          headers: { Authorization: sessionStorage.getItem("token") },
        }
      );
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error) {
      console.error("Error fetching Categories:", error);
      toast.error("Error fetching Categories");
    }
  };
  const fetchVendors = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/admin/vendors`,
        {
          headers: { Authorization: sessionStorage.getItem("token") },
        }
      );
      setVendors(response.data);
      setFilteredVendors(response.data);
    } catch (error) {
      console.error("Error fetching Vendors:", error);
      toast.error("Error fetching Vendors");
    }
  };

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("No token or user stored");
      }

      const response = await axios.get(`${REACT_APP_API_BASE_URL}/dashboard`, {
        headers: { Authorization: token },
      });

      if (response.data.message === "success") {
        console.log("Logged in");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await axios.get(
        `${REACT_APP_API_BASE_URL}/admin/requests`,
        {
          headers: { Authorization: sessionStorage.getItem("token") },
        }
      );
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      if (currentUser) toast.error("Error fetching requests");
    }
  };

  useEffect(() => {
    const fetchDataAndOtherRequests = async () => {
      await fetchData();
      await fetchRequests();
      await fetchVendors();
      await fetchCategories();
      await fetchDepartments();
      await fetchPurchaseRequisitions();
    };
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      console.log(JSON.parse(storedUser));
      fetchDataAndOtherRequests();
    } else {
      navigate("/admin/login"); // Redirect if no user is stored
    }
  }, []);

  const handleUpdate = (id, status, message) => {
    setupdating(id);
    setTimeout(async () => {
      try {
        await axios.put(
          `${REACT_APP_API_BASE_URL}/admin/requests/${id}`,
          {
            status,
          },
          {
            headers: { Authorization: sessionStorage.getItem("token") },
          }
        );
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
        setupdating(null);
        setSearchUsers("");
      }
    }, 500);
  };
  const handleUpdateRequisition = (id, status, message) => {
    setupdating(id);
    setTimeout(async () => {
      try {
        await axios.put(
          `${REACT_APP_API_BASE_URL}/admin/requisitions/${id}`,
          {
            status,
          },
          {
            headers: { Authorization: sessionStorage.getItem("token") },
          }
        );
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
        setupdating(null);
        setViewMode("allRequisitions");
        setSearchRequisitions("");
      }
    }, 500);
  };

  const handleAccept = (id) => {
    handleUpdate(
      id,
      "accepted",
      "Request accepted and granted general user role"
    );
  };
  const handleRequisitionApprove = (id) => {
    handleUpdateRequisition(id, "approved", "Requisition approved");
  };
  const handleRequisitionPending = (id) => {
    handleUpdateRequisition(
      id,
      "pending",
      "Requisition status updated to 'pending'"
    );
  };
  const handleMarkRequisitionAsClose = (id) => {
    handleUpdateRequisition(
      id,
      "closed",
      "Requisition status updated to 'closed'"
    );
  };
  const handleMarkRequisitionAsComplete = (id) => {
    handleUpdateRequisition(
      id,
      "complete",
      "Requisition status updated to 'complete'"
    );
  };

  const handleAcceptAsAdmin = (id) => {
    handleUpdate(
      id,
      "accepted as admin",
      "Request accepted and granted admin role"
    );
  };

  const handleReject = (id) => {
    handleUpdate(id, "rejected", "User request rejected");
  };
  const handleRejectRequisition = (id) => {
    handleUpdateRequisition(id, "rejected", "Requisition rejected");
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
  const exportToExcel = (
    data,
    fileName = "PurchaseRequisitions.xlsx",
    shouldFlatten
  ) => {
    const processed_data = shouldFlatten ? flattenObject(data) : data;
    const worksheet = XLSX.utils.json_to_sheet(processed_data);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseRequisitions");

    XLSX.writeFile(workbook, fileName);
  };
  const handleDownloadRequisitionReports = () => {
    exportToExcel(
      filteredRequisitions,
      "POS_NSHM_PurchaseRequisitions.xlsx",
      true
    );
  };

  const handleDownloadUserReports = () => {
    exportToExcel(filteredRequests, "POS_NSHM_Users.xlsx", false);
  };

  const getActionIndicatorColor = (requisition) => {
    const currentTime = new Date();
    const requiredOn = new Date(requisition.required_on);
    const hoursDifference = (requiredOn - currentTime) / (1000 * 60 * 60);

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

  const countColors = () => {
    const counts = { red: 0, yellow: 0, green: 0 };
    purchaseRequisitions.forEach((requisition) => {
      const color = getActionIndicatorColor(requisition);
      if (color) {
        counts[color] += 1;
      }
    });
    setDeadlineCounts(counts);
  };

  useEffect(() => {
    countColors();
  }, [purchaseRequisitions]);

  // Delete Department

  const handleDeleteDepartment = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `${REACT_APP_API_BASE_URL}/departments/${id}`,
        {
          headers: { Authorization: token },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        const updatedDepartments = departments.filter(
          (dept) => dept.dept_id !== id
        );
        setDepartments(updatedDepartments);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `${REACT_APP_API_BASE_URL}/categories/${id}`,
        {
          headers: { Authorization: token },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        const updatedCategories = categories.filter(
          (cat) => cat.category_id !== id
        );
        setCategories(updatedCategories);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };
  const handleDeleteVendor = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.delete(
        `${REACT_APP_API_BASE_URL}/vendors/${id}`,
        {
          headers: { Authorization: token },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);

        const updatedVendors = vendors.filter(
          (vendor) => vendor.vendor_id !== id
        );
        setVendors(updatedVendors);
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting vendor:", error);
      alert("Failed to delete vendor");
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/admin/login");
  };

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
    setViewMode("search");
  };

  const handleSearchDepartments = (e) => {
    const searchTerm = e.target.value;
    setSearchDepartments(searchTerm);

    const filtered = departments.filter(
      (dept) =>
        dept.dept_id
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        dept.dept_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        dept.description
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim())
    );

    setFilteredDepartments(filtered);
  };

  const handleSearchCategories = (e) => {
    const searchTerm = e.target.value;
    setSearchCategories(searchTerm);

    const filtered = categories.filter(
      (cat) =>
        cat.category_id
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        cat.category_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        cat.description
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim())
    );

    setFilteredCategories(filtered);
  };

  const handleSearchVendors = (e) => {
    const searchTerm = e.target.value;
    setSearchVendors(searchTerm);

    const filtered = vendors.filter(
      (vendor) =>
        vendor.vendor_id
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        vendor.vendor_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        vendor.requisition_id
          ?.toString()
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        vendor.vendor_contact_person
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        vendor.vendor_address?.includes(searchTerm.toLowerCase().trim()) ||
        vendor.vendor_contact?.toString().includes(searchTerm) ||
        vendor.vendor_email_id
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        vendor.vendor_GSTIN
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        vendor.vendor_VAT
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        vendor.vendor_TIN
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim())
    );

    setFilteredVendors(filtered);
  };

  const handleSearchUsers = (e) => {
    const searchTerm = e.target.value;
    setSearchUsers(searchTerm);

    const filtered = requests.filter(
      (request) =>
        request.id
          .toString()
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        request.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        request.username
          ?.toLowerCase()
          ?.includes(searchTerm.toLowerCase().trim()) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
        request.organization
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        request.location
          .toLowerCase()
          .includes(searchTerm.toLowerCase().trim()) ||
        request.desired_role
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        request.status?.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );

    setFilteredRequests(filtered);
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

  useEffect(() => {
    let filtered = [];

    if (viewMode === "manageUsers") {
      filtered = requests.filter((request) =>
        request.status.includes("accepted")
      );
    } else {
      filtered = requests.filter(
        (request) => !request.status.includes("accepted")
      );
    }

    // sorting such that latest requisitions are on top

    filtered.sort((a, b) => b.id - a.id);
    setFilteredRequests(filtered);
  }, [viewMode, requests]);

  // if (!currentUser) {
  //   return <Navigate to="/admin/login" />;
  // }

  return (
    <div className="admin-dashboard" onClick={() => setWritingToolsMode(false)}>
      <nav
        className={`dashboard--navbar ${showNavbarInMobile ? "show" : ""}`}
        onClick={() => setShowNavbarInMobile(false)}
      >
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
            Users
            <span className="metric">
              {
                requests.filter((request) =>
                  request.status.includes("accepted")
                ).length
              }
            </span>
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
            Requisitions
            <span className="metric">{purchaseRequisitions.length}</span>
          </div>
          <div
            className={`manage-requisitions ${
              pageViewMode === "Manage Departments" ? "active" : ""
            }`}
            onClick={() => {
              setPageViewMode("Manage Departments");
              setViewMode("");
            }}
          >
            <FontAwesomeIcon icon={faLayerGroup} />
            Departments
            <span className="metric">{departments.length}</span>
          </div>
          <div
            className={`manage-requisitions ${
              pageViewMode === "Manage Categories" ? "active" : ""
            }`}
            onClick={() => {
              setPageViewMode("Manage Categories");
              setViewMode("");
            }}
          >
            <FontAwesomeIcon icon={faTags} />
            Categories
            <span className="metric">{categories.length}</span>
          </div>
          <div
            className={`manage-requisitions ${
              pageViewMode === "Manage Vendors" ? "active" : ""
            }`}
            onClick={() => {
              setPageViewMode("Manage Vendors");
              setViewMode("");
            }}
          >
            <FontAwesomeIcon icon={faTruck} />
            Vendors
            <span className="metric">{vendors.length}</span>
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
          <ProfileNavbar
            pr={purchaseRequisitions}
            deadlineCounts={deadlineCounts}
          />

          <h1 className="section-title">Users</h1>
          {requests.length > 0 && (
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
          )}

          <div className="search-container">
            <label htmlFor="search-field" id="search-field-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                name="search"
                value={searchUsers}
                onChange={handleSearchUsers}
                id="search-field"
                placeholder="Search User"
              />
            </label>
            <div className="buttons">
              <div
                className="btn--download-reports"
                onClick={handleDownloadUserReports}
              >
                Reports
                <FontAwesomeIcon icon={faArrowDown} />
              </div>
            </div>
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
                      className={updating === request.id ? "fade-out" : ""}
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
          <ProfileNavbar
            pr={purchaseRequisitions}
            deadlineCounts={deadlineCounts}
          />
          {/* <h1 className="section-title">Analytics</h1> */}
          {/* User Analytics */}
          {/* 
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
          </div> */}
          {/* Requisition Analytics */}
          {/* <h2 className="section-title">Requisitions</h2> */}

          {/* <div className="quick-analytics">
            <StatusPieChart
              className="quick-analytics--pie"
              purchaseRequisitions={purchaseRequisitions}
            /> */}
          {/* <div className="analytics-container quick-analytics--untouched-requisitions">
              <div className="quick-analytics--title">Require Action</div>
              <div className="quick-analytics--metric-value">
                {deadlineCounts.red}
              </div>
            </div> */}
          {/* <div className="analytics-container quick-analytics--drafted-requisitions">
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
          </div> */}
          {requests.length > 0 && (
            <>
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
                      requests.filter(
                        (req) => req.status === "accepted as admin"
                      ).length
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
            </>
          )}

          {purchaseRequisitions.length > 0 && (
            <>
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
                      purchaseRequisitions.filter(
                        (req) => req.status === "pending"
                      ).length
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
                      purchaseRequisitions.filter(
                        (req) => req.status === "closed"
                      ).length
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
            </>
          )}
          <RequisitionsCharts
            purchaseRequisitions={purchaseRequisitions}
            userRequests={requests}
          />
        </div>
      )}
      {pageViewMode && pageViewMode === "Manage Categories" && (
        <div className="container">
          <ProfileNavbar
            pr={purchaseRequisitions}
            deadlineCounts={deadlineCounts}
          />
          <h1 className="section-title">Categories</h1>
          <div className="search-container">
            <label htmlFor="search-field" id="search-field-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                name="search"
                value={searchCategories}
                onChange={handleSearchCategories}
                id="search-field"
                placeholder="Search Categories"
              />
            </label>
            <div className="buttons">
              <div
                className="btn--add-new"
                onClick={() => setCategoriesModalOpen(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="fa-icon plus-icon" />
                New
              </div>
            </div>
          </div>
          {categories.length > 0 ? (
            <div className="table-container">
              <table className="userTable">
                <thead>
                  <tr>
                    <th>Category ID</th>
                    <th>Category Name</th>
                    <th>Category Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr key={category.category_id}>
                      <td>{category.category_id}</td>
                      <td>{category.category_name}</td>
                      <td>
                        {category.description || "No Description Provided"}{" "}
                      </td>

                      <td>
                        <div className="buttons">
                          <button
                            className="button-reject"
                            onClick={() =>
                              handleDeleteCategory(category.category_id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-container">
              <p className="no-results">
                Looks empty in here ! Try adding a category
              </p>
            </div>
          )}
        </div>
      )}
      {pageViewMode && pageViewMode === "Manage Departments" && (
        <div className="container">
          <ProfileNavbar
            pr={purchaseRequisitions}
            deadlineCounts={deadlineCounts}
          />
          <h1 className="section-title">Departments</h1>
          <div className="search-container">
            <label htmlFor="search-field" id="search-field-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                name="search"
                id="search-field"
                placeholder="Search Departments"
                value={searchDepartments}
                onChange={handleSearchDepartments}
              />
            </label>
            <div className="buttons">
              <div
                className="btn--add-new"
                onClick={() => setDepartmentsModalOpen(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="fa-icon plus-icon" />
                New
              </div>
            </div>
          </div>
          {departments.length > 0 ? (
            <div className="table-container">
              <table className="userTable">
                <thead>
                  <tr>
                    <th>Department ID</th>
                    <th>Department Name</th>
                    <th>Department Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((department) => (
                    <tr key={department.dept_id}>
                      <td>{department.dept_id}</td>
                      <td>{department.dept_name}</td>
                      <td>
                        {department.description || "No Description Provided"}{" "}
                      </td>

                      <td>
                        <div className="buttons">
                          <button
                            className="button-reject"
                            onClick={() =>
                              handleDeleteDepartment(department.dept_id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-container">
              <p className="no-results">
                Looks empty in here ! Try adding a department
              </p>
            </div>
          )}
        </div>
      )}
      {pageViewMode && pageViewMode === "Manage Vendors" && (
        <div className="container">
          <ProfileNavbar
            pr={purchaseRequisitions}
            deadlineCounts={deadlineCounts}
          />
          <h1 className="section-title">Vendors</h1>
          <div className="search-container">
            <label htmlFor="search-field" id="search-field-container">
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
              <input
                type="text"
                name="search"
                id="search-field"
                placeholder="Search Vendors"
                value={searchVendors}
                onChange={handleSearchVendors}
              />
            </label>
            <div className="buttons">
              <div
                className="btn--add-new"
                onClick={() => setVendorsModalOpen(true)}
              >
                <FontAwesomeIcon icon={faPlus} className="fa-icon plus-icon" />
                New
              </div>
            </div>
          </div>
          {vendors.length > 0 ? (
            <div className="table-container">
              <table className="userTable">
                <thead>
                  <tr>
                    <th>Vendor ID</th>
                    <th>Vendor Name</th>
                    <th>Vendor Email</th>
                    <th>Vendor Contact Person</th>
                    <th>Vendor Contact</th>
                    <th>Vendor Address</th>
                    <th>Vendor GSTIN</th>
                    <th>Vendor VAT No.</th>
                    <th>Vendor TIN No.</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.vendor_id}>
                      <td>{vendor.vendor_id}</td>
                      <td>{vendor.vendor_name}</td>
                      <td>{vendor.vendor_email_id}</td>
                      <td>{vendor.vendor_contact_person}</td>
                      <td>{vendor.vendor_contact}</td>
                      <td>{vendor.vendor_address}</td>
                      <td>{vendor.vendor_GSTIN}</td>
                      <td>{vendor.vendor_VAT}</td>
                      <td>{vendor.vendor_TIN}</td>

                      <td>
                        <div className="buttons">
                          <button
                            className="button-reject"
                            onClick={() => handleDeleteVendor(vendor.vendor_id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="table-container">
              <p className="no-results">
                Looks empty in here ! Try adding a vendor
              </p>
            </div>
          )}
        </div>
      )}

      {pageViewMode && pageViewMode === "Manage Requisitions" && (
        <div className="container">
          <ProfileNavbar
            pr={purchaseRequisitions}
            deadlineCounts={deadlineCounts}
          />
          <h1 className="section-title">Requisitions</h1>
          {purchaseRequisitions.length > 0 && (
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
                    purchaseRequisitions.filter(
                      (req) => req.status === "pending"
                    ).length
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
                    purchaseRequisitions.filter(
                      (req) => req.status === "closed"
                    ).length
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
          )}

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
                onClick={handleDownloadRequisitionReports}
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
                {purchaseRequisitions.length > 0 &&
                  viewMode === "allRequisitions" &&
                  `No requisitions found`}
                {!purchaseRequisitions.length && `Loading...`}
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
                        updating === requisition.requisition_id
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
                                handleMarkRequisitionAsComplete(
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
      <AnimatePresence>
        {showItemsTable && <ItemsTable requisition={showingRequisition} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedRequisition && (
          <GeneratePO
            requisition={selectedRequisition}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {requisitionsModalOpen && (
          <AddRequisition
            onClose={handleCloseModal}
            operationType={requisitionPropsOperationType}
            requisitionPropsData={requisitionPropsData}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {departmentsModalOpen && <AddDepartment onClose={handleCloseModal} />}
      </AnimatePresence>
      <AnimatePresence>
        {categoriesModalOpen && <AddCategory onClose={handleCloseModal} />}
      </AnimatePresence>
      <AnimatePresence>
        {vendorsModalOpen && <AddVendor onClose={handleCloseModal} />}
      </AnimatePresence>
      <AnimatePresence>
        {writingToolsMode && (
          <WritingTools purchaseRequisitions={purchaseRequisitions} />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;
