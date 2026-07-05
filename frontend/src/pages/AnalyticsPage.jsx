import { useEffect, useState } from "react";
import API from "../services/api";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const palette = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#a4de6c"];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalExams: 0,
    averageScore: 0,
    performanceDistribution: [0, 0, 0, 0, 0],
    topStudents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await API.get("/mentor/analytics");
      if (res.data.success) {
        setAnalyticsData({
          ...analyticsData,
          ...res.data.data,
        });
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const distributionData = analyticsData.performanceDistribution.map((count, index) => ({
    bucket: `${index * 20}-${index * 20 + 19}%`,
    count,
  }));

  const lineData = analyticsData.performanceTrend || [
    { period: "W1", avgScore: 0, submissions: 0 },
    { period: "W2", avgScore: 0, submissions: 0 },
  ];

  const pieData = analyticsData.performanceDistribution.map((count, index) => ({
    name: `${index * 20}-${index * 20 + 19}`,
    value: count,
  }));

  if (loading) {
    return (
      <section className="space-y-8">
        <h1 className="text-3xl font-semibold text-brand-text">Analytics</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((idx) => (
            <div key={idx} className="h-40 rounded-2xl bg-brand-card animate-pulse border border-white/10" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <header className="mb-4">
        <h1 className="text-3xl font-semibold text-brand-text">Mentor Analytics</h1>
        <p className="text-sm text-brand-text-secondary">Advanced performance visualization and trend analysis</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <p className="text-sm text-brand-text-secondary">Total Students</p>
          <p className="text-3xl font-bold text-brand-crystal">{analyticsData.totalStudents}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <p className="text-sm text-brand-text-secondary">Total Courses</p>
          <p className="text-3xl font-bold text-brand-crystal">{analyticsData.totalCourses}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <p className="text-sm text-brand-text-secondary">Total Exams</p>
          <p className="text-3xl font-bold text-brand-crystal">{analyticsData.totalExams}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <p className="text-sm text-brand-text-secondary">Average Score</p>
          <p className="text-3xl font-bold text-brand-crystal">{analyticsData.averageScore.toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Performance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="avgScore" name="Avg Score" stroke="#82ca9d" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="submissions" name="Submissions" stroke="#8884d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bucket" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Bar dataKey="count" name="Students" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Top Students</h2>
          <ul className="space-y-3">
            {analyticsData.topStudents.slice(0, 6).map((student, idx) => (
              <li key={student._id || idx} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">{student.studentName || "Unknown"}</p>
                    <p className="text-xs text-brand-text-secondary">{student.examTitle || "Exam"}</p>
                  </div>
                  <p className="text-lg font-bold text-brand-crystal">{student.score}%</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <h2 className="text-lg font-semibold text-brand-text mb-4">Percentile Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}