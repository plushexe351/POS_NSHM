import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faSliders } from "@fortawesome/free-solid-svg-icons";

const DownloadReportsModal = ({ isOpen, onClose }) => {
  const [bridgeNames, setBridgeNames] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedBridgeName, setSelectedBridgeName] = useState("");
  const [selectedState, setSelectedState] = useState("");

  useEffect(() => {
    // Fetch bridge names
    axios
      .get("http://localhost:3001/fetchBridges")
      .then((response) => {
        setBridgeNames([
          "All Bridges",
          ...response.data.map((item) => item.bridge_name),
        ]);
      })
      .catch((error) => {
        console.error("Error fetching bridges:", error);
      });

    // Fetch states
    axios
      .get("http://localhost:3001/fetchStates")
      .then((response) => {
        setStates(["All States", ...response.data.map((item) => item.state)]);
      })
      .catch((error) => {
        console.error("Error fetching states:", error);
      });
  }, []);

  const handleDownload = async () => {
    const bridgeName =
      selectedBridgeName === "All Bridges" ? "" : selectedBridgeName;
    const state = selectedState === "All States" ? "" : selectedState;

    try {
      const response = await axios.get(
        "http://localhost:3001/download-reports",
        {
          params: { bridgeName, state },
          responseType: "blob", // Important for file download
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `report_${selectedBridgeName}_${selectedState}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading the report", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="download-reports-modal modal-all-screen">
      <div className="modal-content">
        <p>Download Reports</p>
        <div className="filters">
          <label className="filter-by filter-by-bridge">
            <span className="filter-title">
              <FontAwesomeIcon icon={faSliders} />
              Filter by Bridge
            </span>
            <select
              value={selectedBridgeName}
              onChange={(e) => setSelectedBridgeName(e.target.value)}
            >
              {bridgeNames.map((bridgeName) => (
                <option key={bridgeName} value={bridgeName}>
                  {bridgeName}
                </option>
              ))}
            </select>
          </label>

          <label className="filter-by filter-by-state">
            <span className="filter-title">
              <FontAwesomeIcon icon={faSliders} />
              Filter by State
            </span>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="buttons">
          <button onClick={handleDownload}>Download</button>
          <button className="close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadReportsModal;
