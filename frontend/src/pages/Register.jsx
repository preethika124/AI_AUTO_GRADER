import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const isStrongPassword = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(value);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await API.get("/auth/me");
        navigate("/dashboard", { replace: true });
      } catch (err) {
      }
    };

    checkAuth();
  }, [navigate]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!isStrongPassword(password)) {
      alert(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      );
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration successful. Please login.");
      navigate("/");
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || "Registration failed";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-slate-800 p-10 rounded-xl shadow-xl border border-slate-700 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Teacher Registration
        </h2>

        <input
          className="input w-full mb-4"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input w-full mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="mb-4">
          <input
            className="input w-full mb-2"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-sm text-slate-300 hover:text-white"
          >
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>

        <div className="mb-6">
          <input
            className="input w-full mb-2"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="text-sm text-slate-300 hover:text-white"
          >
            {showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Use at least 8 characters with uppercase, lowercase, number, and special character.
        </p>

        <button onClick={handleRegister} className="btn w-full" disabled={loading}>
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-slate-300 text-sm mt-5">
          Already registered?{" "}
          <Link to="/" className="text-blue-400 hover:text-blue-300 font-semibold">
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
