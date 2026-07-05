import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  BookOpen, 
  Video, 
  FileText, 
  TrendingUp, 
  Search, 
  Clock,
  ArrowRight
} from "lucide-react";

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState({
    studentName: 'Student',
    enrolledCourses: 0,
    examAttempts: 0,
    latestScore: 0,
    learningProgress: 0,
    avgScore: 0,
  });
  const [courses, setCourses] = useState([]);
  const [videos, setVideos] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingExam, setLoadingExam] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchDashboard = useCallback(() => {
    API.get("/student/dashboard")
      .then((res) => {
        setDashboardData(res.data.data || res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchCourses = useCallback(() => {
    API.get("/student/courses")
      .then((res) => {
        setCourses(res.data.courses || []);
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchVideos = useCallback(() => {
    API.get("/student/courses")
      .then((res) => {
        const courses = res.data.courses || [];
        // Extract videos from courses that have YouTube URLs
        const courseVideos = courses
          .filter(course => course.youtubeUrl)
          .map(course => ({
            _id: course._id,
            title: course.title,
            url: course.youtubeUrl,
            courseId: course._id,
            thumbnail: getYouTubeThumbnail(course.youtubeUrl)
          }));
        setVideos(courseVideos);
      })
      .catch((err) => console.error(err));
  }, []);

  // Helper function to extract YouTube video ID and get thumbnail URL
  const getYouTubeThumbnail = (url) => {
    if (!url) return null;
    try {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0];
      }
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (e) {
      console.error('Error extracting YouTube ID:', e);
    }
    return null;
  };

  // Helper function to get YouTube video ID for embedding
  const fetchResults = useCallback(() => {
    API.get("/student/results")
      .then((res) => {
        setResults(res.data.results || []);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchCourses();
    fetchVideos();
    fetchResults();
  }, [fetchDashboard, fetchCourses, fetchVideos, fetchResults]);

  const openExamForCourse = async (courseId) => {
    if (loadingExam) return;
    setLoadingExam(true);
    try {
      const res = await API.get('/student/exams');
      const exam = res.data.exams?.find((examItem) => {
        const examCourseId = examItem.courseId?._id?.toString() || examItem.courseId?.toString();
        return examCourseId === courseId.toString();
      });

      if (!exam) {
        alert('📚 No exam available for this course yet. Check back later!');
        return;
      }

      navigate('/exam', { state: { generatedExam: exam } });
    } catch (error) {
      console.error('Failed to open exam for course:', error);
      alert('Unable to open exam. Please try again later.');
    } finally {
      setLoadingExam(false);
    }
  };

  // Filter courses based on search query
  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-sidebar to-brand-background p-10 border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-brand-crystal/10 blur-[100px]" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Hello, <span className="text-brand-crystal">{dashboardData.studentName}</span>
            </h1>
            <p className="text-brand-text-secondary text-lg max-w-lg">
              Your futuristic learning journey is {dashboardData.learningProgress || dashboardData.avgScore}% complete. Ready to tackle today's challenges?
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center min-w-[100px] hover:border-brand-crystal/30 transition-colors">
              <span className="text-2xl font-bold text-brand-crystal">{dashboardData.enrolledCourses}</span>
              <span className="text-[10px] uppercase tracking-widest text-brand-text-secondary">Courses</span>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col items-center justify-center min-w-[100px] hover:border-brand-crystal/30 transition-colors">
              <span className="text-2xl font-bold text-brand-crystal">{dashboardData.latestScore}%</span>
              <span className="text-[10px] uppercase tracking-widest text-brand-text-secondary">Avg Score</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/chatbot')}
              className="rounded-2xl bg-brand-crystal px-6 py-4 text-sm font-semibold text-black hover:bg-brand-crystal/90 transition-colors min-w-[160px]"
            >
              Open AI Tutor
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Learning Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Courses */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5 text-brand-crystal" />
                Active Learning Paths
              </h2>
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="text-brand-crystal text-sm font-medium hover:underline flex items-center gap-1"
              >
                Explore All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Search Box */}
            <div className="mb-6 relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-card border border-white/5 rounded-2xl px-4 py-3 pl-10 text-sm text-white placeholder-brand-text-secondary focus:outline-none focus:border-brand-crystal/50 transition-colors"
              />
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-brand-text-secondary pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.length > 0 ? filteredCourses.map((course) => {
                return (
                  <div
                    key={course._id}
                    className="group relative overflow-hidden rounded-2xl bg-brand-card p-6 border border-white/5 transition-all duration-300 hover:border-brand-crystal/20"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <BookOpen className="w-12 h-12" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 transition-colors group-hover:text-brand-crystal">{course.title}</h3>
                    <p className="text-xs text-brand-text-secondary mb-4 line-clamp-2">{course.description || "No description available."}</p>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-4">
                      <div
                        className="bg-brand-crystal h-full rounded-full shadow-[0_0_10px_#00e5ff]"
                        style={{ width: `${course.progress ?? 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-4">
                      <span>{course.completedExams}/{course.totalExams} modules done</span>
                      <span>{course.lessonsLeft} left</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => openExamForCourse(course._id)}
                      className="w-full rounded-xl bg-brand-crystal px-4 py-2 text-sm font-semibold text-black hover:bg-brand-crystal/90 transition-colors"
                      disabled={loadingExam}
                    >
                      {loadingExam ? 'Opening Exam...' : 'Start Exam'}
                    </button>
                  </div>
                );
              }) : (
                <div className="col-span-2 rounded-2xl border-2 border-dashed border-white/5 p-12 text-center">
                  <p className="text-brand-text-secondary">
                    {searchQuery ? `No courses found matching "${searchQuery}"` : "No active courses found. Time to enroll!"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Videos */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Video className="w-5 h-5 text-brand-crystal" />
                Latest Video Lectures
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.length > 0 ? videos.map((video) => {
                return (
                  <a 
                    key={video._id} 
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-brand-sidebar rounded-xl overflow-hidden border border-white/5 hover:scale-[1.02] transition-transform"
                  >
                    <div className="aspect-video bg-black/40 flex items-center justify-center relative overflow-hidden">
                              {video.thumbnail ? (
                        <img 
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:brightness-110 transition-all"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <Video className="w-10 h-10 text-brand-crystal/50 group-hover:text-brand-crystal transition-colors" />
                        </>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/80 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <ArrowRight className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-mono font-bold text-white uppercase tracking-tighter">▶ WATCH</span>
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-white truncate mb-1 group-hover:text-brand-crystal transition-colors">{video.title}</h4>
                      <p className="text-[10px] font-bold text-brand-crystal uppercase tracking-widest">Open in YouTube</p>
                    </div>
                  </a>
                );
              }) : (
                <div className="col-span-1 md:col-span-3 rounded-2xl border-2 border-dashed border-white/5 p-12 text-center">
                  <p className="text-brand-text-secondary">📺 No video lectures available yet. Your mentor will add them soon!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Performance */}
        <div className="space-y-8">
          {/* Results Summary */}
          <div className="rounded-3xl bg-brand-card p-6 border border-white/5">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white mb-6">
              <TrendingUp className="w-5 h-5 text-brand-crystal" />
              Recent Scores
            </h2>
            <div className="space-y-4">
              {results.length > 0 ? results.slice(0, 4).map((result) => (
                <div key={result._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{result.examId?.title || "Assessment"}</p>
                    <p className="text-[10px] text-brand-text-secondary flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(result.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`text-sm font-black px-3 py-1 rounded-lg ${result.score >= 50 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {result.score}%
                  </div>
                </div>
              )) : (
                <p className="text-center text-xs text-brand-text-secondary py-8">Take your first exam to see results!</p>
              )}
            </div>
            {results.length > 0 && (
              <button className="w-full mt-6 py-4 rounded-2xl bg-white/5 text-brand-text-secondary text-xs font-bold hover:bg-white/10 transition-all">
                VIEW FULL TRANSCRIPT
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

