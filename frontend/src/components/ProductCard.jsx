import { Link } from "react-router-dom";

import React from "react";

function ProductCard({ product, onDelete }) {
  return (
    <article className="product-card">
      <div className="product-card-top">
        <span className="product-category">
          {product.category || "General"}
        </span>
        <span className="stock">
          Stock: {product.stock ?? 0}
        </span>
      </div>

      <h3>{product.name || product.title}</h3>

      {product.description && (
        <p className="muted">{product.description}</p>
      )}

      <div className="product-price">
        ₹{Number(product.price || 0).toLocaleString("en-IN")}
      </div>

      <div className="card-actions">
        <Link
          className="button button-secondary"
          to={`/products/${product._id || product.id}/edit`}
        >
          Edit
        </Link>

        <button
          className="button button-danger"
          onClick={() => onDelete(product._id || product.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
