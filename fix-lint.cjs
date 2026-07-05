const fs = require('fs');
const path = require('path');
// Override AdminDashboard JSX directly to guarantee clean syntax (removes bad duplicate blocks)
function rewriteAdminDashboard() {
  const adPath = path.join(process.cwd(), 'src/pages/AdminDashboard.jsx');
  const content = `import { useEffect, useState } from "react";
import API from "../services/api";
import DashboardCard from "../components/DashboardCard";

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({ students: 0, mentors: 0, courses: 0, exams: 0 });

  useEffect(() => {
    API.get('/admin/dashboard')
      .then((res) => setDashboardData(res.data.data || res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="space-y-8">
      <h1>Admin Dashboard</h1>
      <DashboardCard title="Total Students" value={dashboardData.students} icon={<span>👩‍🎓</span>} />
    </section>
  );
}
`;
  fs.writeFileSync(adPath, content, 'utf8');
}

rewriteAdminDashboard();

const pages = ['src/pages/AnalyticsPage.jsx','src/pages/ExamPage.jsx','src/pages/MentorDashboard.jsx','src/pages/MentorsPage.jsx','src/pages/StudentDashboard.jsx'];
for (const p of pages) {
  const fp = path.join(process.cwd(), p);
  let t = fs.readFileSync(fp, 'utf8');
  t = t.replace(/const (fetch[A-Z][A-Za-z0-9_]*) = \(\) => \{/g, 'function $1() {');
  fs.writeFileSync(fp, t, 'utf8');
}
// Login cleanup
const loginPath = path.join(process.cwd(), 'src/pages/Login.jsx');
let loginText = fs.readFileSync(loginPath, 'utf8');
loginText = loginText.replace(/import \{ useState \} from "react";\s*import \{ Link, useNavigate \} from "react-router-dom";/, 'import { useState } from "react";\nimport { Link } from "react-router-dom";');
loginText = loginText.replace(/const navigate = useNavigate\(\);\n/, '');
fs.writeFileSync(loginPath, loginText, 'utf8');
// backend fixes
const killPortPath = path.join(process.cwd(), 'backend/scripts/killPort.js');
let killPortText = fs.readFileSync(killPortPath, 'utf8');
killPortText = killPortText.replace(/exec\(cmd, \{ windowsHide: true \}, \(err, stdout, stderr\) => \{/, 'exec(cmd, { windowsHide: true }, (err, stdout, _stderr) => {');
fs.writeFileSync(killPortPath, killPortText, 'utf8');
const serverPath = path.join(process.cwd(), 'backend/server.js');
let serverText = fs.readFileSync(serverPath, 'utf8');
serverText = serverText.replace(/app.use\(\(err, req, res, next\) => \{/, 'app.use((err, req, res, _next) => {');
fs.writeFileSync(serverPath, serverText, 'utf8');
console.log('patch done');
