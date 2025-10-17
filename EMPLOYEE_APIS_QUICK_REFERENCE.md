# Employee APIs - Quick Reference

## All Employee Endpoints

### 1. Authentication & Profile
- **POST** `/employment/signup` - Create employee account
- **POST** `/employment/login` - Employee login
- **PATCH** `/employment/:id/update-password` - Update password
- **PUT** `/employment/:id` - Update employee profile
- **GET** `/employment/:id` - Get employee by ID
- **GET** `/employment` - Get all employees (with filters)

### 2. Course Progress & Tracking
- **POST** `/employment/:id/submit-quiz` - Submit quiz (1 mark/question, min 8/10 to pass)
- **POST** `/employment/:id/mark-video-complete` - Mark video as complete
- **GET** `/employment/:id/progress/:courseId` - Get course progress
- **GET** `/employment/:id/quiz-attempts` - Get all quiz attempts

### 3. Group & Course Information
- **GET** `/employment/group/:groupId` - Get courses assigned to group
- **GET** `/employment/user-info/:email` - Get employee with user info

---

## Quick Examples

### Submit Quiz (10 questions, need 8 correct to pass)
```bash
POST /employment/657e902c4b628d1f0fc8f09d/submit-quiz
{
  "courseId": "657e902c4b628d1f0fc8f09e",
  "quizId": "657e902c4b628d1f0fc8f09f",
  "answers": [0, 1, 2, 0, 1, 2, 3, 1, 0, 2]  # 10 answers (one per question)
}

# Response:
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

### Mark Video Complete
```bash
POST /employment/657e902c4b628d1f0fc8f09d/mark-video-complete
{
  "courseId": "657e902c4b628d1f0fc8f09e",
  "videoId": "657e902c4b628d1f0fc8f09f"
}

# Response:
{
  "message": "Video marked as complete",
  "progress": {
    "completedVideos": 5,
    "completedQuizzes": 2,
    "progressPercentage": 70,
    "isCourseCompleted": false
  }
}
```

### Get Course Progress
```bash
GET /employment/657e902c4b628d1f0fc8f09d/progress/657e902c4b628d1f0fc8f09e

# Response:
{
  "employmentId": "657e902c4b628d1f0fc8f09d",
  "courseId": "657e902c4b628d1f0fc8f09e",
  "courseName": "Cybersecurity Fundamentals",
  "progress": {
    "completedVideos": 5,
    "totalVideos": 10,
    "completedQuizzes": 2,
    "totalQuizzes": 3,
    "progressPercentage": 54,
    "isCourseCompleted": false
  },
  "quizAttempts": [...],
  "completedVideoIds": ["vid1", "vid2", ...],
  "completedQuizIds": ["quiz1", "quiz2"]
}
```

---

## Quiz Scoring Rules

### ✅ Scoring Formula
- **1 mark per question** (each correct answer = 1 point)
- **Passing threshold = 80%** (minimum 8/10 for 10 questions)
- **Formula**: `score = correctAnswers`
- **Pass condition**: `correctAnswers >= Math.ceil(totalQuestions * 0.8)`

### Examples:
| Questions | Correct | Score | Pass/Fail |
|-----------|---------|-------|-----------|
| 10        | 10      | 10    | ✅ Pass   |
| 10        | 9       | 9     | ✅ Pass   |
| 10        | 8       | 8     | ✅ Pass   |
| 10        | 7       | 7     | ❌ Fail   |
| 10        | 6       | 6     | ❌ Fail   |
| 5         | 4       | 4     | ✅ Pass   |
| 5         | 3       | 3     | ❌ Fail   |

---

## Progress Calculation

### Formula:
```
Progress % = (Completed Videos + Completed Quizzes) / (Total Videos + Total Quizzes) * 100
```

### Example:
- Total Videos: 10
- Total Quizzes: 5
- Completed Videos: 7
- Completed Quizzes: 2

**Progress = (7 + 2) / (10 + 5) * 100 = 60%**

### Course Completion:
- Course is marked as "Complete" when:
  - ✅ All videos watched
  - ✅ All quizzes passed (80%+ score)

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success (GET requests) |
| 201 | Created/Submitted successfully (POST requests) |
| 400 | Bad Request (invalid data) |
| 404 | Not Found (resource doesn't exist) |
| 422 | Unprocessable Entity (validation error) |

---

## Testing Checklist

### Quiz Submission Testing:
- [ ] Submit quiz with all correct answers (should pass)
- [ ] Submit quiz with exactly 8/10 correct (should pass)
- [ ] Submit quiz with 7/10 correct (should fail)
- [ ] Submit quiz for non-existent quiz (should return 404)
- [ ] Submit wrong number of answers (should return 400)

### Video Completion Testing:
- [ ] Mark video as complete (should update progress)
- [ ] Mark same video twice (should not duplicate)
- [ ] Mark video from different course (should return 400)

### Progress Testing:
- [ ] Get progress for course with no activity (should show 0%)
- [ ] Complete all items (should show 100% and isCourseCompleted: true)
- [ ] Get progress for non-existent course (should return 404)

---

## Frontend Integration Tips

### 1. Quiz UI Flow
```javascript
// 1. Fetch quiz
GET /courses/{courseId}/quizzes/{quizId}

// 2. Display questions
questions.forEach((q, i) => {
  // Show question.question
  // Show question.options
  // Collect user selection into answers[i]
});

// 3. Submit answers
POST /employment/{employmentId}/submit-quiz
Body: { courseId, quizId, answers }

// 4. Show result
if (result.isPassed) {
  // Show success + score
  // Enable next module
} else {
  // Show fail message
  // Show "Try Again" button
}
```

### 2. Video Player Integration
```javascript
// When video ends
videoPlayer.on('ended', async () => {
  // Mark as complete
  await markVideoComplete(employmentId, courseId, videoId);
  
  // Refresh progress
  const progress = await getProgress(employmentId, courseId);
  updateProgressBar(progress.progress.progressPercentage);
  
  // Show next video/quiz
  if (progress.progress.progressPercentage === 100) {
    showCourseCompletionModal();
  }
});
```

### 3. Progress Dashboard
```javascript
// Course card component
{courses.map(course => (
  <CourseCard>
    <h3>{course.title}</h3>
    <ProgressBar value={course.progress.progressPercentage} />
    <p>{course.progress.completedVideos}/{course.progress.totalVideos} videos</p>
    <p>{course.progress.completedQuizzes}/{course.progress.totalQuizzes} quizzes</p>
    {course.progress.isCourseCompleted && <Badge>Completed ✅</Badge>}
  </CourseCard>
))}
```

---

## Common Errors & Solutions

### Error: "Quiz does not belong to this course"
**Solution**: Verify the quizId is part of the course's quizzes array

### Error: "Employment record not found"
**Solution**: Check if employmentId is valid and employee exists

### Error: "Quiz submitted but not passed"
**Solution**: This is not an error - employee scored below 80%. They can retry.

### Error: "Video does not belong to this course"
**Solution**: Verify the videoId is part of the course's videos array

---

## Swagger/OpenAPI Documentation

Access interactive API documentation at:
```
http://localhost:3000/api-docs
```

Look for the "Employment" section to test all endpoints interactively.

---

## Database Collections

### UserProgress Collection
```javascript
{
  _id: ObjectId,
  employmentId: ObjectId,  // Reference to EmploymentDocument
  courseId: ObjectId,      // Reference to Course
  completedVideos: [String],
  completedQuizzes: [String],
  progressPercentage: Number,
  isCourseCompleted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### QuizAttempt Collection
```javascript
{
  _id: ObjectId,
  employmentId: ObjectId,  // Reference to EmploymentDocument
  quizId: ObjectId,        // Reference to Quiz
  userAnswers: [Number],   // Answer indices
  score: Number,           // Number of correct answers
  totalQuestions: Number,
  correctAnswers: Number,
  isPassed: Boolean,
  completedAt: Date
}
```

---

## Performance Tips

1. **Caching**: Cache course structure to reduce DB queries
2. **Pagination**: Use pagination for quiz attempts list
3. **Indexes**: Add indexes on employmentId and courseId for faster queries
4. **Batch Updates**: Update progress in batches for better performance
5. **CDN**: Serve video content through CDN for faster loading

---

## Security Best Practices

1. ✅ Validate all inputs with DTOs
2. ✅ Use authentication guards (add PasscodeAuthGuard)
3. ✅ Verify employee has access to course (check group assignment)
4. ✅ Don't expose correct answers in quiz fetch API
5. ✅ Rate limit quiz submissions to prevent brute force
6. ✅ Log all quiz attempts for audit trail

---

## Need Help?

- 📖 Full Documentation: `EMPLOYEE_COURSE_TRACKING_API.md`
- 🔐 Password API: `EMPLOYEE_UPDATE_PASSWORD_API.md`
- 🏢 Employment Feature: `EMPLOYMENT_FEATURE.md`
- 🌐 Swagger UI: `/api-docs`

