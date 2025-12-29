import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      toast.success(res.data.message || "Password reset successful 🔐");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0614] text-white px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-8 rounded-2xl w-full max-w-md space-y-5"
      >
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-gray-300 text-sm">
          Enter your new password below.
        </p>

        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full px-4 py-3 rounded-lg bg-white/20 outline-none"
        />

        <button
          disabled={loading}
          className="w-full bg-pink-500 py-3 rounded-lg font-semibold"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
