import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const Settings = () => {
  
  const { user, logout, setUser } = useAuth();
 // console.log ('User in settings:', user); // 👈 ADD THIS LINE


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

 // 👤 Update username
const updateProfile = async (e) => {
  e.preventDefault();

  const oldName = user?.user?.name; // 👈 get old name from context

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


  // 🔐 Change password
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


  // 💰 Update monthly budget
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
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl sm:text-3xl font-bold">⚙️ Settings</h2>

      {/* 👤 User Info */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Account Details</h3>

        <div>
          <label className="text-sm text-gray-400">Email</label>
          <input
            value={user?.user?.email || ""}
            disabled
            className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-gray-400 cursor-not-allowed"
          />
        </div>

        <form onSubmit={updateProfile} className="space-y-3">
          <div>
            <label className="text-sm text-gray-400">Username</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-white/10 text-white outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <button
            disabled={profileLoading}
            className="bg-pink-500 px-5 py-2 rounded-xl font-semibold"
          >
            {profileLoading ? "Updating..." : "Update Username"}
          </button>
        </form>
      </div>

      {/* 🔐 Change Password */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Change Password</h3>

        <form onSubmit={changePassword} className="space-y-3">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none"
          />
          <input
            type={showPass ? "text" : "password"}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none"
          />

          <div className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={showPass}
              onChange={() => setShowPass(!showPass)}
            />
            Show passwords
          </div>

          <button
            disabled={passLoading}
            className="bg-purple-500 px-5 py-2 rounded-xl font-semibold"
          >
            {passLoading ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>

      {/* 💰 Budget */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Monthly Budget</h3>

        <form onSubmit={updateBudget} className="space-y-3">
          <input
            type="number"
            placeholder="Enter monthly budget"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/10 text-white outline-none"
          />
          <button
            disabled={budgetLoading}
            className="bg-emerald-500 px-5 py-2 rounded-xl font-semibold"
          >
            {budgetLoading ? "Saving..." : "Save Budget"}
          </button>
        </form>
      </div>

      {/* 🚪 Logout */}
      <div className="bg-white/5 border border-red-500/30 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-red-400">Logout</h3>
        <button
          onClick={() => setConfirmLogout(true)}
          className="bg-red-500 px-6 py-2 rounded-xl font-semibold"
        >
          Logout
        </button>
      </div>

      {/* 🚪 Logout Confirm Modal */}
      <AnimatePresence>
        {confirmLogout && (
          <motion.div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#120a1f] p-6 rounded-2xl w-[90%] max-w-sm border border-white/10"
            >
              <h3 className="text-lg font-semibold mb-3">
                Confirm Logout
              </h3>
              <p className="text-gray-400 mb-5">
                Are you sure you want to logout?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 py-2 rounded-xl bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={logout}
                  className="flex-1 py-2 rounded-xl bg-red-500 font-semibold"
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
