import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import REACT_APP_API_BASE_URL from "../config";

const AddCategory = ({ onClose }) => {
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      cat_name: catName,
      description: catDesc,
    };

    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/addCategory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Category added successfully:", data);
        toast.success("Category added successfully");
        setCatName("");
        setCatDesc("");
      } else {
        const errorData = await response.json();
        console.error("Error adding category:", errorData);
        toast.error("Error adding category");
        alert(errorData.error || "Failed to add category.");
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Error adding category ! Failed to connect to server");
    }
  };

  return (
    <motion.div className="add-category-modal" exit={{ opacity: 0 }}>
      <motion.div
        className="category-modal-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, translateY: 200, scale: 0.8 }}
      >
        <div className="category-form">
          <div className="close-button" onClick={onClose}></div>
          <h2>Add New Category</h2>
          <div className="linebreak"></div>
          <form onSubmit={handleSubmit}>
            <label>
              Category Name
              <input
                type="text"
                name="categoryName"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                id=""
                placeholder="Enter category name"
                required
              />
            </label>
            <label>
              Description
              <input
                type="text"
                name="categoryDescription"
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
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

export default AddCategory;
