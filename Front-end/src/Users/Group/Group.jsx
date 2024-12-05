import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { DataContext } from "../Context/Context";

function Group() {
  const { URLAPI, handleJoinGroup } = useContext(DataContext);
  const [group, setGroup] = useState({
    title: "Front End",
    start_date: "12-12-2024",
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const groupId = localStorage.getItem("newGroupId");
  const token = JSON.parse(localStorage.getItem("token"));
  const userIdLocal = JSON.parse(localStorage.getItem("userId"));

  useEffect(() => {
    if (userIdLocal) {
      axios
        .get(`${URLAPI}/api/users/${userIdLocal}`, {
          headers: {
            Authorization: `${token}`,
          },
        })
        .then((res) => {
          setUserId(res.data._id);
          setLoading(false);
        });
    }

    if (groupId) {
      axios
        .get(`${URLAPI}/api/groups/${groupId}`)
        .then((res) => {
          setGroup(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching group data:", err);

          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [groupId, token]);

  return (
    <>
      <ToastContainer />
      <div style={{ padding: "20px" }}>
        {group ? (
          <>
        <h1 className="text-center">New Group</h1>
          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              width: "250px",
              textAlign: "center",
              margin: "auto",
            }}
          >
            <h2>{group.title}</h2>
            <p>{group.start_date?.slice(0, 10)}</p>
            <button onClick={handleJoinGroup} className="btn btn-success">
              Join Group
            </button>
          </div>
          </>
        ) : (
          <div></div>
        )}
      </div>
    </>
  );
}

export default Group;
