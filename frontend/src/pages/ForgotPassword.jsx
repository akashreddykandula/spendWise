import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import toast from "react-hot-toast";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await api.post("/auth/forgot-password", { email });
    toast.success(res.data.message || "Reset link sent to your email 📩");
    setSent(true);
  } catch (err) {
    console.error("Forgot password error:", err);
    toast.error(err.response?.data?.message || "Failed to send reset link");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 relative">
      <div className="absolute inset-0 bg-black/40 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md rounded-3xl shadow-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 text-white"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold">SpendWise</h1>
          <p className="text-gray-300 text-sm">Smart Expense Tracker</p>
        </div>

        {!sent ? (
          <>
            <h2 className="text-2xl font-bold mb-2 text-center">
              Forgot Password?
            </h2>
            <p className="text-gray-200 mb-6 text-center text-sm">
              Enter your email and we’ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm text-gray-200">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full mt-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 rounded-xl font-semibold shadow-lg transition"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-5xl">📩</div>
            <h2 className="text-2xl font-bold">Check your email</h2>
            <p className="text-gray-200 text-sm">
              We’ve sent a password reset link to:
            </p>
            <p className="font-semibold text-pink-300 break-all">{email}</p>
            <p className="text-gray-400 text-xs">
              Didn’t receive it? Check your spam folder.
            </p>
          </div>
        )}

        <p className="text-center text-gray-200 mt-6 text-sm">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-pink-300 font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
