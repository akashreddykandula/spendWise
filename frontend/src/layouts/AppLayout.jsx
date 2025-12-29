import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";



const AppLayout = () => {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#0b0614] text-white">
      {/* Sidebar */}
      <div
        className={`fixed md:static z-40 inset-y-0 left-0 transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 w-64 bg-[#141414] border-r border-white/10`}
      >
        <div className="p-6 text-2xl font-bold text-pink-400">
          SpendWise
        </div>

        <nav className="px-4 space-y-2 text-sm">
          <Link to="/app" className="block px-4 py-3 rounded-lg hover:bg-white/10">
            📊 Dashboard
          </Link>
          <Link
            to="/app/transactions"
            className="block px-4 py-3 rounded-lg hover:bg-white/10"
          >
            💸 Transactions
          </Link>
          <Link
            to="/app/analytics"
            className="block px-4 py-3 rounded-lg hover:bg-white/10"
          >
            📈 Analytics
          </Link>
          <Link
            to="/app/settings"
            className="block px-4 py-3 rounded-lg hover:bg-white/10"
          >
            ⚙️ Settings
          </Link>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[#141414] border-b border-white/10">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden text-2xl"
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 hidden sm:block">
              {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
