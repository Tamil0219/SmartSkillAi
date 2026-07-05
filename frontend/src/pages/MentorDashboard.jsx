import { useState, useEffect } from "react";
import API from "../services/api";
import NotificationPanel from "../components/NotificationPanel";
import { 
  Users, 
  BookOpen, 
  Target, 
  TrendingUp, 
  Award,
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function MentorDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeStudents: 0,
  });
  const [studentProgress, setStudentProgress] = useState([]);
  const [analytics, setAnalytics] = useState({
    performanceDistribution: [0,0,0,0,0],
    topStudents: []
  });
  const [examOverview, setExamOverview] = useState({
    totalExams: 0,
    passPercentage: 0,
    failPercentage: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, progRes, examRes, analyticsRes] = await Promise.all([
          API.get("/mentor/dashboard"),
          API.get("/mentor/student-progress"),
          API.get("/mentor/exam-overview"),
          API.get("/mentor/analytics")
        ]);
        
        setDashboardData(dashRes.data.data || dashRes.data);
        setStudentProgress(progRes.data.progress || []);
        setExamOverview(examRes.data.overview || { totalExams: 0, passPercentage: 0, failPercentage: 0 });
        setAnalytics(analyticsRes.data.data || { topStudents: [] });
      } catch (err) {
        console.error("Error fetching mentor data:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <header className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
            Control Center <span className="text-brand-crystal">/ Analytics</span>
          </h1>
          <p className="text-sm text-brand-text-secondary font-medium">Monitoring cohort performance and educational milestones.</p>
        </div>
        <NotificationPanel />
      </header>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group relative overflow-hidden rounded-3xl bg-brand-card p-1 border border-white/5 shadow-2xl transition-all hover:border-brand-crystal/30">
          <div className="relative z-10 p-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-2xl bg-brand-crystal/10 p-3 text-brand-crystal">
              <Users className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary">Students Assigned</p>
            <p className="mt-1 text-5xl font-black text-white italic">{dashboardData.totalStudents}</p>
            <div className="mt-4 flex gap-1">
              <div className="h-1 w-8 rounded-full bg-brand-crystal" />
              <div className="h-1 w-2 rounded-full bg-brand-crystal/30" />
              <div className="h-1 w-2 rounded-full bg-brand-crystal/30" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-brand-card p-1 border border-white/5 shadow-2xl transition-all hover:border-brand-crystal/30">
          <div className="relative z-10 p-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-2xl bg-brand-crystal/10 p-3 text-brand-crystal">
              <BookOpen className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary">Active Courses</p>
            <p className="mt-1 text-5xl font-black text-white italic">{dashboardData.totalCourses}</p>
            <div className="mt-4 flex gap-1">
              <div className="h-1 w-2 rounded-full bg-brand-crystal/30" />
              <div className="h-1 w-8 rounded-full bg-brand-crystal" />
              <div className="h-1 w-2 rounded-full bg-brand-crystal/30" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl bg-brand-card p-1 border border-white/5 shadow-2xl transition-all hover:border-brand-crystal/30">
          <div className="relative z-10 p-6 flex flex-col items-center text-center">
            <div className="mb-4 rounded-2xl bg-brand-crystal/10 p-3 text-brand-crystal">
              <UserCheck className="w-8 h-8" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-secondary">Active Students</p>
            <p className="mt-1 text-5xl font-black text-white italic">{dashboardData.activeStudents}</p>
            <div className="mt-4 flex gap-1">
              <div className="h-1 w-2 rounded-full bg-brand-crystal/30" />
              <div className="h-1 w-2 rounded-full bg-brand-crystal/30" />
              <div className="h-1 w-8 rounded-full bg-brand-crystal" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Table */}
        <div className="lg:col-span-2 rounded-[2rem] border border-white/5 bg-brand-card p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-3 text-white uppercase italic">
              <Target className="w-6 h-6 text-brand-crystal" />
              Real-Time Progress
            </h2>
          </div>
          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Name</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Path</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">Status</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-brand-text-secondary text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {studentProgress.length > 0 ? studentProgress.map((student, index) => (
                  <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-white group-hover:text-brand-crystal transition-colors">{student.name}</p>
                    </td>
                    <td className="py-4">
                      <span className="text-xs text-brand-text-secondary">{student.course}</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-white/5 overflow-hidden">
                          <div className="h-full bg-brand-crystal" style={{ width: `${student.progress}%` }} />
                        </div>
                        <span className="text-[10px] font-black text-brand-text-secondary">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <span className={`text-xs font-black italic ${student.lastExamScore >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                        {student.lastExamScore}%
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center text-sm text-brand-text-secondary">No student data found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performers & Success Rate */}
        <div className="space-y-8">
           {/* Success Rate */}
          <div className="rounded-[2rem] border border-white/5 bg-gradient-to-br from-brand-sidebar to-brand-card p-8 shadow-2xl">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand-text-secondary mb-8">Global Success Rate</h2>
            <div className="flex justify-around items-end h-32 gap-4">
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="relative w-full bg-white/5 rounded-t-xl overflow-hidden h-24">
                  <div className="absolute bottom-0 w-full bg-green-500/30" style={{ height: `${examOverview.passPercentage}%` }} />
                  <div className="absolute bottom-0 w-full bg-green-500 h-1" />
                </div>
                <span className="text-[10px] font-black text-green-400">PASS {examOverview.passPercentage}%</span>
              </div>
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="relative w-full bg-white/5 rounded-t-xl overflow-hidden h-24">
                  <div className="absolute bottom-0 w-full bg-red-500/30" style={{ height: `${examOverview.failPercentage}%` }} />
                  <div className="absolute bottom-0 w-full bg-red-500 h-1" />
                </div>
                <span className="text-[10px] font-black text-red-400">FAIL {examOverview.failPercentage}%</span>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-brand-text-secondary">
                <span>Total Samples</span>
                <span className="text-white">{examOverview.totalExams} Assessments</span>
              </div>
            </div>
          </div>

          {/* Top Performers */}
          <div className="rounded-[2rem] border border-white/5 bg-brand-card p-8 shadow-2xl">
             <h2 className="text-xl font-bold flex items-center gap-3 text-white uppercase italic mb-6">
              <Award className="w-6 h-6 text-brand-crystal" />
              Legends
            </h2>
            <div className="space-y-4">
              {analytics.topStudents && analytics.topStudents.length > 0 ? analytics.topStudents.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-brand-crystal/10 text-brand-crystal font-black italic">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">Student ID: ...{item.studentId.slice(-4)}</p>
                    <p className="text-[10px] text-brand-text-secondary">Elite Performance</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-brand-crystal">{item.score}%</span>
                  </div>
                </div>
              )) : (
                <p className="text-center text-[10px] text-brand-text-secondary py-8">Calculating rankings...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

