import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

const URLAPI = "http://localhost:8000";

function EmailReq() {
  const [email, setEmail] = useState([]);
  const token = JSON.parse(localStorage.getItem("token"));
  const userIdLocal = JSON.parse(localStorage.getItem("userId"));

  // إعداد تاريخ البدء بصيغة "YYYY-MM-DD"
  const formattedDate = new Date();
  const formattedStartDate = formattedDate.toISOString().split("T")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${URLAPI}/api/JoinRequests/get-all-join-requests`,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );

        if (res.data) {
          setEmail(res.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token,email]);

  const handleAccept = async (id, requestId) => {
    const acceptedReq = {
      requestId: requestId,
      startDate: formattedStartDate,
      lifetimeAccess: true,
    };

    try {
      await axios.post(
        `${URLAPI}/api/JoinRequests/approve-Join-request`,
        acceptedReq,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      toast.success("Request Accepted");
      setEmail(email.filter((item) => item.user_id._id !== id));
    } catch (error) {
      if (error.response) {
        toast.error(
          `Error accepting request: ${
            error.response.data.message || error.message
          }`
        );
      } else {
        toast.error("Error accepting request");
      }
    }
  };

  const handleRejected = async (id, requestId) => {
    const rejectedReq = {
      requestId: requestId,
    };

    try {
      await axios.post(
        `${URLAPI}/api/JoinRequests/reject-join-request`,
        rejectedReq,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      toast.error("Request Rejected");
      setEmail(email.filter((item) => item.user_id._id !== id));
    } catch (error) {
      if (error.response) {
        toast.error(
          `Error rejecting request: ${
            error.response.data.message || error.message
          }`
        );
      } else {
        toast.error("Error rejecting request");
      }
    }
  };

  return (
    <>
      <ToastContainer />
      <h1 className="text-center">All Request Emails</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
          width: "80%",
          margin: "auto",
        }}
      >
        {email.map((item, index) => (
          <div className="card p-2 m-2 text-center" key={index}>
            <h3>{item.user_id.name}</h3>
            <h4>{item.user_id.email}</h4>
            <h4>
              {item.group_id.title} - {item.group_id.start_date?.slice(0, 10)}
            </h4>
            <button
              className="btn btn-success m-2"
              onClick={() => handleAccept(item.user_id._id, item._id)}
            >
              Accept
            </button>
            <button
              className="btn btn-danger m-2"
              onClick={() => handleRejected(item.user_id._id, item._id)}
            >
              Reject
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export default EmailReq;
