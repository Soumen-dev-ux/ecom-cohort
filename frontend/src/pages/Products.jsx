import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fakeStoreApi, productApi } from "../services/api";

const fallbackProducts = [
  {
    id: 1,
    title: "Everyday Backpack",
    price: 49.99,
    description: "A durable backpack for daily use and weekend trips.",
    category: "accessories"
  },
  {
    id: 2,
    title: "Classic Cotton T-Shirt",
    price: 19.99,
    description: "A comfortable cotton tee with a clean, classic fit.",
    category: "clothing"
  },
  {
    id: 3,
    title: "Wireless Headphones",
    price: 89.99,
    description: "Over-ear wireless headphones for music and calls.",
    category: "electronics"
  },
  {
    id: 4,
    title: "Ceramic Coffee Mug Set",
    price: 24.99,
    description: "A set of two ceramic mugs for your morning coffee.",
    category: "home"
  }
];

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fakeStoreApi.getAll();
      const data = response.data;

      setProducts(
        Array.isArray(data) ? data : data.products || data.data || []
      );
    } catch (err) {
      setProducts(fallbackProducts);
      setError("Fake Store is unavailable; showing sample products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await productApi.remove(id);
      setProducts((current) =>
        current.filter((product) => (product._id || product.id) !== id)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product.");
    }
  };

  return (
    <main className="dashboard">
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Catalogue</span>
          <h1>Products</h1>
          <p className="muted">Manage your e-commerce products.</p>
        </div>

        <Link className="button button-primary" to="/products/new">
          + Add product
        </Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="page-center small">
          <div className="spinner" />
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <h2>No products yet</h2>
          <p>Create your first product to get started.</p>
          <Link className="button button-primary" to="/products/new">
            Add product
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default Products;
