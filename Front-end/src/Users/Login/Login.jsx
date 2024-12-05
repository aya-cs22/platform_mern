import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { Helmet } from "react-helmet-async";
import "../Register/register.css";
import { DataContext } from "../Context/Context";

function Login() {
  const { URLAPI } = useContext(DataContext);
  const [login, setLogin] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);  // إضافة حالة التحميل
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);  // تفعيل التحميل عند بدء عملية الدخول
    try {
      const res = await axios.post(`${URLAPI}/api/users/login`, {
        email: login.email,
        password: login.password,
      });
      console.log(res);

      if (res.data) {
        toast.success("Login successful!");
        if (res.data.user.role === "admin") {
          localStorage.setItem("token", JSON.stringify(res.data.token));
          setTimeout(() => {
            navigate("/admin");
          }, 2000);
        } else {
          localStorage.setItem("token", JSON.stringify(res.data.token));
          localStorage.setItem("userId", JSON.stringify(res.data.user.id));
          setTimeout(() => {
            navigate("/");
          }, 2000);
        }
      } else {
        toast.error("Invalid email or password.");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        toast.error("Invalid email or password.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);  
    }
  };

  // Password Reset Handler
  const handleForgetPass = async (e) => {
    e.preventDefault();
    if (!login.email) {
      toast.error("Please enter your email.");
    } else {
      try {
        setLoading(true);
        await axios.post(`${URLAPI}/api/users/forgot-password`, {
          email: login.email,
        });
        toast.success("Password reset email sent. Please check your inbox.");
        navigate("/forgetpassword");
      } catch (error) {
        toast.error("Failed to send password reset email.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <ToastContainer />
      <Helmet>
        <title>Login</title>
      </Helmet>
      <div className="bg-form">
        <form className="p-3 rounded" onSubmit={handleLogin}>
          <h1 className="text-center">Login</h1>

          <input
            type="email"
            placeholder="Email"
            className="form-control border rounded mt-3"
            required
            onChange={(e) => setLogin({ ...login, email: e.target.value })}
            value={login.email}  
          />
          <input
            type="password"
            placeholder="Password"
            className="form-control border rounded mt-3"
            required
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
            value={login.password}  
          />

          <div className="mt-2 p-2">
            <button 
              className="btn btn-primary d-block w-100 m-auto" 
              disabled={loading}  
            >
              {loading ? "Logging in..." : "Submit"}  
            </button>
          </div>

          <Link
            to={"/register"}
            className="text-decoration-underline p-2 mt-2 text-light"
          >
            Sign up
          </Link>

          <button 
            onClick={handleForgetPass} 
            className="btn mt-2"
            disabled={loading}  
          >
            Forgot Password
          </button>
        </form>
      </div>
    </>
  );
}

export default Login;
