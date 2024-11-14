import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AddRequisition = ({ onClose, requisitionPropsData, operationType }) => {
  const { currentUser } = useContext(AuthContext); // Access current user details from context
  const [items, setItems] = useState([
    { item_name: "", quantity: "", estimated_cost: "" },
  ]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("pending");
  const [requiredOn, setRequiredOn] = useState("");
  const [requiredBy, setRequiredBy] = useState("");

  useEffect(() => {
    if (operationType === "edit" && requisitionPropsData) {
      // Populate form with existing requisition data
      const formatDate = (date) => {
        const d = new Date(date);
        const month = ("0" + (d.getMonth() + 1)).slice(-2); // Add leading zero to month
        const day = ("0" + d.getDate()).slice(-2); // Add leading zero to day
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      };
      setItems(
        requisitionPropsData.items.map((item) => ({
          item_name: item.name,
          quantity: item.quantity,
          estimated_cost: item.cost,
          category: item.category,
          specification: item.specification,
        }))
      );
      setSelectedVendor(requisitionPropsData.selected_vendor);
      setDepartment(requisitionPropsData.department);
      setStatus(requisitionPropsData.status);
      requisitionPropsData.required_by &&
        setRequiredBy(formatDate(requisitionPropsData.required_by));
      requisitionPropsData.required_on &&
        setRequiredOn(formatDate(requisitionPropsData.required_on));
    }
  }, [operationType, requisitionPropsData, requiredBy]);

  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Fetch categories and vendors on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      const categoriesResponse = await fetch(
        "http://localhost:3001/admin/itemCategories"
      );
      const vendorsResponse = await fetch(
        "http://localhost:3001/admin/vendors"
      );
      const departmentsResponse = await fetch(
        "http://localhost:3001/admin/departments"
      );
      setCategories(await categoriesResponse.json());
      setVendors(await vendorsResponse.json());
      setDepartments(await departmentsResponse.json());
    };

    fetchOptions();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      { item_name: "", quantity: "", estimated_cost: "", specification: "" },
    ]);
  };

  const handleItemChange = (index, event) => {
    const newItems = [...items];
    newItems[index][event.target.name] = event.target.value;
    setItems(newItems);
  };

  const handleDeleteItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const requisitionData = {
        // Only update these fields
        department: department,
        selected_vendor: selectedVendor,
        status: status,
        items: items, // Array of items
        requisition_id: requisitionPropsData
          ? requisitionPropsData.requisition_id
          : null, // If editing, include the ID
        required_on: requiredOn,
        required_by: requiredBy,
      };
      console.log(requiredOn);
      console.log(requiredBy);
      // Use current user details for creator information when adding a new requisition
      if (!requisitionPropsData) {
        requisitionData.user_id = currentUser.id;
        requisitionData.name = currentUser.name;
        requisitionData.username = currentUser.username;
        requisitionData.email = currentUser.email;
      }

      const url = requisitionData.requisition_id
        ? "http://localhost:3001/editRequisition"
        : "http://localhost:3001/addRequisitions";

      requisitionData.requisition_id
        ? await axios.put(url, requisitionData)
        : await axios.post(url, requisitionData);

      toast.success("Requisition saved successfully");
    } catch (error) {
      console.error("Error saving requisition:", error);
      toast.error("Error saving requisition");
    }
  };

  return (
    <div className="add-requisition-modal">
      <div className="requisition-modal-content">
        <div className="requisition-form">
          <div className="close-button" onClick={onClose}></div>
          <h2>
            {operationType === "edit"
              ? "Edit Requisition"
              : "Add New Requisition"}
          </h2>
          <div className="linebreak"></div>
          <form onSubmit={handleSubmit}>
            {items.map((item, index) => (
              <div key={index} className="item-entry">
                <label>
                  Item Name
                  <input
                    type="text"
                    name="item_name"
                    value={item.item_name}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  />
                </label>
                <label>
                  Item Category
                  <select
                    name="category"
                    id=""
                    value={item.category}
                    onChange={(e) => handleItemChange(index, e)}
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {categories.map((category) => (
                      <option value={category.category_name}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Specifications
                  <input
                    type="text"
                    name="specification"
                    value={item.specification}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  />
                </label>
                <label>
                  Quantity
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  />
                </label>
                <label>
                  Estimated Cost
                  <input
                    type="number"
                    name="estimated_cost"
                    value={item.estimated_cost}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                  />
                </label>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="delete-button"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddItem}>
              Add Item <FontAwesomeIcon icon={faPlus} />
            </button>
            <label>
              Department:
              <select
                name="department"
                id=""
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="" disabled>
                  Select Department
                </option>
                {departments.map((department) => (
                  <option value={department.dept_name}>
                    {department.dept_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Preferred Vendor:
              <select
                name="vendor"
                id=""
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
              >
                <option value="" disabled>
                  Select Vendor
                </option>
                {vendors.map((vendor) => (
                  <option value={vendor.vendor_name}>
                    {vendor.vendor_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Required On:
              <input
                type="date"
                value={requiredOn}
                onChange={(e) => setRequiredOn(e.target.value)}
              />
            </label>
            <label>
              Required By:
              <input
                type="date"
                value={requiredBy}
                onChange={(e) => setRequiredBy(e.target.value)}
              />
            </label>
            {operationType === "edit" ? (
              <button type="submit">Save Changes</button>
            ) : (
              <button type="submit">Submit</button>
            )}
          </form>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default AddRequisition;
