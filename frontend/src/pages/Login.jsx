import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../services/api";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldAlert,
  Zap,
  Activity,
  Sparkles,
  Cpu,
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(29,161,255,0.22),_transparent_36%),linear-gradient(135deg,_#070B1D_0%,_#0D1228_100%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-[-10%] h-56 w-56 rounded-full bg-brand-cyan/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-8%] h-64 w-64 rounded-full bg-[#7B4DFF]/20 blur-[140px]" />
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative flex w-full max-w-6xl flex-col overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-2xl lg:flex-row">
        <motion.div initial={{ opacity: 0, x: -25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="flex-1 p-8 sm:p-10 lg:p-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4F46E5] via-[#1DA1FF] to-[#24E0FF] text-white shadow-[0_0_24px_rgba(29,161,255,0.3)]">
              <Zap className="h-6 w-6" fill="currentColor" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-brand-text-secondary">Secure access</p>
              <h1 className="text-xl font-black uppercase tracking-[0.2em] text-white">SmartSkill AI</h1>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white">System Login</h2>
            <p className="mt-2 max-w-md text-sm text-brand-text-secondary">Authorized personnel can enter the intelligent assessment workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-text-secondary">Email Identifier</label>
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary transition-colors group-focus-within:text-brand-cyan" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="admin@smarteval.ai"
                  className="h-14 w-full rounded-[1.25rem] border border-white/10 bg-white/[0.05] pl-12 pr-4 text-sm font-medium text-white placeholder:text-brand-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:bg-white/[0.08]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-text-secondary">Security Key</label>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary transition-colors group-focus-within:text-brand-cyan" />
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className="h-14 w-full rounded-[1.25rem] border border-white/10 bg-white/[0.05] pl-12 pr-4 text-sm font-medium text-white placeholder:text-brand-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-brand-cyan/30 focus:bg-white/[0.08]"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 rounded-[1.1rem] border border-red-400/20 bg-red-500/10 p-4 text-xs font-semibold text-red-300">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative h-14 w-full overflow-hidden rounded-[1.25rem] bg-gradient-to-r from-[#6D5BFF] to-[#1DA1FF] font-semibold uppercase tracking-[0.28em] text-white transition-all hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(29,161,255,0.25)] disabled:opacity-60"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <Activity className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Initialise Session
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-8 flex flex-col items-start gap-3 border-t border-white/10 pt-6 text-sm text-brand-text-secondary">
            <p>Need access? Request a secure entry invitation.</p>
            <Link to="/register" className="font-semibold text-brand-cyan transition-colors hover:text-brand-cyan/80">
              Request Entry
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="relative flex min-h-[320px] flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(29,161,255,0.2),_transparent_42%),linear-gradient(135deg,_rgba(10,16,37,0.95),_rgba(19,26,53,0.95))] p-8 sm:p-10 lg:p-12">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute left-10 top-10 h-24 w-24 rounded-full border border-brand-cyan/20 bg-brand-cyan/10 blur-[2px]" />
            <div className="absolute right-12 top-16 h-28 w-28 rounded-full border border-[#7B4DFF]/20 bg-[#7B4DFF]/10" />
            <div className="absolute bottom-10 left-12 h-20 w-20 rounded-full border border-[#24E0FF]/20 bg-[#24E0FF]/10" />
          </div>

          <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-cyan/10 text-brand-cyan">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-text-secondary">AI orchestration</p>
                <p className="text-sm font-semibold text-white">Assessments become insight</p>
              </div>
            </div>

            <div className="space-y-3 rounded-[1.5rem] border border-white/10 bg-[#0A1025]/70 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    className="h-2.5 w-2.5 rounded-full bg-brand-cyan shadow-[0_0_12px_rgba(29,161,255,0.8)]"
                  />
                  <span className="text-sm text-brand-text-secondary">Live pipeline</span>
                </div>
                <span className="rounded-full bg-brand-cyan/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-cyan">Online</span>
              </div>

              <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  animate={{ x: ["-100%", "180%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-[#1DA1FF] via-[#24E0FF] to-[#7B4DFF] shadow-[0_0_16px_rgba(29,161,255,0.4)]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <motion.div
                  animate={{ y: [0, -2, 0], boxShadow: ["0 0 0 rgba(29,161,255,0)", "0 0 14px rgba(29,161,255,0.16)", "0 0 0 rgba(29,161,255,0)"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-text-secondary">Intelligence</p>
                  <p className="mt-1 text-2xl font-black text-white">24/7</p>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -2, 0], boxShadow: ["0 0 0 rgba(29,161,255,0)", "0 0 14px rgba(29,161,255,0.16)", "0 0 0 rgba(29,161,255,0)"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  className="rounded-[1.1rem] border border-white/10 bg-white/[0.04] p-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-brand-text-secondary">Quality</p>
                  <p className="mt-1 text-2xl font-black text-white">99.8%</p>
                </motion.div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-brand-text-secondary">
              <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}>
                <Sparkles className="h-4 w-4 text-brand-cyan" />
              </motion.div>
              Premium enterprise workspace ready for your team.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

