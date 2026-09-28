import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, authenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <Link className="brand" to={authenticated ? "/products" : "/login"}>
        ShopSphere
      </Link>

      <nav>
        {authenticated ? (
          <div className="nav-user">
            <span>{user?.name}</span>
            <button className="button button-outline" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
