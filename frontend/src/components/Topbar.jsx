import { useAuth } from "../context/AuthContext";
import { Menu, Sparkles } from "lucide-react";

const Topbar = ({ setOpen }) => {
  const { user } = useAuth();
  const userName = user?.user?.name;
  const initial = userName?.[0]?.toUpperCase() || "U";

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 font-sans">
      {/* Mobile menu toggle */}
      <div className="flex items-center gap-3">
        <button
          className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle mobile sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="sm:hidden p-1.5 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SpendWise Dashboard
          </h1>
        </div>
      </div>

      {/* User profile dropdown info */}
      <div className="flex items-center gap-3">
        <span className="text-slate-300 text-sm font-medium hidden sm:block">
          Hi,{" "}
          <span className="text-white font-semibold">{userName || "User"}</span>
        </span>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-600/20 border border-white/20 select-none">
          {initial}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
