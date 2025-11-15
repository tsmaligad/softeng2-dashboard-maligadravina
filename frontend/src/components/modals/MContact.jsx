import React from "react";
import "./Modal.css";  // This imports the styles

const MContact = ({ isOpen, closeModal }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Message Sent!</h3>
        <p>Your message has been submitted successfully.</p>
        <button className="modal-button" onClick={closeModal}>Close</button>
      </div>
    </div>
  );
};

export default MContact;
