import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowDown,
  faArrowTrendDown,
  faArrowTrendUp,
  faBars,
  faChevronDown,
  faCircle,
  faClose,
  faDownload,
  faHand,
  faList12,
  faPowerOff,
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import DownloadReportsModal from "./DownloadReportsModal";
import RaiseIssueModal from "./RaiseIssueModal";

function Dashboard() {
  const { currentUser, navVisible, setNavVisible } = useContext(AuthContext);
  const [cams, setCams] = useState([]);
  const [selectedCam, setSelectedCam] = useState(null);
  const [vehicleUpdates, setVehicleUpdates] = useState([]);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState({
    weighed: 0,
    overload: 0,
    normal: 0,
  });
  const [viewMode, setViewMode] = useState("home");
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCams = async () => {
      try {
        const response = await axios.get("http://localhost:3001/fetchBridges");
        setCams(response.data);
        setSelectedCam(response.data[0]); // Set the first camera as the default
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
        setError(true);
      }
    };

    fetchCams();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token stored");
        }
        toast.success(`Welcome back, ${currentUser.name}`);

        // Example API request to a protected route
        const response = await axios.get("http://localhost:3001/dashboard", {
          headers: { Authorization: token },
        });

        if (response.data.message === "success") {
          console.log("Logged in");
        } // Assuming response.data contains user info
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError(true);
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const fetchVehicleUpdates = async () => {
      if (selectedCam) {
        try {
          const response = await axios.get(
            "http://localhost:3001/fetchVehicleUpdates",
            {
              params: { bridge_name: selectedCam.bridge_name },
            }
          );

          const data = response.data;
          setVehicleUpdates(data);

          // Update stats based on fetched vehicle updates
          const weighed = data.length;
          const overload = data.filter(
            (item) => item.overload_status === "overload"
          ).length;
          const normal = weighed - overload;

          setStats({ weighed, overload, normal });
        } catch (error) {
          console.error("Error fetching vehicle updates:", error);
          setError(true);
        }
      }
    };

    fetchVehicleUpdates();
  }, [selectedCam]);

  const handleNavButtonClick = () => {
    setNavVisible(!navVisible);
  };

  const handleCamClick = (cam) => {
    setSelectedCam(cam);
  };

  const handleDownloadReportsClick = () => {
    setDownloadModalOpen(true);
  };
  const handleRaiseIssueClick = () => {
    setIssueModalOpen(true);
  };
  const handleCloseModal = () => {
    if (downloadModalOpen) setDownloadModalOpen(false);
    if (issueModalOpen) setIssueModalOpen(false);
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard--navbar">
        <h2>
          <i>POS</i>
          <span className="wordbreak">.</span>Dashboard
        </h2>
        <div className={`inner-nav ${navVisible ? "visible" : "hidden"}`}>
          <div className="home" onClick={() => setViewMode("home")}>
            Home
          </div>
          <div className="home" onClick={() => setViewMode("about")}>
            About
          </div>
          <div className="home" onClick={() => setViewMode("contact")}>
            Contact
          </div>
          {/* <div className="">View detailed dashboard</div> */}
          <div className="button-log-out" onClick={handleLogOut}>
            Log Out <FontAwesomeIcon icon={faPowerOff} />
          </div>
        </div>
        <FontAwesomeIcon
          icon={navVisible ? faClose : faBars}
          className="hamburg"
          onClick={handleNavButtonClick}
        />
      </nav>
      {error && <p style={{ color: "white" }}>Error fetching dashboard data</p>}

      <ToastContainer position="bottom-right" className="toast-container" />
      <DownloadReportsModal
        isOpen={downloadModalOpen}
        onClose={handleCloseModal}
      />
      <RaiseIssueModal isOpen={issueModalOpen} onClose={handleCloseModal} />
    </div>
  );
}

export default Dashboard;
