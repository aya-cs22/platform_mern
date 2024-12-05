import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
function AddFeedback() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedback: "",
  });
  const userIdLocal = JSON.parse(localStorage.getItem("userId"));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userIdLocal) {
    
      toast.success("Feedback submitted successfully! Thanks");
      setTimeout(() => {
        setFormData({ name: "", email: "", feedback: "" });
      }, 1500);
    } else {
      setTimeout(() => {
        toast.error("You must log in to submit feedback.");
      }, 1500);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container mt-5">
        <h2 className="text-center mb-4">Add Feedback</h2>
        <form onSubmit={handleSubmit} className="shadow p-4 rounded m-auto">
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
              }}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
              }}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="feedback" className="form-label">
              Feedback
            </label>
            <textarea
              className="form-control"
              id="feedback"
              name="feedback"
              rows="4"
              value={formData.feedback}
              onChange={(e) => {
                setFormData({ ...formData, feedback: e.target.value });
              }}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={!userIdLocal}
          >
            Submit Feedback
          </button>
          {!userIdLocal && (
            <p className="text-danger mt-2 text-center">
              Please log in to submit feedback.
            </p>
          )}
        </form>
      </div>
    </>
  );
}

export default AddFeedback;
