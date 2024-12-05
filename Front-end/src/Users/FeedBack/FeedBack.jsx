import React, { useState } from "react";
import { Link } from "react-router-dom";

function FeedBack() {
  const [feedbackList, setFeedbackList] = useState([
    {
      id: 1,
      name: "Ahmed",
      email: "amer73090@gmail.com",
      comment:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aspernatur, enim!",
    },
    {
      id: 2,
      name: "Ahmed",
      email: "amer73090@gmail.com",
      comment:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aspernatur, enim!",
    },
    {
      id: 3,
      name: "Ahmed",
      email: "amer73090@gmail.com",
      comment:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aspernatur, enim!",
    },
    {
      id: 4,
      name: "Ahmed",
      email: "amer73090@gmail.com",
      comment:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aspernatur, enim!",
    },
  ]);
  

  return (
    <div className="container mt-5 mb-4">
      <h1 className="text-center mb-4">Feedback</h1>
      <div className="row g-4 ">
        {feedbackList.map((feedback) => (
          <div className="col-md-6 col-lg-4" key={feedback.id}>
            <div className="card shadow-lg h-100">
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <span className="badge bg-primary me-2">{feedback.id}</span>
                  <strong>Name: {feedback.name}</strong>
                </div>
                <strong>Email: {feedback.email}</strong>
                <p className="mt-3">{feedback.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-center">
        <Link to={"/feedback"}>
        <button className="btn btn-success m-2">Add Feedback</button>
        </Link>
      </div>
      
    </div>
  );
}

export default FeedBack;
