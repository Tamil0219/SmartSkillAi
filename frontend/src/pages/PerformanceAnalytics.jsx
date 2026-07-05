import { useEffect, useState, useCallback } from "react";
import API from "../services/api";

// Simple Bar Chart Component
const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-brand-text-secondary">No data</p>;

  const maxScore = Math.max(...data.map(d => d.averageScore));
  
  return (
    <div className="space-y-3">
      {data.map((student, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="w-20 text-xs text-brand-text-secondary truncate">
            #{idx + 1} {student.name.substring(0, 10)}
          </div>
          <div className="flex-1 h-4 bg-brand-card rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              style={{ width: `${(student.averageScore / maxScore) * 100}%` }}
            />
          </div>
          <div className="w-12 text-right text-brand-crystal font-semibold text-sm">
            {student.averageScore}%
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple Donut Chart Component
const SimpleDonutChart = ({ passCount, failCount }) => {
  const total = passCount + failCount;
  const passPercent = total > 0 ? (passCount / total) * 100 : 0;
  const failPercent = total > 0 ? (failCount / total) * 100 : 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8">
      <div className="flex items-center gap-4">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#10b981"
            strokeWidth="25"
            strokeDasharray={`${(passPercent * 502) / 100} 502`}
            transform="rotate(-90 100 100)"
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#ef4444"
            strokeWidth="25"
            strokeDasharray={`${(failPercent * 502) / 100} 502`}
            strokeDashoffset={-((passPercent * 502) / 100)}
            transform="rotate(-90 100 100)"
          />
          <text x="100" y="90" textAnchor="middle" className="text-2xl font-bold fill-brand-crystal">
            {total}
          </text>
          <text x="100" y="115" textAnchor="middle" className="text-xs fill-brand-text-secondary">
            Students
          </text>
        </svg>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <div>
            <p className="text-brand-text font-semibold">{passCount} Passed ({passPercent.toFixed(1)}%)</p>
            <p className="text-xs text-brand-text-secondary">Score {'>='} 50</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <div>
            <p className="text-brand-text font-semibold">{failCount} Failed ({failPercent.toFixed(1)}%)</p>
            <p className="text-xs text-brand-text-secondary">Score {'<'} 50</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PerformanceAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    averageScore: 0,
    passCount: 0,
    failCount: 0,
    passRate: 0,
    failRate: 0,
    topStudents: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/analytics");
      
      if (res.data.success) {
        setAnalyticsData(res.data.data);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Prepare line graph data (simulated performance trend)
  const performanceTrendData = analyticsData.topStudents.map((student, idx) => ({
    rank: idx +1,
    score: student.averageScore
  }));

  if (loading) {
    return (
      <section className="space-y-8">
        <h1 className="text-3xl font-semibold text-brand-text">Performance Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-brand-card rounded-xl animate-pulse border border-white/10" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-brand-text">Performance Analytics</h1>
          <p className="text-sm text-brand-text-secondary">Detailed student performance insights</p>
        </div>
      </header>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Average Score */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-6 shadow-glow">
          <h3 className="text-sm text-brand-text-secondary mb-2">Average Score</h3>
          <p className="text-3xl font-bold text-brand-crystal">{analyticsData.averageScore}%</p>
        </div>

        {/* Pass Rate */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-6 shadow-glow">
          <h3 className="text-sm text-brand-text-secondary mb-2">Pass Rate</h3>
          <p className="text-3xl font-bold text-green-400">{analyticsData.passRate}%</p>
          <p className="text-xs text-brand-text-secondary mt-1">{analyticsData.passCount} students</p>
        </div>

        {/* Fail Rate */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-500/10 to-rose-500/10 p-6 shadow-glow">
          <h3 className="text-sm text-brand-text-secondary mb-2">Fail Rate</h3>
          <p className="text-3xl font-bold text-red-400">{analyticsData.failRate}%</p>
          <p className="text-xs text-brand-text-secondary mt-1">{analyticsData.failCount} students</p>
        </div>

        {/* Total Students */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-orange-500/10 to-amber-500/10 p-6 shadow-glow">
          <h3 className="text-sm text-brand-text-secondary mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-amber-400">{analyticsData.passCount + analyticsData.failCount}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Top Students */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-card to-brand-card/50 p-8 shadow-glow">
          <h3 className="text-lg font-semibold text-brand-text mb-6">Top 10 Performing Students</h3>
          {analyticsData.topStudents.length > 0 ? (
            <SimpleBarChart data={analyticsData.topStudents.slice(0, 10)} />
          ) : (
            <p className="text-brand-text-secondary">No data available</p>
          )}
          <p className="text-xs text-brand-text-secondary mt-4 italic">Bar Chart Visualization</p>
        </div>

        {/* Donut Chart - Pass vs Fail */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-card to-brand-card/50 p-8 shadow-glow">
          <h3 className="text-lg font-semibold text-brand-text mb-6">Pass vs Fail Ratio</h3>
          <SimpleDonutChart 
            passCount={analyticsData.passCount}
            failCount={analyticsData.failCount}
          />
          <p className="text-xs text-brand-text-secondary mt-4 italic">Donut Chart Visualization</p>
        </div>
      </div>

      {/* Line Graph - Performance Trend */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-card to-brand-card/50 p-8 shadow-glow">
        <h3 className="text-lg font-semibold text-brand-text mb-6">Performance Trend (Top Students)</h3>
        {performanceTrendData.length > 0 ? (
          <div className="h-64 relative">
            <svg width="100%" height="100%" viewBox={`0 0 ${performanceTrendData.length * 60} 250`} className="w-full">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map(mark => (
                <line
                  key={`grid-${mark}`}
                  x1="0"
                  y1={250 - (mark * 2)}
                  x2={performanceTrendData.length * 60}
                  y2={250 - (mark * 2)}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                />
              ))}
              
              {/* Line path */}
              <polyline
                points={performanceTrendData
                  .map((data, idx) => `${idx * 60 + 30},${250 - (data.score * 2)}`)
                  .join(' ')}
                fill="none"
                stroke="url('#gradient')"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Points */}
              {performanceTrendData.map((data, idx) => (
                <g key={`point-${idx}`}>
                  <circle
                    cx={idx * 60 + 30}
                    cy={250 - (data.score * 2)}
                    r="5"
                    fill="#06b6d4"
                    opacity="0.8"
                  />
                  <text
                    x={idx * 60 + 30}
                    y={280}
                    textAnchor="middle"
                    className="text-xs fill-brand-text-secondary"
                  >
                    #{data.rank}
                  </text>
                  <text
                    x={idx * 60 + 30}
                    y={270 - (data.score * 2)}
                    textAnchor="middle"
                    className="text-xs fill-brand-crystal font-semibold"
                  >
                    {data.score}%
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <p className="text-brand-text-secondary">No data available</p>
        )}
        <p className="text-xs text-brand-text-secondary mt-4 italic">Line Graph - Performance progression by rank</p>
      </div>

      {/* Ranking Table */}
      <div className="rounded-2xl border border-white/10 bg-brand-card shadow-glow overflow-hidden">
        <h3 className="text-lg font-semibold text-brand-text p-8 border-b border-white/10">Student Ranking</h3>
        {analyticsData.topStudents && analyticsData.topStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/20 border-b border-white/10">
                <tr className="text-left">
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Rank</th>
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Student Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Marks</th>
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Exams Taken</th>
                  <th className="px-6 py-4 text-sm font-semibold text-brand-text">Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.topStudents.map((student, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-brand-crystal/20 text-brand-crystal font-semibold text-sm">
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-brand-text font-medium">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-brand-crystal font-semibold text-lg">{student.averageScore}%</span>
                    </td>
                    <td className="px-6 py-4 text-brand-text-secondary">{student.totalExams}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        student.averageScore >= 50
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}>
                        {student.averageScore >= 50 ? "PASS" : "FAIL"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-brand-text-secondary">
            <p>No student performance data available</p>
          </div>
        )}
      </div>
    </section>
  );
}
