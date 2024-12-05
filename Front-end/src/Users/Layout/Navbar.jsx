import React, { useState } from "react";
import "./nav.css";
import { FaBars } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import NavStudent from "../LoggedStudent/NavStudent";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const userIdLocal = JSON.parse(localStorage.getItem("userId"));

  const toggleNavbar = () => {
    setMenuOpen(!menuOpen);
  };

  const closeNavbar = () => {
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container">
        <h1 className="navbar-brand text-dark">Code Eagles</h1>
        {!userIdLocal ? (
          <>
            <ul className={menuOpen ? "nav responsive" : "nav"}>
              <li className="nav-item">
                <NavLink
                  to="/"
                  className="nav-link text-dark"
                  onClick={closeNavbar}
                >
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/all-courses"
                  className="nav-link text-dark"
                  onClick={closeNavbar}
                >
                  Courses
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/contact"
                  className="nav-link text-dark"
                  onClick={closeNavbar}
                >
                  Contact us
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/register"
                  className="nav-link text-dark"
                  onClick={closeNavbar}
                >
                  Sign Up
                </NavLink>
              </li>
            </ul>
            <button
              className="navbar-toggler btn btn-dark"
              onClick={toggleNavbar}
            >
              <FaBars />
            </button>
          </>
        ) : (
          <>
            <NavStudent menuOpen={menuOpen} />
            <button
              className="navbar-toggler btn btn-dark"
              onClick={toggleNavbar}
            >
              <FaBars />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
