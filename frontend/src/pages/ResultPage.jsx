import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  BarChart3, 
  Calendar,
  Clock,
  Trophy,
  TrendingUp
} from "lucide-react";

export default function ResultPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllResults();
  }, []);

  const fetchAllResults = async () => {
    try {
      const res = await API.get("/student/results");
      if (res.data.results) {
        // Sort by date descending
        const sorted = res.data.results.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
        console.log("Fetched results:", sorted); // Debug log
        setResults(sorted);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall performance
  const calculatePerformance = () => {
    if (results.length === 0) return 0;
    const avgScore = results.reduce((sum, r) => sum + (r.score || 0), 0) / results.length;
    return Math.round(avgScore);
  };

  // Get performance status color
  const getPerformanceColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  // Get performance badge
  const getPerformanceBadge = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  const getPerformanceBadgeColor = (score) => {
    if (score >= 80) return "bg-green-400/10 text-green-400 border-green-400/20";
    if (score >= 60) return "bg-yellow-400/10 text-yellow-400 border-yellow-400/20";
    return "bg-red-400/10 text-red-400 border-red-400/20";
  };

  if (loading) {
    return (
      <section className="space-y-8 animate-in fade-in duration-700">
        <div className="rounded-[3rem] bg-brand-card border border-white/5 p-12">
          <div className="text-center text-brand-text-secondary">Loading results...</div>
        </div>
      </section>
    );
  }

  const overallPerformance = calculatePerformance();

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-black bg-gradient-to-r from-brand-crystal to-white bg-clip-text text-transparent uppercase tracking-tight">
          Assessment Results
        </h1>
        <p className="text-sm text-brand-text-secondary">View your test performance and progress</p>
      </div>

      {/* Overall Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-[2rem] bg-brand-card border border-white/5 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-brand-crystal/10">
              <Trophy className="w-5 h-5 text-brand-crystal" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">Overall Performance</span>
          </div>
          <p className={`text-5xl font-black italic ${getPerformanceColor(overallPerformance)}`}>
            {overallPerformance}%
          </p>
        </div>

        <div className="rounded-[2rem] bg-brand-card border border-white/5 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-brand-crystal/10">
              <BarChart3 className="w-5 h-5 text-brand-crystal" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">Total Tests</span>
          </div>
          <p className="text-5xl font-black italic text-brand-crystal">
            {results.length}
          </p>
        </div>

        <div className="rounded-[2rem] bg-brand-card border border-white/5 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-brand-crystal/10">
              <TrendingUp className="w-5 h-5 text-brand-crystal" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">Status</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${getPerformanceBadgeColor(overallPerformance)}`}>
            {getPerformanceBadge(overallPerformance)}
          </span>
        </div>
      </div>

      {/* Results Table */}
      {results.length === 0 ? (
        <div className="rounded-[2rem] bg-brand-card border border-white/5 p-12 text-center">
          <p className="text-brand-text-secondary mb-6">No test results yet</p>
          <button 
            onClick={() => navigate('/exam')}
            className="px-6 py-3 rounded-xl bg-brand-crystal text-black font-black uppercase tracking-widest hover:brightness-110 transition"
          >
            Take Your First Exam
          </button>
        </div>
      ) : (
        <div className="rounded-[2rem] bg-brand-card border border-white/5 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-6 border-b border-white/5 bg-brand-sidebar/50">
            <div className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">Test Name</div>
            <div className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">Score</div>
            <div className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">Correct</div>
            <div className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">Time</div>
            <div className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">Date</div>
            <div className="text-xs font-black uppercase tracking-widest text-brand-text-secondary">Status</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-white/5">
            {results.map((result, index) => {
              const score = result.score || 0;
              const correct = result.correctAnswers !== undefined ? result.correctAnswers : 0;
              const total = result.totalQuestions !== undefined ? result.totalQuestions : 0;
              const timeSpent = result.timeSpent || "0:00";
              const examName = result.examId?.title || `Assessment ${results.length - index}`;
              const date = new Date(result.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              const time = new Date(result.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={result._id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-6 hover:bg-white/[0.02] transition">
                  <div>
                    <p className="text-sm font-black text-white truncate">{examName}</p>
                  </div>
                  <div>
                    <p className={`text-lg font-black italic ${getPerformanceColor(score)}`}>
                      {score}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-crystal">
                      {total > 0 ? `${correct}/${total}` : total === 0 ? '—' : `${correct}/${total}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-text-secondary" />
                    <p className="text-sm text-brand-text-secondary">{timeSpent}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-text-secondary">{date}</p>
                    <p className="text-xs text-brand-text-secondary/60">{time}</p>
                  </div>
                  <div>
                    <span className={`inline-block px-2 py-1 rounded-lg text-xs font-black uppercase tracking-widest border ${getPerformanceBadgeColor(score)}`}>
                      {getPerformanceBadge(score)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Take Another Test Button */}
      {results.length > 0 && (
        <div className="text-center">
          <button 
            onClick={() => navigate('/exam')}
            className="px-8 py-4 rounded-xl bg-brand-crystal/20 text-brand-crystal font-black uppercase tracking-widest border border-brand-crystal/50 hover:bg-brand-crystal/30 transition"
          >
            Take Another Test
          </button>
        </div>
      )}
    </section>
  );
}

