import { useEffect, useState, useCallback } from "react";
import API from "../services/api";

// Simple mock charts since Recharts will be installed separately
const SimplePieChart = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-brand-text-secondary">No data</p>;
  
  return (
    <div className="space-y-2">
      {data.map((item, idx) => (
        <div key={idx} className="flex justify-between items-center">
          <span className="text-brand-text-secondary text-sm">{item._id || "General"}</span>
          <div className="flex-1 mx-4 h-2 bg-brand-card rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              style={{ width: `${(item.count / Math.max(...data.map(d => d.count))) * 100}%` }}
            />
          </div>
          <span className="text-brand-crystal font-semibold text-sm">{item.count}</span>
        </div>
      ))}
    </div>
  );
};

const SimpleBarChart = ({ students, mentors }) => {
  const max = Math.max(students, mentors, 1);
  const studentPercent = (students / max) * 100;
  const mentorPercent = (mentors / max) * 100;
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-brand-text-secondary text-sm">Students</span>
          <span className="text-brand-crystal font-semibold">{students}</span>
        </div>
        <div className="h-3 bg-brand-card rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: `${studentPercent}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-brand-text-secondary text-sm">Mentors</span>
          <span className="text-brand-crystal font-semibold">{mentors}</span>
        </div>
        <div className="h-3 bg-brand-card rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${mentorPercent}%` }} />
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalMentors: 0,
    totalStudents: 0,
    recentStudents: [],
    recentMentors: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/dashboard");
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <section className="space-y-8">
        <h1 className="text-3xl font-semibold text-brand-text">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-brand-card rounded-xl animate-pulse border border-white/10" />
          ))}
        </div>
      </section>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-brand-text">Admin Dashboard</h1>
        <p className="text-sm text-brand-text-secondary">System overview and quick statistics</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Mentors */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-8 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-brand-text-secondary mb-2">Total Mentors</h3>
              <p className="text-4xl font-bold text-brand-crystal">{dashboardData.totalMentors}</p>
            </div>
            <div className="text-5xl opacity-30">👨‍🏫</div>
          </div>
        </div>

        {/* Total Students */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-8 shadow-glow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-brand-text-secondary mb-2">Total Students</h3>
              <p className="text-4xl font-bold text-brand-crystal">{dashboardData.totalStudents}</p>
            </div>
            <div className="text-5xl opacity-30">👩‍🎓</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Bar Chart - Students vs Mentors */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-card to-brand-card/50 p-8 shadow-glow">
          <h3 className="text-lg font-semibold text-brand-text mb-6">Students vs Mentors</h3>
          <SimpleBarChart 
            students={dashboardData.totalStudents} 
            mentors={dashboardData.totalMentors}
          />
          <p className="text-xs text-brand-text-secondary mt-4 italic">Bar Chart Visualization</p>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-card to-brand-card/50 p-8 shadow-glow">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Recently Added Students</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardData.recentStudents && dashboardData.recentStudents.length > 0 ? (
              dashboardData.recentStudents.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-brand-card/30 rounded-lg border border-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-brand-text font-medium truncate">{student.name}</p>
                    <p className="text-xs text-brand-text-secondary truncate">{student.email}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-xs text-brand-text-secondary mt-1">{formatDate(student.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-brand-text-secondary text-sm">No recent students</p>
            )}
          </div>
        </div>

        {/* Recent Mentors */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand-card to-brand-card/50 p-8 shadow-glow">
          <h3 className="text-lg font-semibold text-brand-text mb-4">Recently Added Mentors</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {dashboardData.recentMentors && dashboardData.recentMentors.length > 0 ? (
              dashboardData.recentMentors.map((mentor, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-brand-card/30 rounded-lg border border-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-brand-text font-medium truncate">{mentor.name}</p>
                    <p className="text-xs text-brand-text-secondary truncate">{mentor.email}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-xs text-brand-text-secondary mt-1">{formatDate(mentor.createdAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-brand-text-secondary text-sm">No recent mentors</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

