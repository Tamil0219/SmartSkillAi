# Admin Dashboard API Testing Guide

## Authentication

### 1. Login (Get Token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smarteval.ai",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "69c559e36cf5e9fa...",
    "name": "System Admin",
    "role": "admin"
  }
}
```

**Save the token** for subsequent requests:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Mentor Management

### 1. Create Mentor
```bash
curl -X POST http://localhost:5000/api/admin/create-mentor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Dr. Jane Smith",
    "email": "jane.smith@university.edu",
    "password": "SecurePass123",
    "mobile": "+1-555-0101",
    "department": "Computer Science"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Mentor created successfully",
  "mentor": {
    "id": "60d5ec49c1234567...",
    "name": "Dr. Jane Smith",
    "email": "jane.smith@university.edu",
    "department": "Computer Science"
  }
}
```

### 2. Get All Mentors
```bash
curl -X GET http://localhost:5000/api/admin/mentors \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "mentors": [
    {
      "_id": "60d5ec49c1234567...",
      "name": "Dr. Jane Smith",
      "email": "jane.smith@university.edu",
      "department": "Computer Science",
      "mobile": "+1-555-0101",
      "studentCount": 5,
      "role": "mentor",
      "createdAt": "2026-03-26T10:00:00Z"
    }
  ]
}
```

### 3. Update Mentor
```bash
curl -X PUT http://localhost:5000/api/admin/mentor/60d5ec49c1234567 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Dr. Jane Smith",
    "email": "jane.smith@university.edu",
    "mobile": "+1-555-0102",
    "department": "Computer Science"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Mentor updated successfully",
  "mentor": {
    "id": "60d5ec49c1234567...",
    "name": "Dr. Jane Smith",
    "email": "jane.smith@university.edu",
    "department": "Computer Science"
  }
}
```

### 4. Delete Mentor
```bash
curl -X DELETE http://localhost:5000/api/admin/mentor/60d5ec49c1234567 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Mentor deleted successfully"
}
```

---

## Student Management

### 1. Create Student
```bash
curl -X POST http://localhost:5000/api/admin/create-student \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "password": "StudentPass123",
    "mobile": "+1-555-0201",
    "department": "Computer Science",
    "mentorId": "60d5ec49c1234567"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Student created successfully",
  "student": {
    "id": "60d5ec49c1234568...",
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "department": "Computer Science"
  }
}
```

### 2. Get All Students
```bash
curl -X GET http://localhost:5000/api/admin/students \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "students": [
    {
      "_id": "60d5ec49c1234568...",
      "name": "John Doe",
      "email": "john.doe@university.edu",
      "department": "Computer Science",
      "mobile": "+1-555-0201",
      "mentorId": {
        "_id": "60d5ec49c1234567...",
        "name": "Dr. Jane Smith"
      },
      "role": "student",
      "createdAt": "2026-03-26T10:00:00Z"
    }
  ]
}
```

### 3. Update Student
```bash
curl -X PUT http://localhost:5000/api/admin/student/60d5ec49c1234568 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "mobile": "+1-555-0202",
    "department": "Computer Science",
    "mentorId": "60d5ec49c1234567"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Student updated successfully",
  "student": {
    "id": "60d5ec49c1234568...",
    "name": "John Doe",
    "email": "john.doe@university.edu",
    "department": "Computer Science"
  }
}
```

### 4. Delete Student
```bash
curl -X DELETE http://localhost:5000/api/admin/student/60d5ec49c1234568 \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "message": "Student deleted successfully"
}
```

---

## Analytics

### 1. Get Analytics Data
```bash
curl -X GET http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 25,
    "totalMentors": 5,
    "totalCourses": 10,
    "totalExams": 20,
    "averageScore": 78.5,
    "topStudents": [
      {
        "_id": "60d5ec49c1234569...",
        "score": 95,
        "studentId": {
          "name": "Alice Johnson"
        },
        "examId": {
          "title": "Web Development Final"
        }
      }
    ],
    "studentsByDept": [
      {
        "_id": "Computer Science",
        "count": 12
      },
      {
        "_id": "Business",
        "count": 8
      }
    ]
  }
}
```

---

## Courses

### 1. Create Course
```bash
curl -X POST http://localhost:5000/api/admin/create-course \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Web Development 101",
    "description": "Learn HTML, CSS, and JavaScript",
    "mentorId": "60d5ec49c1234567"
  }'
```

**Response:**
```json
{
  "success": true,
  "course": {
    "_id": "60d5ec49c123456a...",
    "title": "Web Development 101",
    "description": "Learn HTML, CSS, and JavaScript",
    "mentorId": "60d5ec49c1234567",
    "adminId": "69c559e36cf5e9fa...",
    "createdAt": "2026-03-26T10:00:00Z"
  }
}
```

### 2. Get All Courses
```bash
curl -X GET http://localhost:5000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "courses": [
    {
      "_id": "60d5ec49c123456a...",
      "title": "Web Development 101",
      "description": "Learn HTML, CSS, and JavaScript",
      "mentorId": {
        "_id": "60d5ec49c1234567...",
        "name": "Dr. Jane Smith"
      },
      "adminId": "69c559e36cf5e9fa...",
      "createdAt": "2026-03-26T10:00:00Z"
    }
  ]
}
```

---

## Error Handling

### Common Errors

#### 1. Invalid Email
```json
{
  "success": false,
  "message": "Invalid email format"
}
```

#### 2. Duplicate Email
```json
{
  "success": false,
  "message": "Email already exists"
}
```

#### 3. Weak Password
```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

#### 4. Unauthorized (Missing Token)
```json
{
  "success": false,
  "message": "No token provided"
}
```

#### 5. Invalid Mentor
```json
{
  "success": false,
  "message": "Invalid mentor"
}
```

#### 6. Not Found
```json
{
  "success": false,
  "message": "Mentor not found"
}
```

---

## Testing Scripts

### Bash Script to Test All Endpoints

Create `test_admin_api.sh`:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:5000/api"

# 1. Login
echo -e "${GREEN}1. Testing Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smarteval.ai",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 2. Create Mentor
echo -e "${GREEN}2. Creating Mentor...${NC}"
MENTOR=$(curl -s -X POST $API_URL/admin/create-mentor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Mentor",
    "email": "mentor@test.com",
    "password": "Test1234",
    "mobile": "+1-555-0101",
    "department": "Computer Science"
  }')

MENTOR_ID=$(echo $MENTOR | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Mentor ID: $MENTOR_ID"

# 3. Get Mentors
echo -e "${GREEN}3. Getting All Mentors...${NC}"
curl -s -X GET $API_URL/admin/mentors \
  -H "Authorization: Bearer $TOKEN" | head -100

# 4. Create Student
echo -e "${GREEN}4. Creating Student...${NC}"
STUDENT=$(curl -s -X POST $API_URL/admin/create-student \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"name\": \"Test Student\",
    \"email\": \"student@test.com\",
    \"password\": \"Test1234\",
    \"mobile\": \"+1-555-0201\",
    \"department\": \"Computer Science\",
    \"mentorId\": \"$MENTOR_ID\"
  }")

echo $STUDENT

# 5. Get Students
echo -e "${GREEN}5. Getting All Students...${NC}"
curl -s -X GET $API_URL/admin/students \
  -H "Authorization: Bearer $TOKEN" | head -100

# 6. Get Analytics
echo -e "${GREEN}6. Getting Analytics...${NC}"
curl -s -X GET $API_URL/admin/analytics \
  -H "Authorization: Bearer $TOKEN"

echo -e "${GREEN}All tests completed!${NC}"
```

Run it:
```bash
chmod +x test_admin_api.sh
./test_admin_api.sh
```

---

## Postman Collection

Import into Postman: Create a new collection with these endpoints configured with:
- Base URL: `http://localhost:5000/api`
- Auth: Bearer Token (from login response)
- Headers: `Content-Type: application/json`

---

**Last Updated**: March 26, 2026

For issues or questions, refer to backend logs or create an issue.
