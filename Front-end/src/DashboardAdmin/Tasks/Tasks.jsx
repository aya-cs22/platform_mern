import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "./Task.css";

function Tasks() {
  const { groupId } = useParams();
  console.log(groupId);

  const [dataTask, setDataTask] = useState([]);
  const getToken = JSON.parse(localStorage.getItem("token"));

  if (!getToken) {
    toast.error("Unauthorized. Please log in.");
    return;
  }

  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/lectures/${groupId}/tasks`, {
        headers: {
          Authorization: `${getToken}`,
        },
      })
      .then((res) => {
        console.log(res.data);
        setDataTask(res.data);
      });
  }, [groupId]);

  return (
    <>
      <ToastContainer />
      <Link to={`/admin/${groupId}/tasks/addTask`}>
        <button className="btn btn-success">New Task</button>
      </Link>
      <table className="table text-center mt-2 mb-2">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Delivered</th>
            <th className="border p-2">Start Date</th>
            <th className="border p-2">End Date</th>
          </tr>
        </thead>
        <tbody>
          {dataTask.map((item, index) => (
            <tr key={index}>
              <td className="border p-2">{item.title}</td>
              <td className="border p-2">{item.description_task}</td>
              <td className="border p-2">{item.delivered}</td>
              <td className="border p-2">{item.start_date}</td>
              <td className="border p-2">{item.end_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export default Tasks;
