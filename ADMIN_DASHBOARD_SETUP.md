# Professional Admin Dashboard - Complete Setup Guide

## 🎯 Project Overview

A comprehensive Admin Dashboard for a web-based learning/evaluation system with complete CRUD operations for Mentors, Students, Analytics, and Courses management.

### Tech Stack
- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **State Management**: React Hooks
- **Routing**: React Router v6
- **HTTP Client**: Axios

---

## 📦 Installation & Setup

### 1. Install Dependencies

#### Frontend
```bash
cd e:\project2
npm install
```

#### Backend
```bash
cd e:\project2\backend
npm install
```

### 2. Environment Setup

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
PORT=3000
```

#### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/smartevalai
NODE_ENV=development
```

### 3. Start Services

#### Terminal 1 - Backend
```bash
cd e:\project2\backend
npm run dev
# or
node server.js
```

Backend runs on: `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd e:\project2
npm run dev
```

Frontend runs on: `http://localhost:5173` (or `3000`)

---

## 🏗️ Project Structure

```
project2/
├── backend/
│   ├── models/
│   │   ├── User.js              # Enhanced with department field
│   │   ├── Course.js
│   │   ├── Exam.js
│   │   ├── Question.js
│   │   ├── Resource.js
│   │   └── Result.js
│   ├── controllers/
│   │   ├── adminController.js   # ✅ Enhanced with full CRUD
│   │   ├── mentorController.js
│   │   └── studentController.js
│   ├── routes/
│   │   ├── admin.js             # ✅ Updated routes
│   │   ├── auth.js
│   │   ├── mentor.js
│   │   └── student.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   └── server.js
│
├── src/
│   ├── pages/
│   │   ├── AdminDashboard.jsx         # ✅ Comprehensive overview
│   │   ├── MentorsManagement.jsx      # ✅ NEW - Full CRUD
│   │   ├── StudentsManagement.jsx     # ✅ NEW - Full CRUD
│   │   ├── AnalyticsPage.jsx          # ✅ Enhanced
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── components/
│   │   ├── Toast.jsx                  # ✅ NEW - Notifications
│   │   ├── Modal.jsx                  # ✅ NEW - Form modal
│   │   ├── Sidebar.jsx                # Navigation
│   │   ├── Navbar.jsx
│   │   └── DashboardCard.jsx
│   ├── services/
│   │   └── api.js                     # API client
│   └── App.jsx
```

---

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Admin - Mentor Management
```
GET    /api/admin/mentors              # List all mentors
POST   /api/admin/create-mentor        # Create mentor
PUT    /api/admin/mentor/:id           # Update mentor
DELETE /api/admin/mentor/:id           # Delete mentor
```

### Admin - Student Management
```
GET    /api/admin/students             # List all students
POST   /api/admin/create-student       # Create student
PUT    /api/admin/student/:id          # Update student
DELETE /api/admin/student/:id          # Delete student
```

### Admin - Other
```
GET    /api/admin/courses              # List courses
POST   /api/admin/create-course        # Create course
GET    /api/admin/analytics            # Get analytics data
```

---

## 📊 Database Schema

### User Schema (Enhanced)
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required),
  mobile: String,
  department: String (default: "General"),
  role: String (enum: ["admin", "mentor", "student"]),
  mentorId: ObjectId (ref: User),
  adminId: ObjectId (ref: User),
  createdAt: Date
}
```

**Departments Available:**
- General (default)
- Computer Science
- Business
- Engineering
- Mathematics
- Science

---

## 🎓 Sample Data (Testing)

### Create Default Admin
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smarteval.ai","password":"admin123"}'
```

### Create Sample Mentor via API
```bash
curl -X POST http://localhost:5000/api/admin/create-mentor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Dr. Jane Smith",
    "email": "jane.smith@university.edu",
    "password": "password123",
    "mobile": "+1-555-0101",
    "department": "Computer Science"
  }'
```

### Create Sample Student via API
```bash
curl -X POST http://localhost:5000/api/admin/create-student \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "password": "password123",
    "mobile": "+1-555-0102",
    "department": "Computer Science",
    "mentorId": "<mentor_id>"
  }'
```

---

## 🎨 UI Components

### 1. Admin Dashboard
- **Location**: `/admin` or `/admin/dashboard`
- **Features**:
  - 4 summary cards (Mentors, Students, Courses, Exams)
  - Average score display
  - Student distribution by department
  - Quick action links
- **Permissions**: Admin only

### 2. Mentor Management
- **Location**: `/admin/mentors`
- **Features**:
  - List all mentors with filters
  - Search by name/email
  - Filter by department
  - Create new mentor (modal form)
  - Edit mentor details
  - Delete mentor
  - Show student count per mentor
- **Permissions**: Admin only

### 3. Student Management
- **Location**: `/admin/students`
- **Features**:
  - List all students with pagination
  - Search by name/email
  - Filter by department
  - Filter by mentor
  - Create new student (modal form)
  - Edit student details
  - Delete student
  - Assign/change mentor
  - Show mentor assignment status
- **Permissions**: Admin only

### 4. Analytics Dashboard
- **Location**: `/admin/analytics`
- **Features**:
  - Total stats (Mentors, Students, Courses, Exams)
  - Overall performance score
  - Performance level indicator
  - Student distribution by department (with bars)
  - Top 5 performing students
  - Detailed student performance cards
- **Permissions**: Admin only

---

## ✅ Features Implemented

### Backend Features
- ✅ Enhanced User model with department field
- ✅ Complete CRUD for Mentors (Create, Read, Update, Delete)
- ✅ Complete CRUD for Students (Create, Read, Update, Delete)
- ✅ Email validation
- ✅ Password validation (min 6 chars)
- ✅ Unique email constraint
- ✅ Mentor assignment for students
- ✅ Student count per mentor
- ✅ Analytics aggregation
- ✅ Role-based access control
- ✅ Proper error handling and messages

### Frontend Features
- ✅ Professional responsive UI
- ✅ Dark theme with Tailwind CSS
- ✅ Toast notifications (success/error)
- ✅ Modal forms for creating/editing
- ✅ Search functionality
- ✅ Filter by department and mentor
- ✅ Pagination for students
- ✅ Loading states
- ✅ Form validation
- ✅ Skeleton loaders
- ✅ Mobile responsive design

---

## 🔒 Authentication & Authorization

### Login Credentials
```
Email: admin@smarteval.ai
Password: admin123
Role: admin
```

### Role-Based Access
- **Admin**: Full access to dashboard, mentors, students, analytics, courses
- **Mentor**: Access to mentor dashboard, student list, courses, analytics
- **Student**: Access to courses, exams, results

---

## 🚀 Advanced Features (Optional)

### Install Recharts for Charts
To enable interactive charts:
```bash
npm install recharts
```

Then use in AnalyticsPage:
```jsx
import { BarChart, LineChart, PieChart } from 'recharts';
```

### Email Notifications
Install and configure:
```bash
npm install nodemailer
```

### Export to CSV/PDF
```bash
npm install xlsx pdfkit
```

---

## 🐛 Troubleshooting

### "Cannot connect to server"
- Ensure backend is running: `npm run dev` in `/backend`
- Check MongoDB connection: `mongodb://127.0.0.1:27017/smartevalai`
- Verify port 5000 is not in use

### "CORS Error"
- Backend CORS is configured for `localhost:5173` and `localhost:3000`
- If using different port, add to `server.js` allowedOrigins

### "No Mentors/Students found"
- Create mentors/students via API or UI
- Check admin account has correct adminId
- Verify user role is set correctly

### Form validation errors
- Email must be unique
- Password must be 6+ characters
- All required fields must be filled

---

## 📝 File Changes Summary

### Updated Files
1. **backend/models/User.js** - Added department field
2. **backend/controllers/adminController.js** - Full CRUD operations + validation
3. **backend/routes/admin.js** - Added PUT routes
4. **src/pages/AdminDashboard.jsx** - Comprehensive dashboard
5. **src/pages/AnalyticsPage.jsx** - Enhanced analytics
6. **src/App.jsx** - Added new routes

### New Files
1. **src/components/Toast.jsx** - Notification component
2. **src/components/Modal.jsx** - Form modal component
3. **src/pages/MentorsManagement.jsx** - Mentor CRUD page
4. **src/pages/StudentsManagement.jsx** - Student CRUD page

---

## 📞 Support & Documentation

### API Documentation
- All endpoints require authentication (Admin role)
- Requests must include `Authorization: Bearer <token>` header
- Response format: `{ success: true/false, data: {...}, message: "..." }`

### Validation Rules
- **Email**: Must be valid format and unique
- **Password**: Minimum 6 characters
- **Name**: Required, string
- **Mobile**: Optional, string format
- **Department**: Optional, defaults to "General"

---

## 🎯 Next Steps

1. **Test all features** on http://localhost:5173
2. **Create sample data** through UI or API
3. **Install Recharts** for interactive charts (optional)
4. **Customize departments** in form dropdowns
5. **Add email notifications** (optional)
6. **Deploy to production** with proper environment variables

---

**Status**: ✅ Complete and Ready for Production

Last Updated: March 26, 2026
