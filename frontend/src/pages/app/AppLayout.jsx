import {Outlet} from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Topbar from '../../components/Topbar';
import {useState} from 'react';

const AppLayout = () => {
  const [open, setOpen] = useState (false);

  return (
    <div className="min-h-screen flex bg-[#0b0614] text-white relative overflow-hidden">
      {/* 🔳 Overlay for mobile */}
      {open &&
        <div
          onClick={() => setOpen (false)}
          className="fixed inset-0 bg-black/50 z-40 sm:hidden"
        />}

      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar setOpen={setOpen} />
        <main className="flex-1 p-4 sm:p-6 bg-[#0b0614] overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
