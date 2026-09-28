import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setGeneralError("");

    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setSubmitting(true);

    try {
      await register(form);
      navigate("/login", {
        replace: true,
        state: { registered: true }
      });
    } catch (err) {
      const data = err.response?.data;

      if (Array.isArray(data?.errors)) {
        const fieldErrors = {};

        data.errors.forEach((item) => {
          fieldErrors[item.field] = item.message;
        });

        setErrors(fieldErrors);
      } else {
        setGeneralError(
          data?.message || "Registration failed. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card wide">
        <div className="auth-heading">
          <span className="eyebrow">Get started</span>
          <h1>Create account</h1>
          <p>Create your account to manage the product catalogue.</p>
        </div>

        {generalError && <div className="alert error">{generalError}</div>}

        <form onSubmit={handleSubmit} className="form">
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
            {errors.name && <small className="field-error">{errors.name}</small>}
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            {errors.email && <small className="field-error">{errors.email}</small>}
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
            {errors.password && (
              <small className="field-error">{errors.password}</small>
            )}
          </label>

          <label>
            Confirm password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
            />
            {errors.confirmPassword && (
              <small className="field-error">{errors.confirmPassword}</small>
            )}
          </label>

          <button className="button button-primary full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
