import React, { useContext, useEffect, useState } from "react";
import html2pdf from "html2pdf.js";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import "../receipt.scss";
import nshmLogo from "../assets/receipt-logo.jpg";
import { numberToWords } from "./helper/inrToWords";
import { motion } from "framer-motion";
import REACT_APP_API_BASE_URL from "../config";

const GeneratePO = ({ requisition, onClose }) => {
  const [terms, setTerms] = useState([]);
  const [vendorData, setVendorData] = useState(null);
  const [error, setError] = useState(null);
  const [clauses, setClauses] = useState([]);
  const [items, setItems] = useState(requisition.items);
  const [additionalCharges, setAdditionalCharges] = useState(0);
  const [createdBy, setCreatedBy] = useState(requisition.name);
  const [acknowledgedBy, setAcknowlededBy] = useState("");

  useEffect(() => {
    const fetchVendorData = async () => {
      if (requisition.selected_vendor) {
        try {
          const response = await fetch(
            `${REACT_APP_API_BASE_URL}/vendor/${requisition.selected_vendor}`,
            {
              headers: { Authorization: sessionStorage.getItem("token") },
            }
          );
          const data = await response.json();

          if (response.ok) {
            setVendorData(data.vendor); // Set vendor data
            console.log(data.vendor);
          } else {
            setError(data.error); // Set error message if vendor is not found
          }
        } catch (err) {
          setError("Error fetching vendor data");
        }
      }
    };

    fetchVendorData();
  }, [requisition.selected_vendor]); // Fetch when selected_vendor changes

  const handleInputChange = (id, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: parseFloat(value) || 0 } : item
      )
    );
    console.log(items);
  };

  const handleAddTerm = () => {
    setTerms([...terms, ""]);
  };
  const handleAddClause = () => {
    setClauses([...clauses, ""]);
  };

  const handleTermChange = (index, value) => {
    const updatedTerms = terms.map((term, i) => (i === index ? value : term));
    setTerms(updatedTerms);
  };
  const handleClauseChange = (index, value) => {
    const updatedClauses = clauses.map((clause, i) =>
      i === index ? value : clause
    );
    setClauses(updatedClauses);
  };

  const handleDeleteTerm = (index) => {
    const updatedTerms = terms.filter((_, i) => i !== index);
    setTerms(updatedTerms);
  };
  const handleDeleteClause = (index) => {
    const updatedClauses = clauses.filter((_, i) => i !== index);
    setClauses(updatedClauses);
  };

  // Calculate derived values
  const calculatePriceAfterDiscount = (item) => {
    const unitPrice = item.unitPrice || 0;
    const unitDiscount = item.unitDiscount || 0;
    return (unitPrice - unitDiscount) * item.quantity;
  };

  const calculateTotalCost = (item) => {
    const priceAfterDiscount = calculatePriceAfterDiscount(item);
    const tax = item.tax || 0;
    return priceAfterDiscount + tax;
  };

  const calculateTotalDiscounts = () =>
    items.reduce(
      (total, item) => total + (item.unitDiscount || 0) * item.quantity,
      0
    );

  const calculateTotalTax = () =>
    items.reduce((total, item) => total + (item.tax || 0), 0);

  const calculateGrandTotal = () =>
    items.reduce((total, item) => total + calculateTotalCost(item), 0) +
    parseFloat(additionalCharges);

  const handleDownloadReceipt = () => {
    const receiptElement = document.getElementById("receipt");
    const options = {
      margin: 0,
      filename: "receipt.pdf",
      html2canvas: { scale: 2, dpi: 300, letterRendering: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(options).from(receiptElement).save();
  };

  return (
    <motion.div className="receipt-modal" exit={{ opacity: 0 }}>
      <motion.div
        className="receipt-modal-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, translateY: 100, scale: 0.8 }}
      >
        <div className="receipt-form">
          <div className="close-button" onClick={onClose}></div>
          <h2>Generate PO for {requisition.name}</h2>
          <div className="linebreak"></div>
          <div className="item-prices">
            {items.map((item, index) => (
              <div key={index} className="item-price">
                <div>
                  {index + 1}. {item.name}
                </div>
                <div className="linebreak"></div>
                <div className="unit-price">
                  <label>Unit Price</label>
                  <input
                    type="number"
                    value={item.unitPrice || ""}
                    onChange={(e) =>
                      handleInputChange(item.id, "unitPrice", e.target.value)
                    }
                  />
                </div>
                <div className="discount">
                  <label>Discount</label>
                  <input
                    type="number"
                    value={item.unitDiscount || ""}
                    onChange={(e) =>
                      handleInputChange(item.id, "unitDiscount", e.target.value)
                    }
                  />
                </div>
                <div className="tax">
                  <label>Tax</label>
                  <input
                    type="number"
                    value={item.tax || ""}
                    onChange={(e) =>
                      handleInputChange(item.id, "tax", e.target.value)
                    }
                  />
                </div>
                <div className="linebreak"></div>
              </div>
            ))}
          </div>
          <div className="charges">
            <label>Charges</label>
            <input
              type="number"
              value={additionalCharges}
              onChange={(e) => setAdditionalCharges(e.target.value)}
            />
          </div>
          <div className="charges">
            <label>Created By</label>
            <input
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
            />
          </div>
          <div className="charges">
            <label>Acknowledged By</label>
            <input
              type="text"
              value={acknowledgedBy}
              onChange={(e) => setAcknowlededBy(e.target.value)}
            />
          </div>
          {/* <div className="discount">
            <label>Select Discount Type :</label>
            <div>
              <input
                type="radio"
                value="unit"
                checked={discountType === "unit"}
                onChange={(e) => setDiscountType(e.target.value)}
              />
              Discount per Item
              <input
                type="radio"
                value="total"
                checked={discountType === "total"}
                onChange={(e) => setDiscountType(e.target.value)}
              />
              Total Discount
            </div>
            <input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              placeholder="Enter discount value"
            />
          </div> */}

          {/* <div className="tax-container">
            <button onClick={handleAddTax}>
              Add Tax <FontAwesomeIcon icon={faPlus} />
            </button>
            {taxes.map((tax, index) => (
              <div key={index} className="tax">
                <input
                  type="text"
                  placeholder="Enter tax type"
                  value={tax.type}
                  onChange={(e) =>
                    handleTaxChange(index, "type", e.target.value)
                  }
                />
                <input
                  type="number"
                  placeholder="Enter tax %"
                  value={tax.percentage}
                  onChange={(e) =>
                    handleTaxChange(index, "percentage", e.target.value)
                  }
                />
                <button onClick={() => handleDeleteTax(index)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
          </div> */}

          <div className="termsContainer">
            <button onClick={handleAddTerm}>
              Add Terms & Conditions <FontAwesomeIcon icon={faPlus} />
            </button>
            {/* <div className="terms"> */}
            {terms.map((term, index) => (
              <div key={index} className="term">
                <input
                  type="text"
                  placeholder="Enter term"
                  value={term}
                  onChange={(e) => handleTermChange(index, e.target.value)}
                />
                <button onClick={() => handleDeleteTerm(index)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
            {/* </div>  */}
          </div>
          <div className="termsContainer">
            <button onClick={handleAddClause}>
              Add Purchase Clauses <FontAwesomeIcon icon={faPlus} />
            </button>
            {/* <div className="terms"> */}
            {clauses.map((clause, index) => (
              <div key={index} className="term">
                <input
                  type="text"
                  placeholder="Enter term"
                  value={clause}
                  onChange={(e) => handleClauseChange(index, e.target.value)}
                />
                <button onClick={() => handleDeleteClause(index)}>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))}
            {/* </div>  */}
          </div>

          <div className="linebreak"></div>
          <button
            onClick={handleDownloadReceipt}
            className="btn-download-receipt"
          >
            Download Receipt
          </button>
        </div>

        <div id="receipt" className="receipt-content">
          <img src={nshmLogo} alt="" id="receipt-logo" />
          <h4 contentEditable>Heading</h4>
          <h4 contentEditable>Address</h4>
          <h4 className="title">PURCHASE ORDER</h4>
          <div className="PO-credentials">
            <div className="PO-number">
              <strong>PO Number</strong>
              <p contentEditable>xxxxxx</p>
            </div>
            <div className="PO-date">
              <strong>PO Date:</strong>
              <p>
                {new Date().getFullYear()}-
                {(new Date().getMonth() + 1).toString().padStart(2, "0")}-
                {new Date().getDate().toString().padStart(2, "0")}
              </p>
            </div>
            <div className="PO-status">
              <strong>Status:</strong>
              <p>Approved</p>
            </div>
          </div>
          <div className="PO-to-from">
            <div className="vendor-details">
              <div className="name">
                <strong>Vendor Name &nbsp;&nbsp;&nbsp;&nbsp;:-</strong>
                <p>{requisition.selected_vendor}</p>
              </div>
              <div className="address">
                <strong>Vendor Address :-</strong>
                <p>{vendorData?.vendor_address}</p>
              </div>
              <br />
              <div className="email">
                <strong>
                  Email id
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-
                </strong>
                <p>{vendorData?.vendor_email_id}</p>
              </div>
              <div className="contactPerson">
                <strong>Contact Person &nbsp;:-</strong>
                <p>{vendorData?.vendor_contact_person}</p>
              </div>
              <div className="contact">
                <strong>
                  Contact
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-
                </strong>
                <p>{vendorData?.vendor_contact}</p>
              </div>
              <div className="TIN">
                <strong>
                  TIN No.
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-
                </strong>
                <p>{vendorData?.vendor_TIN}</p>
              </div>
              <br />
              <div className="VAT">
                <strong>
                  VAT No.
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-
                </strong>
                <p>{vendorData?.vendor_VAT}</p>
              </div>
              <div className="GSTIN">
                <strong>
                  GSTIN
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-
                </strong>
                <p>{vendorData?.vendor_GSTIN}</p>
              </div>
              <div className="invoice-address">
                <p>Invoice Address :-</p>
                <p contentEditable></p>
              </div>
            </div>
            <div className="receiver-details">
              <div className="site-address">
                <strong>Site Address &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-</strong>
                <p contentEditable></p>
              </div>
              <div className="email">
                <strong>
                  Email id
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-
                </strong>
                <p contentEditable></p>
              </div>
              <div className="contact">
                <strong>
                  Contact
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-
                </strong>
                <p contentEditable></p>
              </div>
              <div className="exciseNo">
                <strong>
                  Excise No.
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-
                </strong>
                <p contentEditable></p>
              </div>
              <div className="serviceTaxNo">
                <strong>Service Tax No. :-</strong>
                <p contentEditable></p>
              </div>
              <div className="VAT">
                <strong>
                  VAT No.
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-
                </strong>
                <p contentEditable></p>
              </div>
              <div className="GSTIN">
                <strong>
                  GSTIN
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:-
                </strong>
                <p contentEditable></p>
              </div>
            </div>
          </div>

          <table border={1}>
            <thead>
              <tr>
                <th>Sl.</th>
                <th>Item Name</th>
                <th>Specifications</th>
                <th>Qty</th>
                <th>UOM</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Price after Disc.</th>
                <th>Total Item Cost in Rs.</th>
                <th>Tax</th>
                <th>Total Item Cost in Rs.</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  {/* <td>{item.category}</td> */}
                  <td>{item.specification}</td>
                  <td>{item.quantity}</td>
                  <td contentEditable>Nos.</td>
                  <td contentEditable>INR {item.unitPrice}</td>
                  <td contentEditable>INR {item.unitDiscount}</td>
                  <td contentEditable>
                    INR{" "}
                    {(item.unitPrice || 0) -
                      (item.unitDiscount || 0)?.toFixed(2)}
                  </td>
                  <td contentEditable>
                    INR {calculatePriceAfterDiscount(item)?.toFixed(2)}
                  </td>
                  <td contentEditable>INR {item.tax}</td>
                  <td contentEditable>
                    INR {calculateTotalCost(item).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tr className="total-row">
              <td colSpan={6} className="borderless"></td>

              <td colSpan={3}>Total Item Cost</td>
              <td colSpan={2} contentEditable>
                INR {calculateGrandTotal()}
              </td>
            </tr>
            <tr className="total-row">
              <td colSpan={6} className="borderless"></td>

              <td colSpan={3}>Total Discounts</td>
              <td colSpan={2} contentEditable>
                INR {calculateTotalDiscounts()}
              </td>
            </tr>
            <tr className="total-row">
              <td colSpan={6} className="borderless"></td>

              <td colSpan={3}>Charges</td>
              <td colSpan={2} contentEditable>
                INR {additionalCharges}
              </td>
            </tr>
            <tr className="total-row">
              <td className="borderless"></td>
              <td className="borderless"></td>
              <td className="borderless"></td>
              <td className="borderless"></td>
              <td className="borderless"></td>
              <td className="borderless"></td>
              <td colSpan={3}>Taxes</td>
              <td colSpan={2} contentEditable>
                INR {calculateTotalTax()}
              </td>
            </tr>
            <thead>
              <tr>
                <th colSpan={5}>Tax Details</th>
              </tr>
            </thead>
            <tr>
              <td colSpan={4} contentEditable>
                CGST
              </td>
              <td contentEditable></td>
            </tr>
            <tr>
              <td colSpan={4} contentEditable>
                SGST
              </td>
              <td contentEditable></td>
            </tr>
            <br />
            <thead>
              <tr>
                <th colSpan={8} contentEditable>
                  Grand Total : {numberToWords(calculateGrandTotal())}
                </th>
                <th colSpan={3} contentEditable>
                  INR {calculateGrandTotal()}
                </th>
              </tr>
            </thead>
            <br />
            <thead>
              <tr>
                <th colSpan={8} contentEditable>
                  Grand Total : (Base Currency){" "}
                  {numberToWords(Math.round(calculateGrandTotal()))}
                </th>
                <th colSpan={3} contentEditable>
                  INR {Math.round(calculateGrandTotal())}
                </th>
              </tr>
            </thead>
            <br />
            {terms.length > 0 && (
              <thead>
                <tr>
                  <th colSpan={5}>Terms & Conditions</th>
                </tr>{" "}
              </thead>
            )}

            {terms.map((term, index) => (
              <tr key={index}>
                <td colSpan={11} className="borderless term">
                  {term}
                </td>
              </tr>
            ))}
            <br />
            {clauses.length > 0 && (
              <thead>
                <tr>
                  <th colSpan={5}>Purchase Clauses</th>
                </tr>{" "}
              </thead>
            )}

            {clauses.map((clause, index) => (
              <tr key={index}>
                <td colSpan={11} className="borderless term">
                  {clause}
                </td>
              </tr>
            ))}
          </table>

          <div className="signatures">
            <div className="created-by">
              <h4>Created by</h4>
              <h4 contentEditable>{createdBy}</h4>
            </div>
            <div className="acknowledged-by">
              <h4>Acknowledged by</h4>
              <h4 contentEditable>{acknowledgedBy}</h4>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GeneratePO;
