import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axios";

const strength = (pwd) => {
  if (pwd.length < 6) return 1;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) return 4;
  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return 3;
  return 2;
};

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const level = strength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      toast.success("Account created successfully 🎉");
      navigate("/login");
    }catch (err) {
  console.log("Register error:", err.response?.data || err.message);
  toast.error(err.response?.data?.message || "Registration failed");
}
finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-fuchsia-600 to-pink-600 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Left */}
        <div className="bg-purple-500 p-6 sm:p-10 text-white flex flex-col justify-center min-h-screen md:min-h-full">
          {/* 📱 Mobile Logo */}
          <div className="md:hidden text-center mb-6">
            <h1 className="text-3xl font-extrabold">SpendWise</h1>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center md:text-left">
            Create Account
          </h2>
          <p className="text-purple-100 mb-8 text-center md:text-left">
            Sign up for your SpendWise account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full px-4 py-3 rounded-xl bg-purple-400/50 text-white outline-none focus:ring-2 focus:ring-pink-400"
            />

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 rounded-xl bg-purple-400/50 text-white outline-none focus:ring-2 focus:ring-pink-400"
            />

            {/* Password + toggle */}
            <div>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pr-12 px-4 py-3 rounded-xl bg-purple-400/50 text-white outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {show ? "🙈" : "👁️"}
                </button>
              </div>

              {/* 🔒 Strength Meter */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded ${
                      level >= i
                        ? i <= 2
                          ? "bg-red-400"
                          : i === 3
                          ? "bg-yellow-400"
                          : "bg-green-400"
                        : "bg-white/30"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs mt-1 text-purple-100">
                {level === 1 && "Weak"}
                {level === 2 && "Fair"}
                {level === 3 && "Good"}
                {level === 4 && "Strong"}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 py-3 rounded-xl font-semibold shadow-lg transition"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </motion.button>
          </form>

          <p className="text-center text-purple-100 mt-6 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-white font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>

        {/* Right */}
        <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-[#3b0764] text-white relative">
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative text-center px-10">
            <h3 className="text-4xl font-extrabold mb-4">SpendWise</h3>
            <p className="text-gray-200 max-w-sm">
              Join thousands managing expenses smarter with insights and budgets.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
