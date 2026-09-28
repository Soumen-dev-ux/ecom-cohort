import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { productApi } from "../services/api";

const initialForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: ""
};

function ProductForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editing) return;

    const loadProduct = async () => {
      try {
        const response = await productApi.getOne(id);
        const product = response.data.product || response.data.data || response.data;

        setForm({
          name: product.name || "",
          description: product.description || "",
          price: product.price ?? "",
          stock: product.stock ?? "",
          category: product.category || ""
        });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [editing, id]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);

    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock)
    };

    try {
      if (editing) {
        await productApi.update(id, payload);
      } else {
        await productApi.create(payload);
      }

      navigate("/products");
    } catch (err) {
      const data = err.response?.data;

      if (Array.isArray(data?.errors)) {
        const nextErrors = {};

        data.errors.forEach((item) => {
          nextErrors[item.field] = item.message;
        });

        setFieldErrors(nextErrors);
      } else {
        setError(data?.message || "Unable to save product.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main className="form-page">
      <section className="form-card">
        <div className="dashboard-header compact">
          <div>
            <span className="eyebrow">
              {editing ? "Update" : "Create"}
            </span>
            <h1>{editing ? "Edit product" : "Add product"}</h1>
          </div>

          <Link className="button button-outline" to="/products">
            Cancel
          </Link>
        </div>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Product name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wireless Headphones"
              required
            />
            {fieldErrors.name && (
              <small className="field-error">{fieldErrors.name}</small>
            )}
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the product..."
              rows="4"
            />
            {fieldErrors.description && (
              <small className="field-error">{fieldErrors.description}</small>
            )}
          </label>

          <div className="two-column">
            <label>
              Price
              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
              {fieldErrors.price && (
                <small className="field-error">{fieldErrors.price}</small>
              )}
            </label>

            <label>
              Stock
              <input
                type="number"
                min="0"
                step="1"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                placeholder="0"
                required
              />
              {fieldErrors.stock && (
                <small className="field-error">{fieldErrors.stock}</small>
              )}
            </label>
          </div>

          <label>
            Category
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Electronics"
            />
            {fieldErrors.category && (
              <small className="field-error">{fieldErrors.category}</small>
            )}
          </label>

          <button className="button button-primary full" disabled={submitting}>
            {submitting
              ? "Saving..."
              : editing
              ? "Update product"
              : "Create product"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ProductForm;
