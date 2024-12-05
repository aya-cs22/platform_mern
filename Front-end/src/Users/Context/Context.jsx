import axios from "axios";
import React, { createContext, useState } from "react";
import { toast } from "react-toastify";
export const DataContext = createContext();
function Context({ children }) {
  const URLAPI = "http://localhost:8000";
  const [userId, setUserId] = useState("");
  const [loading,setLoading] = useState(false)
  const groupId = localStorage.getItem("newGroupId");
  const token = JSON.parse(localStorage.getItem("token"));
  const userIdLocal = JSON.parse(localStorage.getItem("userId"));
  const handleJoinGroup = () => {
    if (!token) {
      toast.error("Please login to join the group.");
      return;
    }
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

    if (!userIdLocal) {
      toast.error("Unable to fetch user information. Please try again.");
      return;
    }

    const joinRes = {
      groupId: groupId,
      userId: userId,
    };
    axios
      .post(`${URLAPI}/api/JoinRequests/join-request`, joinRes, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      })
      .then(() => {
        toast.success(
          "Your request to join has been sent successfully. Please wait for the request to be accepted."
        );
      })
      .catch((err) => {
        toast.error("Failed to send join request: Already in Group ");
      });
  };
  return (
    <DataContext.Provider value={{ URLAPI , handleJoinGroup }}>
      {children}
    </DataContext.Provider>
  );
}

export default Context;
