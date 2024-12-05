import axios from "axios";
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const URLAPI = "http://localhost:8000";

function NavStudent({ user, menuOpen }) {
  const [loggedUser, setLoggedUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const userIdLocal = JSON.parse(localStorage.getItem("userId"));
  const getToken = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    axios
      .get(`${URLAPI}/api/users/${userIdLocal}`, {
        headers: {
          Authorization: `${getToken}`,
        },
      })
      .then((res) => {
        setLoggedUser(res.data);
        console.log(res.data);

        const enrolledCourses = res.data._id || [];
        setIsEnrolled(enrolledCourses.length > 0);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err.message);
      });
  }, [userIdLocal]);

  return (
    <div>
      <ul className={menuOpen ? "nav responsive" : "nav align-items-center"}>
        <li className="nav-item">
          <NavLink to="/" className={"nav-link  text-dark"}>
            Home
          </NavLink>
        </li>

        {isEnrolled && (
          <li className="nav-item">
            <NavLink
              to={isEnrolled ? "/my-courses" : "/all-courses"}
              className={"nav-link  text-dark"}
            >
              {isEnrolled ? "My Courses" : "All Courses"}
            </NavLink>
          </li>
        )}

        <li className="nav-item">
          <NavLink to="/profile" className={"nav-link  text-dark"}>
            Profile
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/notification" className={"nav-link  text-dark"}>
            Notification
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default NavStudent;
