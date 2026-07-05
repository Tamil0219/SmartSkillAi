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
  LogOut,
  Zap
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
    ]
  };

  const menuItems = menuConfigs[role] || [];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-72 min-h-screen bg-brand-sidebar border-r border-white/5 transition-all duration-500">
      {/* Brand Section */}
      <div className="px-8 py-10 flex items-center gap-3">
        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-crystal/20 text-brand-crystal shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <Zap className="w-6 h-6" fill="currentColor" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-[0.2em] text-white uppercase italic">
            Smart<span className="text-brand-crystal">Eval</span>
          </h1>
          <p className="text-[9px] font-bold text-brand-text-secondary uppercase tracking-widest opacity-50">V1.0 Neural Link</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `group relative flex items-center gap-4 py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                isActive
                  ? "bg-brand-crystal/5 text-brand-crystal shadow-[inset_0_0_20px_rgba(0,229,255,0.05)] border border-brand-crystal/10"
                  : "text-brand-text-secondary hover:text-white hover:bg-white/[0.02]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-4 h-4 ${isActive ? 'text-brand-crystal' : 'group-hover:text-white'} transition-colors`} />
                <span className="relative z-10 italic">{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 w-1 h-4 bg-brand-crystal rounded-r-full shadow-[0_0_10px_#00e5ff]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 mt-auto border-t border-white/5 space-y-4">
        <div className="px-4">
          <p className="text-[9px] font-bold text-brand-text-secondary uppercase tracking-[0.3em] opacity-30 text-center">Protocol Secured</p>
        </div>
      </div>
    </aside>
  );
}

