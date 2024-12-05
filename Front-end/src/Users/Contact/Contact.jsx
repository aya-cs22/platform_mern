import React, { useState } from "react";
import { toast ,ToastContainer} from "react-toastify"

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
  });
  const [writeMessage,setWriteMessage] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    toast.success("Thank You For Contacting Us")
    // setFormData("")
  };
  return (
 <>
 <ToastContainer/>
    <div className="container mt-5">
      <h2 className="text-center mb-4">Contact us</h2>
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
            onChange={(e)=>setFormData({...formData,name:e.target.value})}
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
            onChange={(e)=>setFormData({...formData,email:e.target.value})}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="feedback" className="form-label">
            How to help You
          </label>
          <textarea
            className="form-control"
            id="contact"
            name="contact"
            rows="4"
            value={formData.contact}
            onChange={(e)=>setFormData({...formData,contact:e.target.value})}
            required
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary w-100" disabled={formData.contact ? writeMessage : !writeMessage }>
          Submit contact
        </button>
      </form>
    </div></>
  );
}

export default Contact;
