import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

function AllGroups() {
  const [showGroup, setShowGroup] = useState({});
  const { groupId } = useParams();
  const [offline, setOffline] = useState([]);
  const [online, setOnline] = useState([]);

  const getToken = JSON.parse(localStorage.getItem("token"));
  if (!getToken) {
    toast.error("Unauthorized. Please log in.");
    return;
  }

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/groups", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${getToken}`,
        },
      })
      .then((res) => {
        const onlineGroup = res.data.filter((item) => item.type_course === "online");
        setOnline(onlineGroup);
        const offlineGroup = res.data.filter((item) => item.type_course !== "online");
        setOffline(offlineGroup);
      })
      .catch((error) => {
        toast.error("Error fetching groups: " + error.message);
      });
  }, []);

  const handleShowGroup = (id) => {
    setShowGroup((prevState) => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const renderGroupButtons = (groupList) => {
    return groupList.map((item) => (
      <div className="d-flex flex-wrap" key={item._id}>
        <Link to={`/admin/${item._id}`}>
          <button className="btn btn-warning d-block m-2">
            {item.title} - {item.start_date?.slice(0, 10)}
          </button>
        </Link>
        <button
          className={`btn ${showGroup[item._id] ? "btn-success" : "btn-secondary"} m-2`}
          onClick={() => handleShowGroup(item._id)}
        >
          {showGroup[item._id] ? "Hide" : "Show"}
        </button>
      </div>
    ));
  };

  return (
    <div>
      <ToastContainer />
      <h1 className="text-center">All Groups</h1>
      <div className="d-flex flex-wrap justify-content-between container m-auto">
        <div className="sm-w-100 m-2">
          <h1>Online Groups</h1>
          {renderGroupButtons(online)}
        </div>
        <div className="sm-w-100 m-2">
          <h1>Offline Groups</h1>
          {renderGroupButtons(offline)}
        </div>
      </div>
    </div>
  );
}

export default AllGroups;
