import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const strength = (pwd) => {
  if (pwd.length < 6) return 1;

  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd)) {
    return 4;
  }

  if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
    return 3;
  }

  return 2;
};

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const level = strength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) return;

    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // Backend returns:
      // { token, user }
      const data = res.data;

      const authData = {
        token: data.token,
        user: data.user || {
          _id: data._id,
          name: data.name || name.trim(),
          email: data.email || email.trim().toLowerCase(),
          monthlyBudget: data.monthlyBudget || 0,
        },
      };

      const loggedIn = login(authData);

      if (!loggedIn) {
        throw new Error("Invalid registration response");
      }

      toast.success("Account created successfully 🎉");

      // Go directly to the app
      navigate("/app", { replace: true });
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);

      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStrengthLabel = () => {
    if (!password) return "";
    if (level === 1) return "Weak password";
    if (level === 2) return "Fair password";
    if (level === 3) return "Good password";
    return "Strong password";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl grid md:grid-cols-12 rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl"
      >
        {/* Left Side: Form Controls */}
        <div className="md:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              SpendWise
            </span>
          </div>

          <div className="mb-8 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              Create Account
            </h2>
            <p className="text-slate-400 text-sm">
              Start tracking expenses with smart insights today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShow((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-3 space-y-1.5">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          level >= i
                            ? i <= 2
                              ? "bg-rose-500"
                              : i === 3
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                            : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Strength</span>
                    <span
                      className={`font-medium ${
                        level <= 2
                          ? "text-rose-400"
                          : level === 3
                            ? "text-amber-400"
                            : "text-emerald-400"
                      }`}
                    >
                      {getStrengthLabel()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-slate-400 mt-8 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline-offset-4 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>

        {/* Right Side: Hero Visual Panel */}
        <div className="hidden md:col-span-5 md:flex flex-col justify-between p-10 bg-gradient-to-br from-purple-900/40 via-purple-950/60 to-slate-950 border-l border-slate-800/80 relative overflow-hidden">
          {/* Decorative ambient background shape */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Logo */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
              SpendWise
            </span>
          </div>

          {/* Center Copy */}
          <div className="relative z-10 my-auto py-12">
            <h3 className="text-3xl font-bold text-white mb-4 leading-tight">
              Control your money, <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                elevate your life.
              </span>
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Join thousands managing expenses smarter with real-time financial
              insights and custom budgets.
            </p>
          </div>

          {/* Bottom Card Preview Graphic */}
          <div className="relative z-10 bg-slate-800/40 border border-slate-700/50 backdrop-blur-md rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400 font-medium">
                Monthly Savings
              </span>
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-400/10 px-2 py-0.5 rounded-full">
                +18.4%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-3/4 rounded-full" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
