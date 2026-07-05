import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setShowSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(29,161,255,0.18),_transparent_32%),linear-gradient(135deg,_#070B1D_0%,_#0D1228_100%)]">
      <div className="relative flex min-h-screen">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-8rem] top-[-4rem] h-64 w-64 rounded-full bg-brand-cyan/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#7B4DFF]/10 blur-[140px]" />
        </div>

        <Sidebar />
        <div className="relative z-10 flex flex-1 flex-col">
          <Navbar onToggleSidebar={() => setShowSidebar((prev) => !prev)} />
          <main className="flex-1 px-4 pb-10 pt-6 md:px-8 lg:px-10">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>

        {showSidebar && (
          <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setShowSidebar(false)}>
            <div className="absolute left-0 top-0 h-full w-72">
              <Sidebar />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
