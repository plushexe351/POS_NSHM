import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const RaiseIssueModal = ({ isOpen, onClose }) => {
  const [issue, setIssue] = useState();
  const { currentUser } = useContext(AuthContext);

  if (!isOpen) return null;

  return (
    <div className="raise-issue-modal modal-all-screen">
      <div className="modal-content">
        <p>Raise Issue</p>
        <input
          type="text"
          name="issue"
          id="issue"
          value={issue}
          placeholder="Describe issue"
          onChange={(e) => setIssue(e.target.value)}
        />
        <div className="buttons">
          <button>Submit</button>
          <button className="close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RaiseIssueModal;
