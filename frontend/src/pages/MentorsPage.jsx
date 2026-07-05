import { useState, useEffect } from "react";
import API from "../services/api";

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    fetchMentors();
  }, []);

  function fetchMentors() {
    API.get("/admin/mentors")
      .then(res => {
        console.log('[MentorsPage] API Response:', res.data);
        const mentorsData = res.data.mentors || res.data;
        console.log('[MentorsPage] Setting mentors:', mentorsData);
        setMentors(Array.isArray(mentorsData) ? mentorsData : []);
      })
      .catch(err => console.error("[MentorsPage] Mentors fetch error:", err));
  };

  const viewMentorActivity = (mentorId) => {
    // Placeholder for opening mentor summary page
    console.log("View activity for mentor:", mentorId);
    // TODO: Navigate to mentor summary page, e.g., /admin/mentor/${mentorId}
  };

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">Mentors</h1>
          <p className="text-sm text-brand-text-secondary">Monitor mentor activities and performance.</p>
        </div>
      </header>

      <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
        <table className="w-full text-left text-sm text-brand-text-secondary">
          <thead>
            <tr className="border-b border-white/10">
              <th className="py-3">Mentor Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Courses Uploaded</th>
              <th className="py-3">Exams Created</th>
              <th className="py-3">Videos Uploaded</th>
              <th className="py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {mentors.map((mentor) => (
              <tr key={mentor._id} className="hover:bg-white/5">
                <td className="py-3 text-brand-text">{mentor.name}</td>
                <td className="py-3">{mentor.email}</td>
                <td className="py-3">{mentor.coursesCount || 0}</td>
                <td className="py-3">{mentor.examsCount || 0}</td>
                <td className="py-3">{mentor.videosCount || 0}</td>
                <td className="py-3">
                  <button
                    onClick={() => viewMentorActivity(mentor._id)}
                    className="rounded-xl bg-brand-crystal/20 px-4 py-2 text-xs font-semibold text-brand-crystal hover:bg-brand-crystal/30"
                  >
                    View Mentor Activity
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
