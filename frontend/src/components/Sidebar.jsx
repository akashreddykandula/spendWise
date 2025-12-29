import {NavLink, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import {useState} from 'react';

const Sidebar = ({open, setOpen}) => {
  const {logout} = useAuth ();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState (false);

  const navigate = useNavigate ();
  const links = [
    {to: '/app', label: 'Dashboard', icon: '📊'},
    {to: '/app/transactions', label: 'Transactions', icon: '💸'},
    {to: '/app/analytics', label: 'Analytics', icon: '📈'},
    {to: '/app/reports', label: 'Reports', icon: '📄'},
    {to: '/app/settings', label: 'Settings', icon: '⚙️'},
  ];


  const handleClick = () => {
    // ✅ auto close sidebar on mobile
    if (window.innerWidth < 640) {
      setOpen (false);
    }
  };

  return (
    <aside
      className={`fixed sm:static z-50 inset-y-0 left-0 w-64 bg-gradient-to-b from-[#140c2b] to-[#0b0614]
      border-r border-white/10 transform ${open ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 transition-transform duration-300`}
    >
      {/* Logo */}
      <div className="p-5 text-2xl font-extrabold text-pink-400 tracking-wide">
        SpendWise
      </div>

      {/* Links */}
      <nav className="px-3 space-y-1">
        {links.map (l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/app'}
            onClick={handleClick}
            className={({isActive}) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-medium ${isActive ? 'bg-pink-500/20 text-pink-300 shadow' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
          >
            <span className="text-lg">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 w-full px-3">
        <button
          onClick={() => setShowLogoutConfirm (true)}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 transition"
        >
          🚪 Logout
        </button>
        {
  showLogoutConfirm &&
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#120a1f] rounded-2xl p-6 w-[90%] max-w-sm border border-white/10 shadow-xl">
        <h3 className="text-lg font-bold mb-2">Confirm Logout</h3>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to logout?
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setShowLogoutConfirm (false)}
            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Cancel
          </button>
          <button
            onClick={logout}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
}
{
  showLogoutConfirm &&
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-[#120a1f] rounded-2xl p-6 w-[90%] max-w-sm border border-white/10 shadow-xl">
        <h3 className="text-lg font-bold mb-2">Confirm Logout</h3>
        <p className="text-gray-400 text-sm mb-6">
          Are you sure you want to logout?
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => setShowLogoutConfirm (false)}
            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            Cancel
          </button>
          <button
            onClick={logout}
            className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
}


      </div>
    </aside>
  );
};

export default Sidebar;
