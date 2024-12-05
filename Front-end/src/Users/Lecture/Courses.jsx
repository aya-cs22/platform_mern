import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";

const URLAPI = "http://localhost:8000";

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [lectures, setLectures] = useState([
    {
      id: 1,
      name: "Lecture 1 HTML",
      video: "",
      task: "task 1",
      discription: "How To Create File HTML And More Tags",
    },
    {
      id: 2,
      name: "Lecture 2 CSS 1",
      video: "",
      task: "task 2",
      discription: "How To Style Your HTML Using CSS",
    },
    {
      id: 3,
      name: "Lecture 3 CSS 2",
      video: "",
      task: "task 3",
      discription: "Advanced CSS Techniques",
    },
    {
      id: 4,
      name: "Lecture 4 JS 1",
      video: "",
      task: "task 4",
      discription: "Introduction to JavaScript",
    },
    {
      id: 5,
      name: "Lecture 5 JS 2",
      video: "",
      task: "task 5",
      discription: "JavaScript Functions and DOM",
    },
    {
      id: 6,
      name: "Lecture 6 Bootstrap 1",
      video: "",
      task: "task 6",
      discription: "Using Bootstrap for Responsive Design",
    },
  ]);

  return (
    <>
      <div className="container mt-4">
        {error && <p style={{ color: "red" }}>{error}</p>}
        {courses.length > 0 &&
          courses.map((item, index) => (
            <div key={index} className="mb-3">
              <h1>
                {item.title} - {item.start_date?.slice(0, 10)} -{" "}
                {item.type_course}
              </h1>
            </div>
          ))}
      </div>

      <div className="container">
        <div className="row">
          {/* Content Section */}
          <div className="col-12 col-md-8 bg-light p-4">
              {/* الفيديو */}
            <div style={{ position: "relative", width: "100%" }}>
              <video
                src="/images/lecture 11 react 1.mp4"
                controls
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                style={{ width: "100%", borderRadius: "10px" }}
              ></video>

              {/* العلامة المائية */}
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "10px",
                  color: "rgba(255, 255, 255, 0.7)",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  pointerEvents: "none",
                }}
              >
                BY: Ahmed Amer
              </div>
            </div>
            <div>
              <h2 className="m-2">Task : Create Form With HTML</h2>
              <Link to={`/add-task`}>
              <button className="btn btn-success m-2">Add Task</button>
              </Link>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="col-12 col-md-4  text-dark p-4">
            <h4 className="mb-3">Lectures</h4>
            {lectures.map((item, index) => (
              <div key={item.id} className="mb-3">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary me-2">{index + 1}</span>
                  <strong>{item.name}</strong>
                </div>
                <Link
                  to={"/my-courses/" + item.id}
                  className="text-dark text-decoration-none"
                >
                  <p className="m-2">{item.discription}</p>
                </Link>
                <hr />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default MyCourses;
