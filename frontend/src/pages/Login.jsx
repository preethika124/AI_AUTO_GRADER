import React, { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

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

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    setLoading(true);

    try {
      await API.post("/auth/login", {
        email,
        password,
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || "Login failed";
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
          Teacher Login
        </h2>

        <input
          className="input w-full mb-4"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="mb-6">
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

        <button
          onClick={handleLogin}
          className="btn w-full"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-slate-300 text-sm mt-5">
          New teacher?{" "}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold">
            Create account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
