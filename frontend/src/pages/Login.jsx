import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const inputAnim = {
  focus: { scale: 1.02 },
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    console.log("Login payload:", { email, password });

    const res = await api.post("/auth/login", { email, password });
    console.log("Login API response:", res.data);

    login(res.data);
    navigate("/app");
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#6d28d9] via-[#9333ea] to-[#c026d3] px-4 relative">
      <div className="absolute inset-0 bg-black/40 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-2xl border border-white/20"
      >
        {/* Left */}
        <div className="p-6 sm:p-10 text-white flex flex-col justify-center min-h-screen md:min-h-full">
          {/* 📱 Mobile Logo */}
          <div className="md:hidden text-center mb-6">
            <h1 className="text-3xl font-extrabold">SpendWise</h1>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center md:text-left">
            Welcome Back
          </h2>
          <p className="text-gray-200 mb-8 text-center md:text-left">
            Login to your SpendWise account
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-400/30 text-red-200 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <motion.div whileFocus="focus" variants={inputAnim}>
              <label className="text-sm text-gray-200">Email</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">📧</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div whileFocus="focus" variants={inputAnim}>
              <label className="text-sm text-gray-200">Password</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2">🔒</span>
                <input
                  type={show ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Your Password"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                >
                  {show ? "🙈" : "👁️"}
                </button>
              </div>
            </motion.div>

            <div className="flex justify-end text-sm">
              <Link to="/forgot-password" className="text-pink-200 hover:underline">
                Forgot password?
              </Link>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 rounded-xl font-semibold shadow-lg transition"
            >
              {loading ? "Logging in..." : "Login"}
            </motion.button>
          </form>

          <p className="text-center text-gray-200 mt-6 text-sm">
            Don’t have an account?{" "}
            <Link to="/register" className="text-pink-300 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-[#3b0764] text-white relative">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative text-center px-10">
            <h3 className="text-4xl font-extrabold mb-4">SpendWise</h3>
            <p className="text-gray-200 max-w-sm">
              Smart expense tracking with analytics, budgets, receipts, and insights.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
