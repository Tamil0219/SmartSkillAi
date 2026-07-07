import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  ArrowRight, 
  Activity,
  Zap,
  ChevronDown
} from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!name || !email || !password) {
      setError("Compliance failure: Missing telemetry data.");
      setLoading(false);
      return;
    }

    // Client-side password validation — mirrors backend regex exactly
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&).");
      setLoading(false);
      return;
    }

    try {
      const response = await API.post("/auth/register", {
        name,
        email,
        password,
        role
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      const userRole = response.data.user.role;
      setTimeout(() => {
        if (userRole === "admin") navigate("/admin/dashboard");
        else if (userRole === "mentor") navigate("/mentor/dashboard");
        else if (userRole === "student") navigate("/student");
        else navigate("/login");
      }, 800);
    } catch (error) {
      const message = error?.response?.data?.message || "Registration sequence failed.";
      setError(message);
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-brand-background overflow-hidden px-4 py-12">
      {/* Background FX */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-crystal/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 blur-[150px]" />
      </div>

      <div className="relative w-full max-w-lg animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-8 space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-brand-crystal/10 flex items-center justify-center text-brand-crystal border border-brand-crystal/20">
            <Zap className="w-8 h-8" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">
            Protocol <span className="text-brand-crystal">Initiation</span>
          </h1>
          <p className="text-[10px] font-bold tracking-[0.3em] text-brand-text-secondary uppercase">Secure Learning Node Entry</p>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-white/5 bg-brand-sidebar/40 p-10 shadow-[0_30px_100px_rgba(0,0,0,0.4)] backdrop-blur-3xl">
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary ml-1">Identity</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary group-focus-within:text-brand-crystal transition-colors" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    placeholder="Subject Name"
                    className="w-full h-12 rounded-xl border border-white/5 bg-white/5 pl-12 pr-4 text-xs font-medium text-white placeholder:text-brand-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-crystal/30 focus:bg-white/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary group-focus-within:text-brand-crystal transition-colors" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="name@example.com"
                    className="w-full h-12 rounded-xl border border-white/5 bg-white/5 pl-12 pr-4 text-xs font-medium text-white placeholder:text-brand-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-crystal/30 focus:bg-white/10 transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary ml-1">Encryption</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary group-focus-within:text-brand-crystal transition-colors" />
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Secure Key"
                    className="w-full h-12 rounded-xl border border-white/5 bg-white/5 pl-12 pr-4 text-xs font-medium text-white placeholder:text-brand-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-brand-crystal/30 focus:bg-white/10 transition-all"
                    required
                  />
                </div>
                {password && (
                  <div className="text-[8px] text-brand-text-secondary bg-brand-sidebar/30 p-2 rounded border border-brand-crystal/10">
                    <p className="font-bold mb-1">🔐 Requirements:</p>
                    <ul className="space-y-0.5">
                      <li className={password.length >= 8 ? "text-brand-crystal" : "text-brand-text-secondary"}>✓ Minimum 8 characters</li>
                      <li className={/[a-z]/.test(password) ? "text-brand-crystal" : "text-brand-text-secondary"}>✓ Lowercase letter (a-z)</li>
                      <li className={/[A-Z]/.test(password) ? "text-brand-crystal" : "text-brand-text-secondary"}>✓ Uppercase letter (A-Z)</li>
                      <li className={/\d/.test(password) ? "text-brand-crystal" : "text-brand-text-secondary"}>✓ Number (0-9)</li>
                      <li className={/[@$!%*?&]/.test(password) ? "text-brand-crystal" : "text-brand-text-secondary"}>✓ Special char (@$!%*?&)</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary ml-1">Access Level</label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-12 rounded-xl border border-white/5 bg-white/5 px-4 pr-10 text-xs font-medium text-brand-crystal focus:outline-none focus:ring-2 focus:ring-brand-crystal/30 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="admin">ADMIN PROTOCOL</option>
                    <option value="mentor">MENTOR PROTOCOL</option>
                    <option value="student">STUDENT PROTOCOL</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-crystal pointer-events-none" />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-[10px] font-black text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 italic">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl bg-brand-crystal h-14 font-black uppercase italic tracking-widest text-black transition-all hover:shadow-[0_0_30px_rgba(0,229,255,0.4)] disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <Activity className="w-5 h-5 animate-spin" />
                ) : (
                  <>Register Node <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold text-brand-text-secondary uppercase tracking-widest leading-loose">
              Existing Node?{' '}
              <Link to="/login" className="text-brand-crystal hover:brightness-110 transition-all">
                Enter Terminal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

