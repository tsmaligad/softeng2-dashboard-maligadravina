// src/components/modals/MAddedToCart.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Modal.css"; // adjust path if your css is elsewhere

export default function MAddedToCart({ isOpen, onClose, productName, qty }) {
  if (!isOpen) return null;

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div
        className="cart-modal-content"
        onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
      >
        <button className="cart-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="cart-modal-icon">🛒</div>

        <h2 className="cart-modal-title">Added to cart!</h2>
        <p className="cart-modal-text">
          <span className="cart-modal-product">{productName}</span>{" "}
          {qty ? `× ${qty}` : null} has been added to your cart.
        </p>

        <div className="cart-modal-actions">
          <button className="cart-modal-btn-outline" onClick={onClose}>
            Continue shopping
          </button>

          <Link to="/cart" className="cart-modal-btn-filled" onClick={onClose}>
            View cart
          </Link>
        </div>
      </div>
    </div>
  );
}
