import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";

const ItemsTable = ({ requisition }) => {
  const { setShowItemsTable } = useContext(AuthContext);

  const closeItemsTable = () => {
    setShowItemsTable(false);
  };
  return (
    <motion.div className="items-table-modal" exit={{ opacity: 0 }}>
      <motion.div
        className="container"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8, translateY: 200 }}
      >
        <div className="btn--close-items-table" onClick={closeItemsTable}></div>
        <h2>Items Table</h2>
        <div className="linebreak"></div>
        <div className="items-table--details">
          <div className="requisition--detail requisition-id">
            <strong>Requisition ID</strong>{" "}
            {requisition.created_at.split("T")[0].replace(/[^a-zA-Z0-9]/g, "") +
              requisition.requisition_id}
          </div>
          <div className="requisition--detail requisition-created-by">
            <strong>Created By </strong>
            {requisition.name}
          </div>
        </div>
        <table className="items-table">
          <thead>
            <tr>
              <th>item</th>
              <th>category</th>
              <th>specifications</th>
              <th>qty</th>
              <th>est. cost</th>
            </tr>
          </thead>
          <tbody>
            {requisition?.items &&
              requisition.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.specification}</td>
                  <td>{item.quantity}</td>
                  <td>{item.cost}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  );
};

export default ItemsTable;
