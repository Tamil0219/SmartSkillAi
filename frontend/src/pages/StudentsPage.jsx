import { useState, useEffect } from "react";
import API from "../services/api";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentPerformance, setStudentPerformance] = useState(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  const fetchStudents = () => {
    API.get("/mentor/students")
      .then(res => {
        console.log('[StudentsPage] API Response:', res.data);
        const studentsData = res.data.students || res.data;
        console.log('[StudentsPage] Setting students:', studentsData);
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      })
      .catch(err => console.error("[StudentsPage] Students fetch error:", err));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const viewStudentPerformance = async (studentId) => {
    setLoadingPerformance(true);
    try {
      const res = await API.get(`/mentor/students/${studentId}/performance`);
      setStudentPerformance(res.data.performance);
      setSelectedStudent(studentId);
    } catch (error) {
      console.error('Failed to fetch student performance:', error);
      alert('Unable to load student performance.');
    } finally {
      setLoadingPerformance(false);
    }
  };

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Students</h1>
          <p className="text-sm text-brand-text-secondary">Monitor student performance and engagement.</p>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
        <table className="w-full text-left text-sm text-brand-text-secondary">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3">Student Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Latest Score</th>
              <th className="py-3">Exams Attempted</th>
              <th className="py-3">Average Score</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-white/5">
                <td className="py-3 text-brand-text">{student.name}</td>
                <td className="py-3">{student.email}</td>
                <td className="py-3">{student.latestScore !== null ? `${student.latestScore}%` : 'N/A'}</td>
                <td className="py-3">{student.examsAttempted || 0}</td>
                <td className="py-3">{student.averageScore !== null ? `${student.averageScore}%` : 'N/A'}</td>
                <td className="py-3">
                  <button
                    onClick={() => viewStudentPerformance(student._id)}
                    disabled={loadingPerformance}
                    className="rounded-xl bg-brand-crystal/20 px-4 py-2 text-xs font-semibold text-brand-crystal hover:bg-brand-crystal/30 disabled:opacity-50"
                  >
                    {loadingPerformance ? 'Loading...' : 'View Performance'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Student Performance Modal */}
      {selectedStudent && studentPerformance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-card rounded-2xl border border-white/10 p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Student Performance</h2>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-brand-text-secondary hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-brand-crystal">{studentPerformance.student.name}</h3>
                <p className="text-sm text-brand-text-secondary">{studentPerformance.student.email}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-brand-crystal">{studentPerformance.summary.totalExams}</p>
                  <p className="text-xs text-brand-text-secondary">Total Exams</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-brand-crystal">{studentPerformance.summary.averageScore}%</p>
                  <p className="text-xs text-brand-text-secondary">Average Score</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{studentPerformance.summary.highestScore}%</p>
                  <p className="text-xs text-brand-text-secondary">Highest Score</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-400">{studentPerformance.summary.lowestScore}%</p>
                  <p className="text-xs text-brand-text-secondary">Lowest Score</p>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Exam Results</h4>
                <div className="space-y-2">
                  {studentPerformance.results.map((result, index) => (
                    <div key={index} className="bg-white/5 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-white">{result.examTitle}</p>
                        <p className="text-sm text-brand-text-secondary">{result.courseTitle} • Attempt {result.attempt}</p>
                        <p className="text-xs text-brand-text-secondary">{new Date(result.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${result.score >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                          {result.score}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
