import { useAuth } from "../context/AuthContext";

const Topbar = ({ setOpen }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-[#120a1f] border-b border-white/10 sticky top-0 z-30">
      {/* Mobile menu */}
      <button
        className="sm:hidden text-2xl text-white"
        onClick={() => setOpen((o) => !o)}
      >
        ☰
      </button>

      <h1 className="text-base sm:text-lg font-semibold tracking-wide">
        SpendWise Dashboard
      </h1>

      <div className="flex items-center gap-3">
        <span className="text-gray-300 text-sm hidden sm:block">
          Hi, {user?.user?.name}
        </span>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold shadow">
          {user?.user?.name?.[0]?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
