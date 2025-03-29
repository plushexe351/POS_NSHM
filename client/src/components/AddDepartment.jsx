import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import REACT_APP_API_BASE_URL from "../config";

const AddDepartment = ({ onClose }) => {
  const [deptName, setDeptName] = useState("");
  const [deptDesc, setDeptDesc] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    const payload = {
      dept_name: deptName, // Replace with the actual state variable for dept_name
      description: deptDesc, // Replace with the actual state variable for description
    };

    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/addDepartment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Department added successfully:", data);
        toast.success("Department added successfully");
        setDeptName("");
        setDeptDesc("");
      } else {
        const errorData = await response.json();
        console.error("Error adding department:", errorData);
        toast.error("Error adding department");
        alert(errorData.error || "Failed to add department.");
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Error adding department ! Failed to connect to server");
    }
  };

  return (
    <motion.div className="add-department-modal" exit={{ opacity: 0 }}>
      <motion.div
        className="department-modal-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, translateY: 200, scale: 0.8 }}
      >
        <div className="department-form">
          <div className="close-button" onClick={onClose}></div>
          <h2>Add New Department</h2>
          <div className="linebreak"></div>
          <form onSubmit={handleSubmit}>
            <label>
              Department Name
              <input
                type="text"
                name="departmentName"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                id=""
                placeholder="Enter department name"
                required
              />
            </label>
            <label>
              Description
              <input
                type="text"
                name="departmentDescription"
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                id=""
                placeholder="Brief Description (optional)"
              />
            </label>
            <button type="submit">Submit</button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddDepartment;
