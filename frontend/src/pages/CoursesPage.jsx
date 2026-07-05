import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getUser } from "../utils/auth";
import CourseCard from "../components/CourseCard";

export default function CoursesPage() {
  const user = getUser();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", youtubeUrl: "", notes: "", attachments: [] });
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  
  // Exam creation state
  const [showExamForm, setShowExamForm] = useState(false);
  const [examData, setExamData] = useState({ title: "", timeLimit: 30, completionDate: "", questionCount: 10, questions: [] });
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      let endpoint = "/courses";
      if (user?.role === "mentor") endpoint = "/mentor/courses";
      if (user?.role === "student") endpoint = "/student/courses";
      if (user?.role === "admin") endpoint = "/admin/courses";

      const res = await API.get(endpoint);
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (error) {
      console.error("Courses fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const editCourse = (course) => {
    setEditingCourse(course);
    setNewCourse({
      title: course.title || "",
      description: course.description || "",
      youtubeUrl: course.youtubeUrl || "",
      notes: course.notes || "",
      attachments: course.attachments || []
    });
  };

  const deleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await API.delete(`/mentor/courses/${courseId}`);
      if (res.data.success) {
        fetchCourses();
      }
    } catch (error) {
      console.error("Delete course error:", error);
    }
  };

  const createCourse = async () => {
    if (!user || user.role !== "mentor") return;

    if (!newCourse.title?.trim()) {
      alert("Please enter a course title.");
      return;
    }

    try {
      let res;
      if (editingCourse) {
        res = await API.put(`/mentor/courses/${editingCourse._id}`, newCourse);
      } else {
        res = await API.post("/mentor/courses", newCourse);
      }

      if (res.data.success) {
        // Create exam if form is shown and has questions
        if (showExamForm && generatedQuestions.length > 0) {
          const exam = await createExam(res.data.course._id);
          if (!exam) {
            alert("Course created but exam creation failed. Please create exam manually.");
          }
        }

        setNewCourse({ title: "", description: "", youtubeUrl: "", notes: "", attachments: [] });
        setEditingCourse(null);
        setShowExamForm(false);
        setExamData({ title: "", timeLimit: 30, completionDate: "", questionCount: 10, questions: [] });
        setGeneratedQuestions([]);
        setSelectedPdf(null);
        fetchCourses();
      }
    } catch (error) {
      console.error("Course save error:", error);
    }
  };

  const uploadAttachment = async () => {
    if (!selectedAttachment) return;
    const formData = new FormData();
    formData.append("file", selectedAttachment);

    try {
      setUploadingAttachment(true);
      console.log("Uploading file:", selectedAttachment.name);
      
      const res = await API.post("/mentor/courses/upload-attachment", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload response:", res.data);

      if (res.data.success) {
        const fileUrl = res.data.fileUrl;
        console.log("File uploaded successfully:", fileUrl);
        
        setNewCourse((prev) => ({
          ...prev,
          attachments: [...(prev.attachments || []), fileUrl],
        }));
        setSelectedAttachment(null);
        alert("✅ File uploaded successfully: " + selectedAttachment.name);
      } else {
        alert("❌ Upload failed: " + res.data.message);
      }
    } catch (error) {
      console.error("Attachment upload error:", error);
      alert("❌ Error uploading file: " + (error.response?.data?.message || error.message));
    } finally {
      setUploadingAttachment(false);
    }
  };

  const shuffleQuestions = (items) => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  };

  const generateQuestionsFromPdf = async () => {
    if (!selectedPdf) {
      alert("Please select a PDF file");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", selectedPdf);
    formData.append("questionCount", String(examData.questionCount || 10));
    formData.append("difficulty", "Medium");

    try {
      setGeneratingQuestions(true);
      console.log("Generating questions from PDF...");
      
      const res = await API.post("/mentor/courses/generate-questions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const shuffledQuestions = shuffleQuestions(res.data.questions);
        setGeneratedQuestions(shuffledQuestions);
        setExamData((prev) => ({
          ...prev,
          questions: shuffledQuestions,
        }));
        alert("✅ Generated " + res.data.count + " questions from PDF");
      } else {
        alert("❌ Failed to generate questions: " + res.data.message);
      }
    } catch (error) {
      console.error("Generate questions error:", error);
      alert("❌ Error: " + (error.response?.data?.message || error.message));
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const createExam = async (courseId) => {
    if (!examData.title?.trim()) {
      alert("Please enter an exam title");
      return;
    }

    if (generatedQuestions.length === 0) {
      alert("Please generate questions from PDF");
      return;
    }

    try {
      const shuffledQuestions = shuffleQuestions(generatedQuestions);
      const examPayload = {
        title: examData.title,
        courseId: courseId,
        timeLimit: parseInt(examData.timeLimit) || 30,
        completionDate: examData.completionDate || null,
        questionCount: parseInt(examData.questionCount) || generatedQuestions.length,
        questions: shuffledQuestions,
        difficulty: "Medium"
      };

      const res = await API.post("/mentor/exams", examPayload);
      
      if (res.data.success) {
        alert("✅ Exam created successfully!");
        return res.data.exam;
      } else {
        alert("❌ Failed to create exam: " + res.data.message);
        return null;
      }
    } catch (error) {
      console.error("Create exam error:", error);
      alert("❌ Error creating exam: " + (error.response?.data?.message || error.message));
      return null;
    }
  };

  const cancelEdit = () => {
    setEditingCourse(null);
    setNewCourse({ title: "", description: "", youtubeUrl: "", notes: "", attachments: [] });
  };

  const handleStartExam = async (course) => {
    try {
      const res = await API.post("/student/generate-exam", { courseId: course._id });
      if (res.data.success) {
        // Navigate to exam page with the generated exam
        navigate("/exam", { state: { generatedExam: res.data.exam } });
      } else {
        alert("Failed to generate exam. Please try again.");
      }
    } catch (error) {
      console.error("Generate exam error:", error);
      alert("Failed to generate exam. Please try again.");
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageTitle =
    user?.role === "mentor"
      ? "My Courses"
      : user?.role === "student"
      ? "Available Courses"
      : "Courses";

  const pageDescription =
    user?.role === "mentor"
      ? "Create and manage your learning paths."
      : user?.role === "student"
      ? "Browse the courses made available by your mentor."
      : "Manage all courses in the system.";

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-text">{pageTitle}</h1>
          <p className="text-sm text-brand-text-secondary">{pageDescription}</p>
        </div>
      </header>

      {user?.role === "mentor" ? (
        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <h2 className="text-lg font-semibold text-brand-text">{editingCourse ? "Edit Course" : "Create New Course"}</h2>
          <div className="mt-4 grid gap-3">
            <input
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              placeholder="Title"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
            />
            <input
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              placeholder="Description"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
            />
            <input
              value={newCourse.youtubeUrl}
              onChange={(e) => setNewCourse({ ...newCourse, youtubeUrl: e.target.value })}
              placeholder="YouTube URL"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
            />
            <textarea
              value={newCourse.notes}
              onChange={(e) => setNewCourse({ ...newCourse, notes: e.target.value })}
              placeholder="Notes"
              rows="3"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
            />
            <input
              value={newCourse.attachments.join(', ')}
              onChange={(e) => setNewCourse({ ...newCourse, attachments: e.target.value.split(',').map((s) => s.trim()) })}
              placeholder="Attachment URLs (comma-separated)"
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
            />

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls,.pptx,.ppt,.jpg,.jpeg,.png,.gif"
                onChange={(e) => setSelectedAttachment(e.target.files?.[0] || null)}
                className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
              />
              <button
                type="button"
                onClick={uploadAttachment}
                disabled={!selectedAttachment || uploadingAttachment}
                className="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
              >
                {uploadingAttachment ? 'Uploading...' : 'Upload'}
              </button>
            </div> 

            {newCourse.attachments.length > 0 && (
              <div className="text-xs text-brand-text-secondary mt-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="font-semibold text-green-400 mb-2">✅ Attached Files:</p>
                <ul className="space-y-1">
                  {newCourse.attachments.map((a, idx) => {
                    const filename = a.split('/').pop() || a;
                    return (
                      <li key={idx} className="flex items-center justify-between">
                        <span className="text-brand-text-secondary">📄 {filename}</span>
                        <button
                          type="button"
                          onClick={() => setNewCourse({ ...newCourse, attachments: newCourse.attachments.filter((_, i) => i !== idx) })}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Remove
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Exam Creation Section */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowExamForm(!showExamForm)}
                className="w-full py-2 px-3 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-sm font-semibold hover:bg-indigo-500/30 transition"
              >
                {showExamForm ? "❌ Hide Exam Creation" : "📋 Create Exam for This Course"}
              </button>

              {showExamForm && (
                <div className="mt-4 space-y-3 p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                  <h3 className="text-sm font-semibold text-indigo-400">Create Exam with AI-Generated Questions</h3>
                  
                  <input
                    type="text"
                    value={examData.title}
                    onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                    placeholder="Exam Title (e.g., Java Fundamentals Quiz)"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
                  />

                  <input
                    type="number"
                    value={examData.timeLimit}
                    onChange={(e) => setExamData({ ...examData, timeLimit: e.target.value })}
                    placeholder="Time Limit (minutes)"
                    min="5"
                    max="180"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
                  />

                  <input
                    type="number"
                    value={examData.questionCount}
                    onChange={(e) => setExamData({ ...examData, questionCount: e.target.value })}
                    placeholder="Question Set Size"
                    min="1"
                    max="100"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
                  />

                  <input
                    type="date"
                    value={examData.completionDate}
                    onChange={(e) => setExamData({ ...examData, completionDate: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
                    title="Exam Completion Deadline"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSelectedPdf(e.target.files?.[0] || null)}
                      className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-brand-text"
                      title="Upload PDF with course content to generate questions"
                    />
                    <button
                      type="button"
                      onClick={generateQuestionsFromPdf}
                      disabled={!selectedPdf || generatingQuestions}
                      className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-black disabled:opacity-40 hover:bg-cyan-400"
                    >
                      {generatingQuestions ? '⏳ Generating...' : '✨ Generate'}
                    </button>
                  </div>

                  {generatedQuestions.length > 0 && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <p className="text-xs text-green-400 font-semibold">✅ Generated {generatedQuestions.length} questions</p>
                      <ul className="text-xs text-brand-text-secondary mt-2 space-y-1 max-h-32 overflow-y-auto">
                        {generatedQuestions.map((q, idx) => (
                          <li key={idx} className="text-ellipsis overflow-hidden">Q{idx + 1}: {q.question?.substring(0, 60)}...</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={createCourse}
                className="flex-1 rounded-xl bg-brand-crystal px-4 py-3 text-sm font-semibold text-black hover:bg-brand-crystal/90"
              >
                {editingCourse ? "Update Course" : "Create Course"}
              </button>
              {editingCourse && (
                <button
                  onClick={cancelEdit}
                  className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-brand-text hover:bg-white/10"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full text-center text-brand-text-secondary">Loading courses…</div>
        ) : courses.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-white/10 bg-brand-card p-6 text-center text-brand-text-secondary">
            No courses found.
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course._id}
              title={course.title}
              mentor={course.mentorId?.name || course.mentor || "Unknown"}
              difficulty={course.difficulty ?? "--"}
              progress={course.progress ?? 0}
              youtubeUrl={course.youtubeUrl}
              notes={course.notes}
              attachments={course.attachments}
              isMentor={user?.role === "mentor"}
              onEdit={() => editCourse(course)}
              onDelete={() => deleteCourse(course._id)}
              onContinue={() => handleStartExam(course)}
            />
          ))
        )}
      </div>
    </section>
  );
}
