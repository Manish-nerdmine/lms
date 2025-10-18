# LMS Platform - Complete API Summary

## 📚 Overview
This document provides a comprehensive overview of all APIs implemented in the LMS platform, organized by feature area.

---

## 🎯 Dashboard Analytics APIs

### Base Route: `/dashboard`

| Method | Endpoint | Description | Doc Link |
|--------|----------|-------------|----------|
| GET | `/dashboard/stats` | Get key metrics (Active Learners, Courses, Completion, Progress) | [📖 Full Docs](DASHBOARD_API_DOCUMENTATION.md) |
| GET | `/dashboard/enrollments` | Get monthly enrollment data for charts | [📖 Full Docs](DASHBOARD_API_DOCUMENTATION.md) |
| GET | `/dashboard/active-learners` | Get most active learners/employees (Top 5) | [📖 Full Docs](DASHBOARD_API_DOCUMENTATION.md) |
| GET | `/dashboard/top-courses` | Get top performing courses by completion rate | [📖 Full Docs](DASHBOARD_API_DOCUMENTATION.md) |
| GET | `/dashboard/new-courses` | Get recently created courses | [📖 Full Docs](DASHBOARD_API_DOCUMENTATION.md) |
| GET | `/dashboard/complete` | **Get ALL dashboard data in one call** ⚡ | [📖 Full Docs](DASHBOARD_API_DOCUMENTATION.md) |

**Quick Reference:** [Dashboard Quick Guide](DASHBOARD_API_QUICK_REFERENCE.md)

---

## 👥 Employee Management APIs

### Base Route: `/employment`

#### Authentication & Profile
| Method | Endpoint | Description | Doc Link |
|--------|----------|-------------|----------|
| POST | `/employment/signup` | Create employee account | [📖 Full Docs](EMPLOYMENT_FEATURE.md) |
| POST | `/employment/login` | Employee login | [📖 Full Docs](EMPLOYMENT_FEATURE.md) |
| PATCH | `/employment/:id/update-password` | Update employee password | [📖 Full Docs](EMPLOYEE_UPDATE_PASSWORD_API.md) |
| PUT | `/employment/:id` | Update employee profile | [📖 Full Docs](EMPLOYMENT_FEATURE.md) |
| GET | `/employment/:id` | Get employee by ID | [📖 Full Docs](EMPLOYMENT_FEATURE.md) |
| GET | `/employment` | Get all employees (with filters, search, pagination) | [📖 Full Docs](EMPLOYMENT_FEATURE.md) |

#### Course Progress & Tracking
| Method | Endpoint | Description | Doc Link |
|--------|----------|-------------|----------|
| POST | `/employment/:id/submit-quiz` | **Submit quiz (1 mark/question, min 8/10 to pass)** | [📖 Full Docs](EMPLOYEE_COURSE_TRACKING_API.md) |
| POST | `/employment/:id/mark-video-complete` | Mark video as complete | [📖 Full Docs](EMPLOYEE_COURSE_TRACKING_API.md) |
| GET | `/employment/:id/progress/:courseId` | Get employee progress for a course | [📖 Full Docs](EMPLOYEE_COURSE_TRACKING_API.md) |
| GET | `/employment/:id/quiz-attempts` | Get all quiz attempts with scores | [📖 Full Docs](EMPLOYEE_COURSE_TRACKING_API.md) |

#### Group & Course Information
| Method | Endpoint | Description | Doc Link |
|--------|----------|-------------|----------|
| GET | `/employment/group/:groupId` | Get courses assigned to group | [📖 Full Docs](EMPLOYMENT_FEATURE.md) |
| GET | `/employment/user-info/:email` | Get employee with user info | [📖 Full Docs](EMPLOYMENT_FEATURE.md) |
| POST | `/employment/upload-excel` | Bulk upload employees from Excel | [📖 Full Docs](EMPLOYMENT_FEATURE.md) |

**Quick Reference:** [Employee APIs Quick Guide](EMPLOYEE_APIS_QUICK_REFERENCE.md)

---

## 🎓 Course Management APIs

### Base Route: `/courses`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/courses` | Create new course |
| GET | `/courses` | Get all courses |
| GET | `/courses/:id` | Get course by ID |
| PUT | `/courses/:id` | Update course |
| DELETE | `/courses/:id` | Delete course |
| GET | `/courses/:id/users-progress` | Get all users enrolled in course with progress |

---

## 📝 Quiz Management APIs

### Base Route: `/courses/:courseId/quizzes`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/courses/:courseId/quizzes` | Create quiz for a course |
| GET | `/courses/:courseId/quizzes` | Get all quizzes for a course |
| GET | `/courses/:courseId/quizzes/:id` | Get specific quiz |
| PATCH | `/courses/:courseId/quizzes/:id` | Update quiz |
| DELETE | `/courses/:courseId/quizzes/:id` | Delete quiz |
| POST | `/courses/:courseId/quizzes/:id/evaluate` | Evaluate quiz submission |

---

## 🎬 Video Management APIs

### Base Route: `/courses/:courseId/videos`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/courses/:courseId/videos` | Add video to course |
| GET | `/courses/:courseId/videos` | Get all videos for a course |
| GET | `/courses/:courseId/videos/:id` | Get specific video |
| PATCH | `/courses/:courseId/videos/:id` | Update video |
| DELETE | `/courses/:courseId/videos/:id` | Delete video |

---

## 👥 Group Management APIs

### Base Route: `/groups`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/groups` | Create new group |
| GET | `/groups` | Get all groups with stats |
| GET | `/groups/:id` | Get group by ID |
| GET | `/groups/:id/with-users` | Get group with users/employees |
| PUT | `/groups/:id` | Update group |
| DELETE | `/groups/:id` | Delete group |
| POST | `/groups/:id/assign-course` | Assign course to group |
| DELETE | `/groups/:id/courses/:courseId` | Remove course from group |
| GET | `/groups/:id/stats` | Get group statistics |

---

## 🏢 Department Management APIs

### Base Route: `/departments`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/departments` | Create department |
| GET | `/departments` | Get all departments |
| GET | `/departments/:id` | Get department by ID |
| PUT | `/departments/:id` | Update department |
| DELETE | `/departments/:id` | Delete department |

---

## 📊 Progress Tracking APIs

### Base Route: `/courses/:courseId/progress`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses/:courseId/progress` | Get user's progress for a course |
| POST | `/courses/:courseId/progress/videos/:videoId/complete` | Mark video as complete |
| POST | `/courses/:courseId/progress/quizzes/:quizId/complete` | Mark quiz as complete |

---

## 🧪 Quiz Attempts APIs

### Base Route: `/quizzes/:quizId/attempts`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/quizzes/:quizId/attempts` | Submit quiz attempt |
| GET | `/quizzes/:quizId/attempts` | Get user's attempts for a quiz |
| GET | `/quizzes/:quizId/attempts/:attemptId` | Get specific attempt details |

---

## 👤 User Management APIs

### Base Route: `/users`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create user |
| GET | `/users` | Get all users (with pagination, search, filters) |
| GET | `/users/:id` | Get user by ID |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

---

## 📧 Email Management APIs

### Base Route: `/email`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/email/send` | Send email |
| POST | `/email/bulk` | Send bulk emails |
| POST | `/email/course-assignment` | Send course assignment emails |

---

## 🎯 Key Features by Use Case

### 📊 Admin Dashboard
Use these APIs to power the admin dashboard:
```javascript
// Single call to get everything
GET /dashboard/complete

// Response includes:
// - Active learners count & change
// - Total courses & change
// - Avg completion rate & change
// - Avg learner progress & change
// - Recent enrollments (chart data)
// - Top 5 active learners
// - Top performing courses
// - New courses
```

### 👨‍🎓 Employee Learning Experience
Employee journey through the platform:

1. **Signup/Login**
   ```
   POST /employment/signup
   POST /employment/login
   ```

2. **View Assigned Courses**
   ```
   GET /employment/group/:groupId
   ```

3. **Watch Videos**
   ```
   POST /employment/:id/mark-video-complete
   ```

4. **Take Quiz**
   ```
   POST /employment/:id/submit-quiz
   {
     "courseId": "...",
     "quizId": "...",
     "answers": [0, 1, 2, 0, 1, 2, 3, 1, 0, 2]
   }
   ```

5. **Check Progress**
   ```
   GET /employment/:id/progress/:courseId
   ```

6. **View Quiz History**
   ```
   GET /employment/:id/quiz-attempts
   ```

### 🎯 Quiz Scoring System
- **1 mark per question** (each correct answer = 1 point)
- **Minimum 80% to pass** (e.g., 8/10 for 10 questions)
- **Automatic progress tracking** when quiz is passed
- **Multiple attempts allowed**
- **Full attempt history**

Example Response:
```json
{
  "message": "Quiz passed successfully!",
  "score": 9,
  "totalQuestions": 10,
  "correctAnswers": 9,
  "wrongAnswers": 1,
  "percentage": 90,
  "isPassed": true,
  "passingThreshold": 8,
  "feedback": "Congratulations! You scored 9/10"
}
```

---

## 📄 Documentation Files

### Main Documentation
| File | Description |
|------|-------------|
| `DASHBOARD_API_DOCUMENTATION.md` | Complete dashboard API documentation with examples |
| `DASHBOARD_API_QUICK_REFERENCE.md` | Quick reference for dashboard APIs |
| `EMPLOYEE_COURSE_TRACKING_API.md` | Employee course tracking & quiz submission |
| `EMPLOYEE_APIS_QUICK_REFERENCE.md` | Quick reference for employee APIs |
| `EMPLOYEE_UPDATE_PASSWORD_API.md` | Password update API documentation |
| `EMPLOYMENT_FEATURE.md` | Complete employment feature documentation |
| `COURSE_USERS_PROGRESS_API.md` | Course progress tracking |

### This File
| File | Description |
|------|-------------|
| `API_SUMMARY.md` | **This file - Complete API overview** |

---

## 🚀 Getting Started

### 1. View Interactive Documentation
```
http://localhost:3000/api-docs
```

### 2. Test Dashboard APIs
```bash
# Get complete dashboard
curl http://localhost:3000/dashboard/complete

# Get stats only
curl http://localhost:3000/dashboard/stats

# Get top learners
curl http://localhost:3000/dashboard/active-learners?limit=5
```

### 3. Test Employee APIs
```bash
# Employee login
curl -X POST http://localhost:3000/employment/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@example.com","password":"password123"}'

# Submit quiz
curl -X POST http://localhost:3000/employment/{id}/submit-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "courseId":"...",
    "quizId":"...",
    "answers":[0,1,2,0,1,2,3,1,0,2]
  }'

# Get progress
curl http://localhost:3000/employment/{id}/progress/{courseId}
```

---

## 📊 Database Collections

| Collection | Description | Related APIs |
|------------|-------------|--------------|
| `userdocuments` | Regular users/admins | Users APIs |
| `employmentdocuments` | Employee records | Employment APIs |
| `courses` | Course information | Courses APIs |
| `videos` | Video content | Videos APIs |
| `quizzes` | Quiz questions | Quizzes APIs |
| `userprogresses` | Progress tracking (users & employees) | Progress APIs |
| `quizattempts` | Quiz submissions (users & employees) | Quiz Attempts APIs |
| `groups` | User/employee groups | Groups APIs |
| `departments` | Department structure | Departments APIs |

---

## 🔐 Authentication

Most endpoints require authentication. Use the token from login:

```javascript
// After login
const { token } = await login(email, password);

// Use in subsequent requests
fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## ⚡ Performance Tips

1. **Dashboard**: Use `/dashboard/complete` instead of multiple calls
2. **Caching**: Cache dashboard data for 5-10 minutes
3. **Pagination**: Use pagination for large datasets
4. **Indexes**: Ensure database indexes on frequently queried fields
5. **Batch Operations**: Use bulk upload for multiple employees

---

## 🎯 Common Use Cases

### Admin Monitoring
```javascript
// Get complete dashboard overview
const dashboard = await fetch('/dashboard/complete').then(r => r.json());

// Monitor specific metrics
const stats = await fetch('/dashboard/stats').then(r => r.json());
```

### Employee Onboarding
```javascript
// 1. Upload employees from Excel
POST /employment/upload-excel

// 2. Assign to group
PUT /employment/:id { groupId: '...' }

// 3. Assign courses to group
POST /groups/:groupId/assign-course
```

### Course Completion Tracking
```javascript
// Get all employees in a course
GET /courses/:courseId/users-progress

// Get individual employee progress
GET /employment/:id/progress/:courseId

// Get quiz attempts
GET /employment/:id/quiz-attempts
```

---

## 🔄 API Response Formats

### Success Response
```json
{
  "message": "Success message",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message or array of validation errors",
  "error": "Bad Request"
}
```

### Pagination Response
```json
{
  "data": [ /* items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

---

## 📞 Support

- **Swagger Documentation**: `http://localhost:3000/api-docs`
- **Full Documentation**: See individual `.md` files
- **Quick References**: `*_QUICK_REFERENCE.md` files

---

## ✅ Implementation Checklist

### Dashboard ✅
- [x] Dashboard statistics API
- [x] Recent enrollments API
- [x] Active learners API
- [x] Top courses API
- [x] New courses API
- [x] Complete dashboard API
- [x] Full documentation
- [x] Quick reference guide

### Employee System ✅
- [x] Employee authentication
- [x] Password update API
- [x] Quiz submission (1 mark/question, 8/10 pass)
- [x] Video completion tracking
- [x] Progress tracking
- [x] Quiz attempts history
- [x] Bulk Excel upload
- [x] Full documentation
- [x] Quick reference guide

### Course Management ✅
- [x] Course CRUD operations
- [x] Group assignments
- [x] Progress tracking
- [x] User enrollment tracking

---

## 🎉 What's New

### Latest Features (October 2025)
1. ✨ **Dashboard Analytics APIs** - Complete admin dashboard support
2. ✨ **Employee Quiz System** - 1 mark per question, 80% pass threshold
3. ✨ **Progress Tracking** - Real-time course completion tracking
4. ✨ **Quiz History** - Full attempt history with scores
5. ✨ **Active Learners** - Leaderboard of top performers
6. ✨ **Top Courses** - Course performance metrics
7. ✨ **Password Update** - Secure password change for employees

---

## 🚀 Next Steps

1. Explore the Swagger UI at `/api-docs`
2. Read individual documentation files for detailed info
3. Test APIs using the provided cURL examples
4. Integrate frontend using the code examples
5. Implement caching and optimization strategies

---

**Last Updated**: October 18, 2025
**Version**: 2.0
**Total APIs**: 50+ endpoints across 11 modules

