import React, { useState, useEffect } from "react";

function Notification() {
  const [notifications, setNotifications] = useState({
    tasks: [
      {
        name: "Create Form With HTML",
      },
      {
        name: "Create Navigation Bar With CSS",
      },
    ],
    lectures: [
      {
        name: "Lecture 1: HTML Basics",
      },
      {
        name: "Lecture 2: CSS 1",
      },
      {
        name: "Lecture 3: CSS 2",
      },
      {
        name: "Lecture 4: Bootstrap",
      },
      {
        name: "Lecture 5: Revision HTML && CSS",
      },
      {
        name: "Lecture 6: JS 1",
      },
      {
        name: "Lecture 7: JS 2",
      },
      {
        name: "Lecture 8: JS 3",
      },
      {
        name: "Lecture 9: JS 4",
      },
      {
        name: "Lecture 10: JS 5",
      },
      {
        name: "Lecture 11: Reivison JS",
      },
      {
        name: "Lecture 12: React 1",
      },
      {
        name: "Lecture 13: React 2",
      },

      {
        name: "Lecture 14: React 3",
      },
      {
        name: "Lecture 15: React 4",
      },
    ],
  });
  const [loading, setLoading] = useState(false);

  // Example: Uncomment if you have backend logic
  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     try {
  //       const response = await fetch("/api/notifications");
  //       const data = await response.json();
  //       setNotifications(data);
  //     } catch (error) {
  //       console.error("Failed to fetch notifications:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchNotifications();
  // }, []);

  const { tasks, lectures } = notifications;
  const hasTasks = tasks && tasks.length > 0;
  const hasLectures = lectures && lectures.length > 0;

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div className="container my-4">
      <h1 className="text-center mb-4">Notifications</h1>
      {hasTasks || hasLectures ? (
        <div className="row g-4">
          {hasTasks && (
            <div className="col-lg-6 col-md-6 col-sm-12">
              <div className="card">
                <div className="card-header bg-primary text-white">
                  <h5 className="text-center">New Tasks</h5>
                </div>
                <ul className="list-group list-group-flush">
                  {tasks.map((item, index) => (
                    <li key={index} className="list-group-item">
                      <i className="bi bi-book-fill text-primary me-2"></i>
                    
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {hasLectures && (
            <div className="col-lg-6 col-md-6 col-sm-12">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h5 className="text-center">New Lectures</h5>
                </div>
                <ul className="list-group list-group-flush">
                  {lectures.map((item, index) => (
                    <li key={index} className="list-group-item">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="alert alert-info text-center" role="alert">
          No new notifications.
        </div>
      )}
    </div>
  );
}

export default Notification;
