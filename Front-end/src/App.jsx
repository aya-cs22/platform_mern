import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./DashboardAdmin/context/AuthContext "; // استيراد السياق

// Dashboard
import Dashboard from "./DashboardAdmin/Dashboard/Dashboard";
import Error from "./DashboardAdmin/Error";
import DashboardIndex from "./DashboardAdmin/Dashboard/DashboardIndex";

// Group
import NewGroup from "./DashboardAdmin/Gruops/NewGroup";
import AllGroups from "./DashboardAdmin/Gruops/AllGroups";
import DetailsGroup from "./DashboardAdmin/Gruops/DetailsGroup";
import UpdateGroup from "./DashboardAdmin/Gruops/UpdateGroup";

// Tasks
import Tasks from "./DashboardAdmin/Tasks/Tasks";
import NewTask from "./DashboardAdmin/Tasks/NewTask";

// Students
import AllStudents from "./DashboardAdmin/Students/AllStudents";
import Students from "./DashboardAdmin/Students/Students";
import DetailsStudent from "./DashboardAdmin/Students/DetailsStudent";

// Lectures
import Lectures from "./DashboardAdmin/Lectures/Lectures";
import UpdateLecture from "./DashboardAdmin/Lectures/UpdateLecture";

// Emails
import EmailReq from "./DashboardAdmin/Emails/EmailReq";

// User Pages
import Register from "./Users/Register/Register";
import Login from "./Users/Login/Login";
import ForgetPass from "./Users/Register/ForgetPass";
import Layout from "./Users/Layout/Layout";
import Main from "./Users/Layout/Main";
import Courses from "./Users/Lecture/Courses";
import AddTask from "./Users/Lecture/AddTask";
import Profile from "./Users/Profile/Profile";
import AddFeedback from "./Users/FeedBack/AddFeedback";
import AllCourses from "./Users/Lecture/AllCourses";
import Contact from "./Users/Contact/Contact";
import Notification from "./Users/Notification/Notification";

// PrivateRoute
import PrivateRoute from "./DashboardAdmin/PrivateRoute";

const helmetContext = {};

function App() {
  const router = createBrowserRouter([
    {
      path: "/login/admin",
      element: <Login />,
    },
    {
      path: "/admin",
      element: <PrivateRoute element={<Dashboard />} />,
      children: [
        {
          index: true,
          element: <DashboardIndex />,
        },
        {
          path: "newGroup",
          element: <NewGroup />,
        },
        {
          path: "allGroups",
          element: <AllGroups />,
        },
        {
          path: "allStudent",
          element: <AllStudents />,
        },
        {
          path: "/admin/student/:studentId",
          element: <DetailsStudent />,
        },
        {
          path: "/admin/emails",
          element: <EmailReq />,
        },
        {
          path: "/admin/:groupId",
          element: <DetailsGroup />,
          children: [
            {
              path: "/admin/:groupId/tasks",
              element: <Tasks />,
            },
            {
              path: "/admin/:groupId/tasks/addTask",
              element: <NewTask />,
            },
            {
              path: "/admin/:groupId/students",
              element: <Students />,
            },
            {
              path: "/admin/:groupId/lectures",
              element: <Lectures />,
            },
            {
              path: "/admin/:groupId/update",
              element: <UpdateGroup />,
            },
            {
              path: "/admin/:groupId/lectures/update/:lectureId",
              element: <UpdateLecture />,
            },
            {
              path: "/admin/:groupId/lectures/newTask/:lectureId",
              element: <NewTask />,
            },
          ],
        },
      ],
    },
    {
      path: "/Register",
      element: <Register />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/forgetpassword",
      element: <ForgetPass />,
    },
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          index: true,
          element: <Main />,
        },
        {
          path: "/all-courses",
          element: <AllCourses />,
        },
        {
          path: "/my-courses",
          element: <Courses />,
        },
        {
          path: "/feedback",
          element: <AddFeedback />,
        },
        {
          path: "/contact",
          element: <Contact />,
        },
        {
          path: "/Add-Task",
          element: <AddTask />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
        {
          path: "/notification",
          element: <Notification />,
        },
      ],
    },
    {
      path: "*",
      element: <Error />,
    },
  ]);

  return (
    <AuthProvider>
      <HelmetProvider context={helmetContext}>
        <RouterProvider router={router} />
      </HelmetProvider>
    </AuthProvider>
  );
}

export default App;
