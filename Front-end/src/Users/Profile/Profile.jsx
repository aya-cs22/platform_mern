import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../Context/Context";
import { toast ,ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

function Profile() {
  const { URLAPI } = useContext(DataContext);
  const [userData, setUserData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState({ present: 0, absent: 0 });
  const [totalTaskGrades, setTotalTaskGrades] = useState(0);
  const [editing, setEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
const navigate= useNavigate()
  const userId = JSON.parse(localStorage.getItem("userId"));
  const token = JSON.parse(localStorage.getItem("token"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const res = await axios.get(`${URLAPI}/api/users/${userId}`, {
          headers: { Authorization: ` ${token}` },
        });
        console.log(res.data)
        if (res.data) {
          setUserData(res.data);
          setUpdatedData({ name: res.data.name, email: "", phone_number: "" });
        }

        // const tasksRes = await axios.get(`${URLAPI}/api/users/${userId}/tasks`, {
        //   headers: { Authorization: `${token}` },
        // });
        // const taskData = tasksRes.data;
        // setTasks(taskData);
        // setTotalTaskGrades(
        //   taskData.reduce((sum, task) => sum + task.grade, 0) // Sum task grades
        // );

        // // Fetch attendance
        // const attendanceRes = await axios.get(`${URLAPI}/api/users/${userId}/attendance`, {
        //   headers: { Authorization: `${token}` },
        // });
        // setAttendance(attendanceRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("An error occurred while fetching your data.");
      }
    };

    fetchData();
  }, [userId, token]);

  const handleUpdate = async () => {
    try {
      const updateRes = await axios.put(
        `${URLAPI}/api/users/${userId}`,
        updatedData,
        {
          headers: { Authorization: `${token}` },
        }
      );
      setUserData(updateRes.data);
      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating user data:", error);
      toast.error("Failed to update profile.");
    }
  };
  const handleLoggout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    toast.success("logout successfully")
    setTimeout(() => {
      navigate("/")
    }, 2000);
  };

  return (
    <>
    <ToastContainer />
    <div className="container mt-4">
      <h2 className="mb-4">User Dashboard</h2>

      {/* User Info */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Personal Information</h5>
          {!editing ? (
            <>
              <p>
                <strong>Name:</strong> {userData?.name}
              </p>
              <p>
                <strong>Email:</strong> {userData?.email}
              </p>
              <p>
                <strong>Phone number:</strong> {userData?.phone_number}
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <div>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={updatedData.name}
                  onChange={(e) =>
                    setUpdatedData({ ...updatedData, name: e.target.value })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="text"
                  className="form-control"
                  value={updatedData.email}
                  onChange={(e) =>
                    setUpdatedData({ ...updatedData, email: e.target.value })
                  }
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={updatedData.phone_number}
                  onChange={(e) =>
                    setUpdatedData({
                      ...updatedData,
                      phone_number: e.target.value,
                    })
                  }
                />
              </div>

              <button className="btn btn-success" onClick={handleUpdate}>
                Save
              </button>
              <button
                className="btn btn-secondary ms-2"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Attendance</h5>
              <p>
                <strong>Present:</strong> {attendance.present}
              </p>
              <p>
                <strong>Absent:</strong> {attendance.absent}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Tasks</h5>
              <p>
                <strong>Total Grades:</strong> {totalTaskGrades}
              </p>
              <ul>
                {tasks.map((task) => (
                  <li key={task.id}>
                    {task.title}: {task.grade}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <button onClick={handleLoggout} className="btn btn-outline-danger m-2">
        Logout
      </button>
    </div>
    </>
  );
}

export default Profile;
