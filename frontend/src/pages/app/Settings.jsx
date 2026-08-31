import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Lock,
  Wallet,
  LogOut,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  Settings as SettingsIcon,
} from "lucide-react";

const Settings = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();

  // 👤 Profile
  const [name, setName] = useState(user?.user?.name || "");
  const [profileLoading, setProfileLoading] = useState(false);

  // 🔐 Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  // 💰 Budget
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [budgetLoading, setBudgetLoading] = useState(false);

  // 🚪 Logout confirm
  const [confirmLogout, setConfirmLogout] = useState(false);

  // 👤 Update username (LOGIC UNTOUCHED)
  const updateProfile = async (e) => {
    e.preventDefault();

    const oldName = user?.user?.name;

    try {
      setProfileLoading(true);

      const res = await api.put("/auth/update-profile", { name });

      const newName = res.data?.user?.name || name;

      toast.success(`Username updated from "${oldName}" → "${newName}" 🎉`);

      // ✅ Update AuthContext so UI reflects new name everywhere
      setUser((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          name: newName,
        },
      }));
    } catch (err) {
    } finally {
      setProfileLoading(false);
    }
  };

  // 🔐 Change password (LOGIC UNTOUCHED)
  const changePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setPassLoading(true);

      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      toast.success("Password changed successfully 🔒 Please login again");

      // logout after success
      logout();
      navigate("/login");
    } catch (err) {
      // toast.error(err.response?.data?.message || "Password change failed ❌");
    } finally {
      setPassLoading(false);
    }
  };

  // 💰 Update monthly budget (LOGIC UNTOUCHED)
  const updateBudget = async (e) => {
    e.preventDefault();
    try {
      setBudgetLoading(true);
      await api.put("/budgets/monthly", { monthlyBudget });
      toast.success("Monthly budget updated 💰");
    } catch (err) {
      toast.error(err.response?.data?.message || "Budget update failed");
    } finally {
      setBudgetLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-purple-400" />
            <span>Settings</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Manage your account credentials, security details, and financial
            caps
          </p>
        </div>
      </div>

      {/* 👤 Account Details Panel */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <User className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Account Details</h3>
        </div>

        {/* Disabled Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Registered Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={user?.user?.email || ""}
              disabled
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/40 border border-slate-800 text-slate-400 cursor-not-allowed text-sm outline-none"
            />
          </div>
        </div>

        {/* Profile Update Form */}
        <form onSubmit={updateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <button
            disabled={profileLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {profileLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Update Username</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 🔐 Change Password Panel */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Security & Password</h3>
        </div>

        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 select-none">
            <input
              type="checkbox"
              id="showPass"
              checked={showPass}
              onChange={() => setShowPass(!showPass)}
              className="rounded bg-slate-800 border-slate-700 text-purple-600 focus:ring-purple-500/20 cursor-pointer"
            />
            <label
              htmlFor="showPass"
              className="cursor-pointer flex items-center gap-1.5"
            >
              {showPass ? (
                <EyeOff className="w-3.5 h-3.5" />
              ) : (
                <Eye className="w-3.5 h-3.5" />
              )}
              <span>Show password characters</span>
            </label>
          </div>

          <button
            disabled={passLoading}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {passLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Changing...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Change Password</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 💰 Monthly Budget Panel */}
      <div className="bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">
            Monthly Budget Threshold
          </h3>
        </div>

        <form onSubmit={updateBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Monthly Limit ($)
            </label>
            <div className="relative">
              <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                placeholder="Enter monthly budget ceiling"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          <button
            disabled={budgetLoading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {budgetLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4" />
                <span>Save Budget Limit</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 🚪 Logout Danger Zone Panel */}
      <div className="bg-slate-900/60 border border-rose-500/20 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-lg font-bold text-rose-400 flex items-center gap-2">
            <LogOut className="w-5 h-5" />
            <span>Session Management</span>
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            End your active user session securely on this device.
          </p>
        </div>

        <button
          onClick={() => setConfirmLogout(true)}
          className="px-6 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout Account</span>
        </button>
      </div>

      {/* 🚪 Logout Confirmation Modal */}
      <AnimatePresence>
        {confirmLogout && (
          <motion.div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmLogout(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                Confirm Logout
              </h3>
              <p className="text-slate-400 text-xs mb-6">
                Are you sure you want to end your current session?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={logout}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/20 transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
