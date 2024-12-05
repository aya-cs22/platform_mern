import React, { useEffect, useRef, useState } from "react";

function AllCourses() {
  const [courses] = useState([
    {
      nameCourse: "HTML",
      description: "Learn the basics of HTML.",
      image: "html.webp",
    },
    {
      nameCourse: "CSS",
      description: "Learn how to style websites with CSS.",
      image: "css3.png",
    },
    {
      nameCourse: "JavaScript",
      description: "Master the fundamentals of JavaScript.",
      image: "javascript.png",
    },
    {
      nameCourse: "Bootstrap",
      description: "Learn to design responsive websites with Bootstrap.",
      image: "bootstrap-framework.png",
    },
    {
      nameCourse: "Git & GitHub",
      description: "Understand version control with Git and GitHub.",
      image: "git.png",
    },
    {
      nameCourse: "React",
      description: "Build interactive user interfaces with React.",
      image: "react.png",
    },
  ]);

  const [visibleCourses, setVisibleCourses] = useState({});
  const courseRefs = useRef([]);

  const courseBox = (index) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCourses((prev) => ({
            ...prev,
            [index]: true,
          }));
        } else {
          setVisibleCourses((prev) => ({
            ...prev,
            [index]: false,
          }));
        }
      },
      { threshold: 0.1 }
    );

    if (courseRefs.current[index]) {
      observer.observe(courseRefs.current[index]);
    }

    return () => {
      if (courseRefs.current[index]) {
        observer.unobserve(courseRefs.current[index]);
      }
    };
  };

  useEffect(() => {
    // Set up the observers for each course
    courseRefs.current.forEach((item, index) => courseBox(index));
  }, [courses]);

  return (
    <div style={{ padding: "20px" }}>
      <h1 className="text-center">Available Courses</h1>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          width: "80%",
          margin: "auto",
        }}
      >
        {courses.map((course, index) => (
          <div
            key={index}
            ref={(el) => (courseRefs.current[index] = el)} 
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "15px",
              width: "250px",
              textAlign: "center",
              margin: "auto",
              opacity: visibleCourses[index] ? 1 : 0,
              transform: visibleCourses[index]
                ? "translateY(0)"
                : "translateY(20px)",
              transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
            }}
          >
            <img
              src={`/images/${course.image}`}
              alt={course.nameCourse}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "5px",
              }}
              loading="lazy"
            />
            <h2>{course.nameCourse}</h2>
            <p>{course.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllCourses;
