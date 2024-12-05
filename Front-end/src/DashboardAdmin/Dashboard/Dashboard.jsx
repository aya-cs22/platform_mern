import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import "./Dashboard.css";
import axios from "axios";
import { IoMenu } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";

function Dashboard() {
  const [openTag, setOpenTag] = useState({
    online: true,
    offline: true,
    attendance: true,
  });
  const [online, setOnline] = useState([]);
  const [offline, setOffline] = useState([]);
  const [dark, setDark] = useState(false);
  const [toggleNav, setToggleNav] = useState(true);

  const handleClick = (e) => {
    e.preventDefault();
    setDark(!dark);
  };

  const handleToggle = (e) => {
    e.preventDefault();
    setToggleNav(!toggleNav);
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get("http://localhost:8000/api/groups");
      const onlineGroup = response.data.filter((item) => item.type_course === "online");
      setOnline(onlineGroup);
      const offlineGroup = response.data.filter((item) => item.type_course !== "online");
      setOffline(offlineGroup);
    };
    fetchData();
  }, []);

  const handleOpen = (tag) => {
    setOpenTag((prevState) => ({
      ...prevState,
      [tag]: !prevState[tag],
    }));
  };

  return (
    <div className="row">
      <div className="col-lg-3 col-md-4 col-sm-12 p-0">
        <div className="toggleMenu">
          <button className="btn btn-success" onClick={handleToggle}>
            <IoMenu />
          </button>
        </div>
        <ul className={`dashboard-left p-2 m-0 ${toggleNav ? "" : "toggle"}`}>
          <li className="d-flex align-items-center">
            <button className="btn btn-warning text-dark">
              <Link to="/admin/newGroup" className="text-dark">
                New Group
              </Link>
            </button>
            <button className="btn btn-dark text m-2" onClick={handleClick}>
              Dark
            </button>
          </li>
          <li>
            <Link to="/admin/allGroups">
              <button className="btn btn-warning text-dark w-100 text-start">
                All Groups
              </button>
            </Link>
          </li>
          <li>
            <Link to="/admin/allStudent">
              <button className="btn btn-warning text-dark w-100 text-start">
                All Students
              </button>
            </Link>
          </li>
          <li>
            <button
              className="btn btn-warning text-dark dropdown-toggle w-100 text-start"
              onClick={() => handleOpen("online")}
            >
              Online
            </button>
            <ul className={openTag.online ? "ulShow" : ""}>
              {online.map((item) => (
                <li key={item._id} className="text-light">
                  <Link to={`/admin/${item._id}`}>{item.type_course} - {item.start_date.slice(0, 10)}</Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <button
              className="btn btn-warning text-dark dropdown-toggle w-100 text-start"
              onClick={() => handleOpen("offline")}
            >
              Offline
            </button>
            <ul className={openTag.offline ? "ulShow" : ""}>
              {offline.map((item) => (
                <li key={item._id} className="text-light">
                  <Link to={`/admin/${item._id}`}>{item.type_course} - {item.start_date.slice(0, 10)}</Link>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <Link to="/admin/lectures">
              <button className="btn btn-warning text-dark w-100 text-start">
                Lectures
              </button>
            </Link>
          </li>
          <li>
            <Link to="/admin/search">
              <button className="btn btn-warning text-dark w-100 text-start">
                Search
              </button>
            </Link>
          </li>
          <li>
            <Link to="/admin/emails">
              <button className="btn btn-warning text-dark w-100 text-start">
                Emails
              </button>
            </Link>
          </li>
        </ul>
      </div>
      <div className={`col outlet ${dark ? "bg-dark text-light" : ""}`}>
        <Outlet />
      </div>
    </div>
  );
}

export default Dashboard;
