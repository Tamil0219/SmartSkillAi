import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import ExamQuestion from "../components/ExamQuestion";

export default function ExamPage() {
  const location = useLocation();
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [examAnswers, setExamAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTime, setInitialTime] = useState(0);

  const fetchExams = () => {
    API.get("/student/exams")
      .then((res) => {
        if (res.data.success) {
          setExams(res.data.exams);
        }
      })
      .catch((err) => console.error("Exams fetch error:", err));
  };

  const loadExam = useCallback((exam) => {
    setSelectedExam(exam);
    setCurrentIndex(0);
    setSelectedAnswer("");
    setExamAnswers({});

    const timeLimitMinutes = Number(exam.timeLimit) > 0 ? Number(exam.timeLimit) : 10;
    const timeLimitSeconds = timeLimitMinutes * 60;
    setTimeLeft(timeLimitSeconds);
    setInitialTime(timeLimitSeconds);

    API.get(`/student/exams/${exam._id}/questions`)
      .then((res) => {
        if (res.data.success) {
          setQuestions(res.data.questions);
        }
      })
      .catch((err) => console.error("Exam questions fetch error:", err));
  }, []);

  const submitExam = useCallback((finalAnswers = examAnswers) => {
    if (!selectedExam) return;

    const timeSpentSeconds = initialTime - timeLeft;
    const minutes = Math.floor(timeSpentSeconds / 60);
    const seconds = timeSpentSeconds % 60;
    const timeSpentString = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    console.log("Submitting exam with:", {
      examId: selectedExam._id,
      answersCount: Object.keys(finalAnswers).length,
      timeSpent: timeSpentString,
      initialTime,
      timeLeft,
      totalSeconds: timeSpentSeconds,
    });

    API.post("/student/submit-exam", {
      examId: selectedExam._id,
      answers: finalAnswers,
      timeSpent: timeSpentString,
    })
      .then((res) => {
        if (res.data.success) {
          console.log("Exam submitted successfully:", res.data.result);
          alert(res.data.message);
          setSelectedExam(null);
          setQuestions([]);
          setCurrentIndex(0);
          setSelectedAnswer("");
          setExamAnswers({});
          setTimeLeft(0);
          fetchExams();
        }
      })
      .catch((err) => {
        console.error("Submit exam error:", err);
        alert("Failed to submit exam. Please try again.");
      });
  }, [examAnswers, initialTime, selectedExam, timeLeft]);

  useEffect(() => {
    if (location.state?.generatedExam) {
      queueMicrotask(() => loadExam(location.state.generatedExam));
    } else {
      fetchExams();
    }
  }, [loadExam, location.state]);

  useEffect(() => {
    if (!selectedExam || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedExam, timeLeft]);

  useEffect(() => {
    if (selectedExam && timeLeft === 0) {
      console.log("Timer expired, auto-submitting...");
      submitExam();
    }
  }, [submitExam, timeLeft, selectedExam]);

  const formattedTimer = useMemo(() => {
    const min = Math.floor(timeLeft / 60);
    const sec = timeLeft % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  }, [timeLeft]);

  const handleNext = () => {
    if (!selectedExam) return;

    const newAnswers = { ...examAnswers, [currentQuestion._id]: selectedAnswer };
    setExamAnswers(newAnswers);
    setSelectedAnswer("");

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      submitExam(newAnswers);
    }
  };

  const currentQuestion = questions[currentIndex] || {};

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-crystal to-white bg-clip-text text-transparent">
            {selectedExam ? selectedExam.title : "Smart Selection"}
          </h1>
          <p className="text-sm text-brand-text-secondary">
            {selectedExam ? `Question ${currentIndex + 1} of ${questions.length}` : "Browse available assessments and challenge yourself."}
          </p>
        </div>
        {selectedExam ? (
          <div className="flex items-center gap-3 rounded-2xl bg-brand-card/50 backdrop-blur-xl border border-white/5 px-6 py-3 text-lg font-mono text-brand-text shadow-xl">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-semibold text-brand-crystal">{formattedTimer}</span>
          </div>
        ) : null}
      </header>

      {!selectedExam ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam._id} className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
              <h3 className="text-lg font-semibold text-brand-text">{exam.title}</h3>
              <p className="text-sm text-brand-text-secondary mt-2">Course: {exam.courseId?.title || "Unknown"}</p>
              <p className="text-sm text-brand-text-secondary mt-1">
                Time limit: {exam.timeLimit ? `${exam.timeLimit} min` : "10 min"}
              </p>
              <p className="text-sm text-brand-text-secondary mt-1">
                Questions: {exam.questionCount || questions.length || 0}
              </p>
              <button
                onClick={() => loadExam(exam)}
                className="mt-4 w-full rounded-xl bg-brand-crystal/20 px-4 py-2 text-sm font-semibold text-brand-crystal hover:bg-brand-crystal/30"
              >
                Start Exam
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-brand-card p-6 shadow-glow">
          <ExamQuestion
            question={currentQuestion.question || "Loading..."}
            options={currentQuestion.options || []}
            selected={selectedAnswer}
            onSelect={setSelectedAnswer}
            onNext={handleNext}
            timer={formattedTimer}
          />
        </div>
      )}
    </section>
  );
}
