import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  User,
  Search,
  ShieldCheck,
  Layers,
  GraduationCap,
  Settings,
} from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const userData = JSON.parse(localStorage.getItem("user")) || { name: "User", role: "guest" };
  const profilePath = userData.role === "admin"
    ? "/admin/profile"
    : userData.role === "mentor"
    ? "/mentor/profile"
    : null;

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getRoleIcon = () => {
    switch (userData.role) {
      case "admin": return <ShieldCheck className="h-4 w-4 text-brand-cyan" />;
      case "mentor": return <Layers className="h-4 w-4 text-brand-cyan" />;
      default: return <GraduationCap className="h-4 w-4 text-brand-cyan" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between gap-4 border-b border-white/10 bg-brand-navbar/80 px-4 backdrop-blur-2xl md:px-8">
      <div className="flex flex-1 items-center gap-4">
        <button
          type="button"
          className="flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 transition-all hover:bg-white/[0.08] md:hidden"
          onClick={onToggleSidebar}
        >
          <div className="h-0.5 w-6 bg-brand-cyan" />
          <div className="h-0.5 w-4 bg-brand-cyan" />
          <div className="h-0.5 w-6 bg-brand-cyan" />
        </button>

        <div className="group relative w-full max-w-xl">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary transition-colors group-focus-within:text-brand-cyan" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search intelligence system..."
            className="h-12 w-full rounded-[1.25rem] border border-white/10 bg-white/[0.05] pl-12 pr-4 text-sm font-medium text-white placeholder:text-brand-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:bg-white/[0.08]"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {profilePath && (
          <button
            onClick={() => navigate(profilePath)}
            className="hidden items-center gap-2 rounded-[1.25rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-text-secondary transition-all hover:border-brand-cyan/30 hover:bg-brand-cyan/10 hover:text-white sm:flex"
          >
            <Settings className="h-4 w-4 text-brand-cyan" />
            Profile
          </button>
        )}

        <div className="hidden items-center gap-3 rounded-[1.25rem] border border-white/10 bg-white/[0.05] px-3 py-2 lg:flex">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10">
            <User className="h-5 w-5 text-brand-cyan" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-semibold leading-none text-white">{userData.name}</p>
            <div className="mt-1 flex items-center gap-1.5">
              {getRoleIcon()}
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-text-secondary">{userData.role}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex h-12 items-center gap-2 rounded-[1.25rem] border border-brand-cyan/25 bg-gradient-to-r from-[#6D5BFF] to-[#1DA1FF] px-5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(29,161,255,0.25)] transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
}

