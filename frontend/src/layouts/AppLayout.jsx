import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  WalletCards,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AppLayout = () => {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navigation = [
    {
      name: "Dashboard",
      path: "/app",
      icon: LayoutDashboard,
    },
    {
      name: "Transactions",
      path: "/app/transactions",
      icon: WalletCards,
    },
    {
      name: "Analytics",
      path: "/app/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      path: "/app/settings",
      icon: Settings,
    },
  ];

  const isActive = (path) => {
    if (path === "/app") {
      return location.pathname === "/app";
    }

    return location.pathname.startsWith(path);
  };

  const closeMobileMenu = () => {
    setOpen(false);
  };

  const userName = user?.user?.name || user?.name || "User";

  const initial = userName?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#0b0614] text-white">
      {/* ================= MOBILE SIDEBAR OVERLAY ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMobileMenu}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ================= SIDEBAR ================= */}
      <motion.aside
        initial={false}
        animate={{
          x: open ? 0 : undefined,
        }}
        className={`
          fixed
          inset-y-0
          left-0
          z-50
          w-64
          max-w-[85vw]
          bg-[#10091d]
          border-r
          border-white/10
          shadow-2xl
          transform
          transition-transform
          duration-300
          ease-out

          ${open ? "translate-x-0" : "-translate-x-full"}

          md:translate-x-0
        `}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10">
          <Link
            to="/app"
            onClick={closeMobileMenu}
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>

            <span className="text-xl font-extrabold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              SpendWise
            </span>
          </Link>

          {/* Mobile close */}
          <button
            onClick={closeMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobileMenu}
                className={`
                  relative
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  text-sm
                  font-semibold
                  transition-all
                  duration-200

                  ${
                    active
                      ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-pink-400 to-purple-500" />
                )}

                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    active ? "text-pink-400" : "text-slate-500"
                  }`}
                />

                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-sm shrink-0">
              {initial}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {userName}
              </p>

              <p className="text-xs text-slate-500 truncate">
                {user?.user?.email || user?.email || ""}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* ================= MAIN AREA ================= */}
      <div className="min-h-screen w-full md:pl-64">
        {/* ================= TOPBAR ================= */}
        <header className="sticky top-0 z-30 h-16 w-full bg-[#0f0919]/90 backdrop-blur-xl border-b border-white/10">
          <div className="h-full w-full px-4 sm:px-6 flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile menu */}
              <button
                onClick={() => setOpen(true)}
                className="md:hidden shrink-0 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                aria-label="Open sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 min-w-0">
                <div className="hidden sm:flex w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-pink-500 items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>

                <h1 className="text-sm sm:text-lg font-bold truncate bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  SpendWise Dashboard
                </h1>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="hidden sm:block text-sm text-slate-300">
                Hi, <span className="font-semibold text-white">{userName}</span>
              </span>

              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center font-bold text-sm border border-white/20 shadow-lg shadow-purple-500/10">
                {initial}
              </div>
            </div>
          </div>
        </header>

        {/* ================= PAGE CONTENT ================= */}
        <main
          className="
            w-full
            min-w-0
            min-h-[calc(100vh-4rem)]
            overflow-x-hidden
            px-3
            py-4
            sm:px-5
            sm:py-6
            lg:px-8
            lg:py-8
          "
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="w-full min-w-0"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
