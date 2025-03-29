import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import REACT_APP_API_BASE_URL from "../config";

const AddVendor = ({ onClose }) => {
  const [vendorName, setVendorName] = useState("");
  const [vendorContactPerson, setVendorContactPerson] = useState("");
  const [vendorEmailId, setVendorEmailId] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorGSTIN, setVendorGSTIN] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorTIN, setVendorTIN] = useState("");
  const [vendorVAT, setVendorVAT] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      vendor_name: vendorName,
      vendor_contact_person: vendorContactPerson,
      vendor_email_id: vendorEmailId,
      vendor_address: vendorAddress,
      vendor_GSTIN: vendorGSTIN,
      vendor_contact: vendorContact,
      vendor_TIN: vendorTIN,
      vendor_VAT: vendorVAT,
    };

    try {
      const response = await fetch(`${REACT_APP_API_BASE_URL}/addVendor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Vendor added successfully:", data);
        toast.success("Vendor added successfully");
        setVendorName("");
        setVendorContactPerson("");
        setVendorEmailId("");
        setVendorAddress("");
        setVendorGSTIN("");
        setVendorContact("");
        setVendorTIN("");
        setVendorVAT("");
      } else {
        const errorData = await response.json();
        console.error("Error adding vendor:", errorData);
        toast.error("Error adding vendor");
        alert(errorData.error || "Failed to add vendor.");
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Error adding vendor! Failed to connect to server");
    }
  };

  return (
    <motion.div className="add-vendor-modal" exit={{ opacity: 0 }}>
      <motion.div
        className="vendor-modal-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, translateY: 200, scale: 0.8 }}
      >
        <div className="vendor-form">
          <div className="close-button" onClick={onClose}></div>
          <h2>Add New Vendor</h2>
          <div className="linebreak"></div>
          <form onSubmit={handleSubmit}>
            <label>
              Vendor Name
              <input
                type="text"
                name="vendorName"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Enter vendor name"
                required
              />
            </label>

            <label>
              Contact Person
              <input
                type="text"
                name="vendorContactPerson"
                value={vendorContactPerson}
                onChange={(e) => setVendorContactPerson(e.target.value)}
                placeholder="Enter contact person's name"
              />
            </label>
            <label>
              Vendor Email
              <input
                type="email"
                name="vendorEmailId"
                value={vendorEmailId}
                onChange={(e) => setVendorEmailId(e.target.value)}
                placeholder="Enter vendor email"
              />
            </label>
            <label>
              Vendor Address
              <input
                type="text"
                name="vendorAddress"
                value={vendorAddress}
                onChange={(e) => setVendorAddress(e.target.value)}
                placeholder="Enter vendor address"
              />
            </label>
            <label>
              GSTIN
              <input
                type="text"
                name="vendorGSTIN"
                value={vendorGSTIN}
                onChange={(e) => setVendorGSTIN(e.target.value)}
                placeholder="Enter vendor GSTIN"
              />
            </label>
            <label>
              Vendor Contact Number
              <input
                type="text"
                name="vendorContact"
                value={vendorContact}
                onChange={(e) => setVendorContact(e.target.value)}
                placeholder="Enter vendor contact number"
              />
            </label>
            <label>
              TIN
              <input
                type="text"
                name="vendorTIN"
                value={vendorTIN}
                onChange={(e) => setVendorTIN(e.target.value)}
                placeholder="Enter vendor TIN"
              />
            </label>
            <label>
              VAT
              <input
                type="text"
                name="vendorVAT"
                value={vendorVAT}
                onChange={(e) => setVendorVAT(e.target.value)}
                placeholder="Enter vendor VAT"
              />
            </label>
            <button type="submit">Submit</button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AddVendor;
