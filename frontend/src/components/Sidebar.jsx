import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserCircle,
  BarChart3,
  Settings,
  BookOpen,
  GraduationCap,
  FileText,
  Zap,
} from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  let role = "guest";

  if (userStr) {
    try {
      role = JSON.parse(userStr).role;
    } catch (e) {
      console.error(e);
    }
  }

  const menuConfigs = {
    admin: [
      { label: "Overview", to: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Mentors", to: "/admin/mentors", icon: UserCircle },
      { label: "Students", to: "/admin/students", icon: Users },
      { label: "Intelligence", to: "/admin/analytics", icon: BarChart3 },
      { label: "Config", to: "/admin/settings", icon: Settings },
    ],
    mentor: [
      { label: "Dashboard", to: "/mentor/dashboard", icon: LayoutDashboard },
      { label: "Cohort", to: "/mentor/students", icon: Users },
      { label: "Learning Paths", to: "/mentor/courses", icon: BookOpen },
      { label: "Analytics", to: "/mentor/analytics", icon: BarChart3 },
    ],
    student: [
      { label: "Terminal", to: "/student", icon: LayoutDashboard },
      { label: "Courses", to: "/courses", icon: GraduationCap },
      { label: "Assessments", to: "/exam", icon: FileText },
      { label: "AI Tutor", to: "/student/chatbot", icon: Zap },
      { label: "Results", to: "/results", icon: BarChart3 },
    ],
  };

  const menuItems = menuConfigs[role] || [];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="hidden min-h-screen w-72 flex-col border-r border-white/10 bg-brand-sidebar/95 shadow-[18px_0_60px_rgba(0,0,0,0.25)] backdrop-blur-2xl md:flex">
      <div className="px-7 py-8">
        <div className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-white/5 p-3 shadow-glowSoft">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] via-[#1DA1FF] to-[#24E0FF] text-white shadow-[0_0_20px_rgba(29,161,255,0.35)]">
            <Zap className="h-6 w-6" fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black uppercase tracking-[0.24em] text-white">
              Smart<span className="text-brand-cyan">Eval</span>
            </h1>
            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-brand-text-secondary/80">
              AI Command Center
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-2 px-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-[1.1rem] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[#4F46E5] via-[#1DA1FF] to-[#24E0FF] text-white shadow-[0_0_25px_rgba(29,161,255,0.25)]"
                  : "text-brand-text-secondary hover:bg-white/[0.05] hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-4 w-4 transition-colors ${isActive ? "text-white" : "text-brand-text-secondary group-hover:text-white"}`}
                />
                <span className="relative z-10">{item.label}</span>
                {isActive && <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.4)]" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}

