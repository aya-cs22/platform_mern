import React, { useContext, useEffect, useState } from "react";
import "./nav.css"; // Make sure to import the CSS file
import Courses from "../Lecture/Courses";
import Group from "../Group/Group";
import AllGroup from "../Group/AllGroup";
import AllCourses from "../Lecture/AllCourses";
import axios from "axios";
import { DataContext } from "../Context/Context";
import FeedBack from "../FeedBack/FeedBack";
import UserChat from "../Chats/UserChat";

function Main() {
  const [group_Id, setGroupId] = useState(null);
  const token = JSON.parse(localStorage.getItem("token"));
  const userIdLocal = JSON.parse(localStorage.getItem("userId"));
  const { URLAPI } = useContext(DataContext);

  useEffect(() => {
    if (userIdLocal && token) {
      axios
        .get(`${URLAPI}/api/groups`, {
          headers: {
            Authorization: `${token}`,
          },
        })
        .then((res) => {
          const groups = res.data;
          const group = groups.find((group) =>
            group.members.some((member) => member._id === userIdLocal)
          );

          if (group) {
            setGroupId(group._id); 
          } else {
            setGroupId(null); 
          }
        })
        .catch((err) => {
          console.error("Error fetching groups:", err);
        });
    }
  }, [userIdLocal, token, URLAPI]);

  return (
    <>
      {group_Id ? (
        <>
          {/* <AllGroup /> عرض جميع المجموعات إذا كان الطالب في مجموعة */}
          <Courses />
        </>
      ) : (
        <>
          <div className="main-background">
            <div className="main-content">
              <h1>Web Development Courses Platform</h1>
              <p>
                Here you'll find everything you need to learn programming and
                build websites using the latest technologies.
              </p>
              <a
                href="https://wa.me/201120873873?text=عايز اعرف تفاصيل  الدفعه الجديده"
                target="_blank"
              >
                <button className="btn btn-success">Book Now</button>
              </a>
            </div>
          </div>
          <AllCourses />
          <Group />
          <AllGroup /> 
          <FeedBack />
          <UserChat />
        </>
      )}
    </>
  );
}

export default Main;
