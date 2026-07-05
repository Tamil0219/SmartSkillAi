import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  User, 
  Search, 
  ShieldCheck, 
  Layers, 
  GraduationCap,
  Settings
} from "lucide-react";

export default function Navbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user")) || { name: "User", role: "guest" };
  const profilePath = userData.role === 'admin'
    ? '/admin/profile'
    : userData.role === 'mentor'
    ? '/mentor/profile'
    : null;

  const notifications = [
    { id: 1, title: "New Exam Released", time: "2m ago", type: "info" },
    { id: 2, title: "System Update Complete", time: "1h ago", type: "success" },
    { id: 3, title: "Performance Alert", time: "5h ago", type: "warning" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getRoleIcon = () => {
    switch(userData.role) {
      case 'admin': return <ShieldCheck className="w-4 h-4 text-brand-crystal" />;
      case 'mentor': return <Layers className="w-4 h-4 text-brand-crystal" />;
      default: return <GraduationCap className="w-4 h-4 text-brand-crystal" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between gap-6 bg-brand-background/80 px-8 backdrop-blur-xl border-b border-white/5">
      <div className="flex flex-1 items-center gap-6">
        <button
          type="button"
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
          onClick={onToggleSidebar}
        >
          <div className="h-0.5 w-6 bg-brand-crystal" />
          <div className="h-0.5 w-4 bg-brand-crystal" />
          <div className="h-0.5 w-6 bg-brand-crystal" />
        </button>
        
        <div className="relative w-full max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary group-focus-within:text-brand-crystal transition-colors" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Intelligence System..."
            className="w-full h-12 rounded-[1.25rem] border border-white/5 bg-white/5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-brand-text-secondary placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-brand-crystal/30 focus:bg-white/10 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {profilePath && (
          <button
            onClick={() => navigate(profilePath)}
            className="hidden sm:flex items-center gap-2 rounded-[1.25rem] border border-white/5 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-brand-text-secondary hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <Settings className="w-4 h-4 text-brand-crystal" />
            Profile
          </button>
        )}
        <div className="hidden lg:flex items-center gap-4 py-1.5 pl-1.5 pr-4 rounded-[1.25rem] bg-white/5 border border-white/5">
          <div className="h-10 w-10 overflow-hidden rounded-xl bg-brand-crystal/10 flex items-center justify-center border border-brand-crystal/20">
            <User className="w-5 h-5 text-brand-crystal" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-black text-white tracking-tight leading-none mb-1">{userData.name}</p>
            <div className="flex items-center gap-1.5 grayscale opacity-70">
              {getRoleIcon()}
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">{userData.role}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex h-12 items-center gap-2 rounded-[1.25rem] bg-brand-crystal/10 px-6 text-sm font-bold text-brand-crystal border border-brand-crystal/30 hover:bg-brand-crystal/20 transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">EXIT SYSTEM</span>
        </button>
      </div>
    </header>
  );
}

