import React, { useContext, useState } from "react";
import html2pdf from "html2pdf.js";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const GeneratePO = ({ requisition, onClose }) => {
  const [unitPrices, setUnitPrices] = useState(requisition.items.map(() => 0));
  const [discountType, setDiscountType] = useState("unit");
  const [discountValue, setDiscountValue] = useState(0);
  const [taxes, setTaxes] = useState([]);
  const [terms, setTerms] = useState([]);
  const { currentUser } = useContext(AuthContext);

  const handleUnitPriceChange = (index, value) => {
    const updatedUnitPrices = [...unitPrices];
    updatedUnitPrices[index] = value;
    setUnitPrices(updatedUnitPrices);
  };

  const handleAddTax = () => {
    setTaxes([...taxes, { type: "", percentage: 0 }]);
  };

  const handleTaxChange = (index, field, value) => {
    const updatedTaxes = taxes.map((tax, i) =>
      i === index ? { ...tax, [field]: value } : tax
    );
    setTaxes(updatedTaxes);
  };

  const handleDeleteTax = (index) => {
    const updatedTaxes = taxes.filter((_, i) => i !== index);
    setTaxes(updatedTaxes);
  };

  const handleAddTerm = () => {
    setTerms([...terms, ""]);
  };

  const handleTermChange = (index, value) => {
    const updatedTerms = terms.map((term, i) => (i === index ? value : term));
    setTerms(updatedTerms);
  };

  const handleDeleteTerm = (index) => {
    const updatedTerms = terms.filter((_, i) => i !== index);
    setTerms(updatedTerms);
  };

  const totalCost = () => {
    let total = requisition.items.reduce((sum, item, index) => {
      const itemUnitPrice = parseFloat(unitPrices[index] || 0);
      const itemTotal = itemUnitPrice * item.quantity;
      return sum + itemTotal;
    }, 0);

    if (discountType === "unit") {
      total -= discountValue * requisition.items.length;
    } else {
      total -= discountValue;
    }

    taxes.forEach((tax) => {
      total += total * (tax.percentage / 100);
    });

    // Ensure the total cost does not fall below 0
    return Math.max(total, 0).toFixed(2);
  };

  const handleDownloadReceipt = () => {
    const receiptElement = document.getElementById("receipt");
    const opt = {
      margin: 1,
      filename: "receipt.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    // Create a temporary HTML with styles
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <link rel="stylesheet" href="/path/to/your/styles.css">
      </head>
      <body>
        ${receiptElement.innerHTML}
      </body>
      </html>
    `;

    const tempElement = document.createElement("div");
    tempElement.innerHTML = receiptHtml;
    document.body.appendChild(tempElement);

    html2pdf()
      .from(tempElement)
      .set(opt)
      .save()
      .then(() => {
        document.body.removeChild(tempElement);
      });
  };

  return (
    <div className="receipt-modal">
      <div className="receipt-modal-content">
        <div className="receipt-form">
          <span className="close-button" onClick={onClose}>
            close
          </span>
          <h2>Generate PO for {requisition.name}</h2>
          <div className="linebreak"></div>
          <div className="item-prices">
            {requisition.items.map((item, index) => (
              <div key={index} className="item-price">
                <label>{item.name} Unit Price</label>
                <input
                  type="number"
                  value={unitPrices[index]}
                  onChange={(e) => handleUnitPriceChange(index, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="discount">
            <label>Select Discount Type:</label>
            <div>
              <input
                type="radio"
                value="unit"
                checked={discountType === "unit"}
                onChange={(e) => setDiscountType(e.target.value)}
              />
              Discount per Unit
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
            />
          </div>

          <div className="tax-container">
            <button onClick={handleAddTax}>Add Tax</button>
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
          </div>

          <div className="termsContainer">
            <button onClick={handleAddTerm}>Add Terms & Conditions</button>
            <div className="terms">
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
            </div>
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
          <h3>FROM</h3>
          <p>
            Name <span className="receipt--value">{currentUser.name}</span>
          </p>
          <p>
            Username{" "}
            <span className="receipt--value">{currentUser.username}</span>
          </p>
          <p>
            Email <span className="receipt--value">{currentUser.email}</span>
          </p>
          <h3 className="vendor">VENDOR</h3>
          <p>
            Name <span>{requisition.selected_vendor}</span>
          </p>
          <h3>REQUISITION DETAILS</h3>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {requisition.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>INR {unitPrices[index]}</td>
                  <td>INR {unitPrices[index] * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Discount Type <span>{discountType}</span>
          </p>
          <p>
            Discount Value <span>INR {discountValue}</span>
          </p>
          {taxes.length > 0 && (
            <p>
              Taxes{" "}
              <span>
                <ul>
                  {taxes.map((tax, index) => (
                    <li key={index}>
                      {tax.type}: {tax.percentage}%
                    </li>
                  ))}
                </ul>
              </span>
            </p>
          )}
          <h3>
            TOTAL <span className="receipt--value">INR {totalCost()}</span>
          </h3>
          {terms.length > 0 && <h3>Terms & Conditions</h3>}
          <ul>
            {terms.map((term, index) => (
              <li key={index}>{term}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GeneratePO;
