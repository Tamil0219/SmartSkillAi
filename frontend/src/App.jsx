import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import MentorDashboard from "./pages/MentorDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CoursesPage from "./pages/CoursesPage";
import ExamPage from "./pages/ExamPage";
import ResultPage from "./pages/ResultPage";
import ChatbotPage from "./pages/ChatbotPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import PerformanceAnalytics from "./pages/PerformanceAnalytics";
import StudentsPage from "./pages/StudentsPage";
import MentorsPage from "./pages/MentorsPage";
import MentorProfile from "./pages/MentorProfile";
import AdminProfile from "./pages/AdminProfile";
import SettingsPage from "./pages/SettingsPage";
import MentorsManagement from "./pages/MentorsManagement";
import StudentsManagement from "./pages/StudentsManagement";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<MainLayout />}>
          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/mentors" element={<ProtectedRoute role="admin"><MentorsManagement /></ProtectedRoute>} />
          <Route path="/admin/students" element={<ProtectedRoute role="admin"><StudentsManagement /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><PerformanceAnalytics /></ProtectedRoute>} />
          <Route path="/admin/courses" element={<ProtectedRoute role="admin"><CoursesPage /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute role="admin"><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />

          {/* Mentor Routes */}
          <Route path="/mentor/dashboard" element={<ProtectedRoute role="mentor"><MentorDashboard /></ProtectedRoute>} />
          <Route path="/mentor/students" element={<ProtectedRoute role="mentor"><StudentsPage /></ProtectedRoute>} />
          <Route path="/mentor/courses" element={<ProtectedRoute role="mentor"><CoursesPage /></ProtectedRoute>} />
          <Route path="/mentor/resources" element={<ProtectedRoute role="mentor"><div>Resources Page</div></ProtectedRoute>} />
          <Route path="/mentor/create-exam" element={<ProtectedRoute role="mentor"><div>Create Exam Page</div></ProtectedRoute>} />
          <Route path="/mentor/analytics" element={<ProtectedRoute role="mentor"><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/mentor/profile" element={<ProtectedRoute role="mentor"><MentorProfile /></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/exam" element={<ExamPage />} />
          <Route path="/exam/:courseId/:topicName" element={<ExamPage />} />
          <Route path="/results" element={<ResultPage />} />
          <Route path="/student/chatbot" element={<ProtectedRoute role="student"><ChatbotPage /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ChatbotPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate replace to="/admin" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
