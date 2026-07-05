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
    <div className="min-h-screen bg-brand-background">
      <div className="relative flex">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Navbar onToggleSidebar={() => setShowSidebar((prev) => !prev)} />
          <main className="flex-1 px-4 pb-10 pt-6 md:px-8">
            <Outlet />
          </main>
        </div>

        {showSidebar && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setShowSidebar(false)}>
            <div className="absolute left-0 top-0 h-full w-72">
              <Sidebar />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
