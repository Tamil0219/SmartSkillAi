# SkillMatrix AI - Login Troubleshooting Guide

## ✅ Current Status
- **Admin User:** ✓ Exists
- **Email:** `admin@skillmatrix.ai`
- **Password:** `admin123`
- **MongoDB:** ✓ Connected and running
- **Database:** `skillmatrixai`

---

## 🔧 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
cd backend
node setup-login.js
npm start
```

### Option 2: Manual Setup

#### Step 1: Start MongoDB
```bash
# Windows
mongod

# Or if using MongoDB Atlas, ensure connection string is in .env
```

#### Step 2: Start Backend Server
```bash
cd backend
npm install
npm start
```

#### Step 3: Start Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Step 4: Access Application
- Open browser: `http://localhost:5173`
- Login with:
  - **Email:** `admin@skillmatrix.ai`
  - **Password:** `admin123`

---

## ❌ Common Login Issues & Fixes

### Issue 1: "Invalid email or account not found"

**Cause:** Backend server is not running or database is not connected.

**Solution:**
```bash
# In terminal 1 - Start MongoDB
mongod

# In terminal 2 - Start Backend
cd backend
node setup-login.js
npm start

# Expected output:
# MongoDB Connected
# Default Admin Created (or already exists)
# Server running on port 5000
```

### Issue 2: "Network error: Unable to reach server"

**Cause:** Frontend cannot connect to backend server.

**Solution:**
1. Verify backend is running on port 5000
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Windows PowerShell:
Get-Process -ErrorAction SilentlyContinue | Where-Object {$_.Handles -gt 0} | Select-Object ProcessName, Id | ? {$_.Id -eq <PID>}
```

2. Check frontend `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

3. Verify CORS settings are correct in `backend/server.js`

### Issue 3: Incorrect Password Error

**Cause:** Password is incorrect or user needs to be reset.

**Solution:**
```bash
# Reset admin password
cd backend
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/skillmatrixai').then(async () => {
  const newPassword = await bcrypt.hash('admin123', 10);
  await User.updateOne(
    { email: 'admin@skillmatrix.ai' },
    { password: newPassword }
  );
  console.log('✓ Password reset to: admin123');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
"
```

### Issue 4: Database Connection Failed

**Cause:** MongoDB is not running or connection string is incorrect.

**Solution:**
```bash
# 1. Check MongoDB is running
mongod

# 2. Verify connection string in .env
MONGODB_URI=mongodb://127.0.0.1:27017/skillmatrixai

# 3. Check MongoDB port (default: 27017)
netstat -ano | findstr :27017

# 4. If using MongoDB Atlas, update .env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillmatrixai
```

### Issue 5: Multiple Admin Accounts Confusion

**Solution:** Create additional users with proper roles

```bash
cd backend
node -e "
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/skillmatrixai').then(async () => {
  // Create mentor
  const mentorPassword = await bcrypt.hash('mentor123', 10);
  await User.create({
    name: 'Sample Mentor',
    email: 'mentor@skillmatrix.ai',
    password: mentorPassword,
    role: 'mentor'
  });
  
  // Create student
  const studentPassword = await bcrypt.hash('student123', 10);
  await User.create({
    name: 'Sample Student',
    email: 'student@skillmatrix.ai',
    password: studentPassword,
    role: 'student'
  });
  
  console.log('✓ Users created');
  console.log('Mentor: mentor@skillmatrix.ai / mentor123');
  console.log('Student: student@skillmatrix.ai / student123');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
"
```

---

## 🚀 Full Startup Checklist

- [ ] MongoDB is running (`mongod` in terminal)
- [ ] Backend server started (`npm start` in backend folder)
- [ ] Frontend dev server started (`npm run dev` in frontend folder)
- [ ] Browser open to `http://localhost:5173`
- [ ] Login credentials entered: `admin@skillmatrix.ai` / `admin123`
- [ ] API URL in frontend `.env` is `http://localhost:5000/api`
- [ ] Port 5000 (backend) and 5173 (frontend) are not blocked by firewall

---

## 📋 Default Credentials

| Role    | Email                      | Password  | Path           |
|---------|----------------------------|-----------|----------------|
| Admin   | admin@skillmatrix.ai       | admin123  | /admin/dashboard |
| Mentor  | mentor@skillmatrix.ai      | mentor123 | /mentor/dashboard |
| Student | student@skillmatrix.ai     | student123| /student       |

---

## 🔍 Debug Commands

### Check database connectivity
```bash
cd backend
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://127.0.0.1:27017/skillmatrixai').then(() => { console.log('✓ MongoDB connected'); process.exit(0); }).catch(e => { console.error('✗ MongoDB error:', e.message); process.exit(1); });"
```

### List all users
```bash
cd backend
node -e "const mongoose = require('mongoose'); const User = require('./models/User'); mongoose.connect('mongodb://127.0.0.1:27017/skillmatrixai').then(async () => { const users = await User.find(); console.log('Users:', users.map(u => ({email: u.email, role: u.role}))); process.exit(0); });"
```

### Test login endpoint
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skillmatrix.ai","password":"admin123"}'
```

---

## 💡 Tips

1. **Always start MongoDB first**, then backend, then frontend
2. **Check browser console** for detailed error messages (F12)
3. **Check terminal outputs** for server errors
4. **Clear browser localStorage** if having token issues:
   - Open DevTools (F12)
   - Application → LocalStorage → Clear All
5. **Use the setup script** for quick verification:
   ```bash
   cd backend && node setup-login.js
   ```

---

## 📞 Need Help?

If login still doesn't work:
1. Run: `node setup-login.js`
2. Check MongoDB is running
3. Check backend console for errors
4. Check browser console (F12)
5. Check `.env` file configuration
6. Verify ports 5000 (backend) and 5173 (frontend) are not in use
