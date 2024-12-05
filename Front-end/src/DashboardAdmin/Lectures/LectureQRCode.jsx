import axios from "axios";
<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { toast, ToastContainer } from "react-toastify";

function LectureQRCode() {
  const [lectures, setLectures] = useState([]);
  const [qrValue, setQrValue] = useState("");
  const [studentName, setStudentName] = useState({ name: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/lectures")
      .then((res) => {
        setLectures(res.data); 
      })
      .catch((error) => {
        console.error("Error fetching lectures:", error);
        alert("Failed to load lectures. Please try again.");
      })
      .finally(() => {
        setLoading(false); // Set loading to false after fetching
      });
  }, []);



  const handleCreateQR = (e) => {
    e.preventDefault();
    const foundLecture = lectures.find(
      (lecture) => lecture.title === studentName.name
    );
    if (foundLecture) {
      console.log("QR Code Value:", foundLecture.qr_code); // Debug output
      setQrValue(foundLecture.qr_code);
      setStudentName({ name: "" }); // Clear input after successful QR generation
    } else {
      toast.error("Lecture not found");
      setQrValue("");
    }
  };

  const handlePrint = (e) => {
    e.preventDefault();
    window.print();
  };

  return (
    <>
    <ToastContainer />
      {loading ? (
        <h1>Loading lectures...</h1> // Loading state message
      ) : (
        <>
          <form className="m-2  p-2" onSubmit={handleCreateQR}>
            <h1 className="m-2">Create New QR</h1>
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Lecture Title"
              value={studentName.name}
              onChange={(e) =>
                setStudentName({ ...studentName, name: e.target.value })
              }
              maxLength={100} 
              required
            />
            <button className="btn btn-primary m-2" type="submit">
              Create
            </button>
            <button className="btn btn-primary m-2" onClick={handlePrint}>
              Print
            </button>
          </form>

          <div
            style={{
              height: "auto",
              margin: "20px",
              maxWidth: 200,
              width: "100%",
            }}
          >
            {qrValue && (
              <div>
                <h1 className="text-center">QR Code</h1>
                <QRCode
                  size={256}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  value={qrValue}
                  viewBox={`0 0 256 256`}
                />
              </div>
            )}
          </div>
        </>
=======
import React, { useState } from "react";
import QRCode from "react-qr-code";

function LectureQRCode() {
  const [qrValue, setQrValue] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [studentName, setStudentName] = useState({
    name: "",
    group: "",
  });

  const handleCreateQR = (e) => {
    e.preventDefault();
    const currentDateTime = new Date().toLocaleString();
    const attendance = `${qrValue} - ${currentDateTime}`;
    axios
      .post("http://localhost:1337/api/attendances", { data: { attendance } })
      .then((res) => console.log(res.data));
  };
  const handleQRRead = () => {
    setShowForm(true);
    setQrValue(false);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const attendanceData = { name: studentName.name, group: studentName.group };
    console.log(attendanceData);

    axios
      .post("http://localhost:1337/api/student-attendances", {data:attendanceData})
      .then((res) => console.log(res.data));

    setStudentName("");
    setShowForm(false);
  };
  const handlePrint =(e)=>{
    e.preventDefault()
    window.print()
  }

  return (
    <>
      <form className="m-2">
        <h1 className="m-2">Create New QR</h1>
        <input
          type="text"
          className="form-control m-2"
          placeholder="Lecture ID"
          onChange={(e) => setQrValue(e.target.value)}
        />
        <button className="btn btn-primary m-2" onClick={handleCreateQR}>
          Create
        </button>
        <button className="btn btn-primary m-2" onClick={handlePrint}>Print</button>
      </form>

      <div 
        style={{
          height: "auto",
          margin: "20px",
          maxWidth: 200,
          width: "100%",
        }}
      >
        {qrValue && (
          
          <div onClick={handleQRRead}>
            <h1 className="text-center"> QR </h1>
            <QRCode
              size={256}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              value={`https://forms.gle/soriGmhnmVZgBjTt6?lectureId=${qrValue}`} // إضافة lectureId
              viewBox={`0 0 256 256`}
            />
          </div>
        )}
       
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="m-2">
          <h2>Enter your name</h2>
          <input
            type="text"
            className="form-control m-2"
            placeholder="Your Name"
            value={studentName.name}
            onChange={(e) =>
              setStudentName({ ...studentName, name: e.target.value })
            }
            required
          />
          <input
            type="date"
             className="form-control m-2"
            value={studentName.group}
            onChange={(e) =>
              setStudentName({ ...studentName, group: e.target.value })
            }
          />
          <button className="btn btn-success m-2" type="submit">
            Submit
          </button>
        </form>
>>>>>>> c7070c1c51eda217496bd774fd0a6ef9d518089c
      )}
    </>
  );
}

export default LectureQRCode;
