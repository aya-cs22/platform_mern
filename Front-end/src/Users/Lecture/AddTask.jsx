import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const URLAPI = "http://localhost:8000";

function AddTask() {
  const userIdLocal = JSON.parse(localStorage.getItem("userId"));
  const token = JSON.parse(localStorage.getItem("token"));

  const [groupId, setGroupId] = useState("");
  const [taskData, setTaskData] = useState({
    submissionLink: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${URLAPI}/api/users/${userIdLocal}`, {
        headers: { Authorization: `${token}` },
      })
      .then((res) => {
        setGroupId(res.data.group_id);
      })
      .catch((err) => toast.error("Error fetching group: " + err.message));
  }, [userIdLocal, token]);

  // إرسال المهمة
  const handleTaskSubmit = () => {
    if (!taskData.submissionLink.trim()) {
      toast.error("Please enter a valid submission link.");
      return;
    }

    if (!groupId) {
      toast.error("Group ID not found. Please try again.");
      return;
    }

    setLoading(true); // بدء التحميل
    axios
      .post(
        `${URLAPI}/api/lectures/${groupId}/tasks/${userIdLocal}/submit`,
        { ...taskData, userId: userIdLocal },
        { headers: { Authorization: `${token}` } }
      )
      .then(() => {
        toast.success("Task submitted successfully!");
        setTaskData({ submissionLink: "" });
      })
      .catch((err) => {
        toast.error(
          "Error submitting task: " + err.response?.data?.message || err.message
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <>
      <ToastContainer />
      <div className="container mt-5">
        <div className="card shadow-sm p-4">
          <h1 className="text-center mb-4">Add Task</h1>
          <div className="mb-3">
            <label htmlFor="submissionLink" className="form-label">
              Submission Link:
            </label>
            <input
              type="text"
              id="submissionLink"
              className="form-control"
              value={taskData.submissionLink}
              onChange={(e) =>
                setTaskData({ ...taskData, submissionLink: e.target.value })
              }
              placeholder="Enter submission link"
            />
          </div>
          <div className="text-center">
            <button
              onClick={handleTaskSubmit}
              className="btn btn-primary w-50"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Task"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AddTask;
