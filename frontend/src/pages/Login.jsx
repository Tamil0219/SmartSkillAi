import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldAlert, 
  Zap,
  Activity
} from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();

    if (!normalizedEmail || !normalizedPassword) {
      setError("Identification required.");
      setLoading(false);
      return;
    }

    try {
      const response = await API.post("/auth/login", {
        email: normalizedEmail,
        password: normalizedPassword,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const userRole = response.data.user.role;
      
      // Artificial delay for futuristic transition feel
      setTimeout(() => {
        if (userRole === "admin") navigate("/admin/dashboard");
        else if (userRole === "mentor") navigate("/mentor/dashboard");
        else if (userRole === "student") navigate("/student");
        else navigate("/login");
      }, 800);

    } catch (error) {
      const message = error?.response?.data?.message || "Authentication failed. Check credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-brand-background overflow-hidden px-4">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-crystal/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-700">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 space-y-4">
          <div className="h-20 w-20 rounded-[2rem] bg-brand-crystal/20 flex items-center justify-center text-brand-crystal shadow-[0_0_40px_rgba(0,229,255,0.3)] border border-brand-crystal/30">
            <Zap className="w-10 h-10" fill="currentColor" />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">
              Skill<span className="text-brand-crystal">Matrix</span> AI
            </h1>
            <p className="text-[10px] font-bold tracking-[0.4em] text-brand-text-secondary uppercase mt-1">Intelligent Assessment Protocol</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-brand-sidebar/40 p-10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] backdrop-blur-3xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">System Login</h2>
            <p className="text-xs text-brand-text-secondary mt-1">Authorized personnel only. Access level encrypted.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary ml-1">Email Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary group-focus-within:text-brand-crystal transition-colors" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="admin@skillmatrix.ai"
                  className="w-full h-14 rounded-2xl border border-white/5 bg-white/5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-brand-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-crystal/30 focus:bg-white/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary ml-1">Security Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary group-focus-within:text-brand-crystal transition-colors" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-14 rounded-2xl border border-white/5 bg-white/5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-brand-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-crystal/30 focus:bg-white/10 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-xl bg-red-500/10 p-4 border border-red-500/20 text-xs font-bold text-red-400 animate-in slide-in-from-top-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-brand-crystal h-14 font-black uppercase italic tracking-widest text-black transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] disabled:opacity-50 active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <Activity className="w-5 h-5 animate-spin" />
                ) : (
                  <>Initialise Session <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
            <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest">
              No clearance?{' '}
              <Link to="/register" className="text-brand-crystal hover:brightness-110 transition-all">
                Request Entry
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-brand-text-secondary uppercase tracking-[0.5em] font-black opacity-30">
          Tom AI © 2026 Secured Layer
        </p>
      </div>
    </div>
  );
}

