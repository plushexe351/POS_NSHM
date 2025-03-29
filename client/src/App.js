import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import AdminDashboard from "./components/AdminDashboard";
import RegisterForm from "./components/RegisterForm";
// import "./App.scss";
import "./styles.scss";
import AdminLogin from "./components/AdminLogin";
import { toast, ToastContainer } from "react-toastify";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Redirect root to /dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register/request" element={<RegisterForm />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </div>
      <ToastContainer
        position="bottom-center"
        theme="light"
        closeButton={false}
        autoClose={3000}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;
