# Employee Course Tracking & Quiz Submission API

## Overview
This document describes the comprehensive employee course tracking system including quiz submission with scoring, video completion tracking, and progress monitoring.

## Scoring System
- **1 mark per question** (each correct answer = 1 mark)
- **Minimum 8/10 questions** correct to pass (80% passing threshold)
- Automatic progress tracking when quiz is passed

## API Endpoints

### 1. Submit Quiz
**`POST /employment/:id/submit-quiz`**

Submit quiz answers for an employee. Scoring: 1 mark per correct answer, minimum 8/10 to pass.

**URL Parameters:**
- `id` (string, required): Employment ID

**Request Body:**
```json
{
  "courseId": "657e902c4b628d1f0fc8f09e",
  "quizId": "657e902c4b628d1f0fc8f09f",
  "answers": [0, 1, 2, 0, 1, 2, 3, 1, 0, 2]
}
```

**Request Fields:**
- `courseId`: MongoDB ObjectId of the course
- `quizId`: MongoDB ObjectId of the quiz
- `answers`: Array of answer indices (0-based) corresponding to each question

**Success Response (201):**
```json
{
  "message": "Quiz passed successfully!",
  "attemptId": "657e902c4b628d1f0fc8f0a0",
  "score": 9,
  "totalQuestions": 10,
  "correctAnswers": 9,
  "wrongAnswers": 1,
  "percentage": 90,
  "isPassed": true,
  "passingThreshold": 8,
  "requiredScore": 8,
  "feedback": "Congratulations! You scored 9/10"
}
```

**Failed Quiz Response (201):**
```json
{
  "message": "Quiz submitted but not passed",
  "attemptId": "657e902c4b628d1f0fc8f0a0",
  "score": 6,
  "totalQuestions": 10,
  "correctAnswers": 6,
  "wrongAnswers": 4,
  "percentage": 60,
  "isPassed": false,
  "passingThreshold": 8,
  "requiredScore": 8,
  "feedback": "You scored 6/10. You need at least 8/10 to pass."
}
```

**Error Responses:**
- `404 Not Found`: Employment, course, or quiz not found
- `400 Bad Request`: Quiz does not belong to the course

---

### 2. Mark Video Complete
**`POST /employment/:id/mark-video-complete`**

Mark a video as completed for an employee and update course progress.

**URL Parameters:**
- `id` (string, required): Employment ID

**Request Body:**
```json
{
  "courseId": "657e902c4b628d1f0fc8f09e",
  "videoId": "657e902c4b628d1f0fc8f09f"
}
```

**Success Response (201):**
```json
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

**Error Responses:**
- `404 Not Found`: Employment or course not found
- `400 Bad Request`: Video does not belong to the course

---

### 3. Get Employee Progress
**`GET /employment/:id/progress/:courseId`**

Get detailed progress information for an employee on a specific course.

**URL Parameters:**
- `id` (string, required): Employment ID
- `courseId` (string, required): Course ID

**Success Response (200):**
```json
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
  "quizAttempts": [
    {
      "quizId": {
        "_id": "657e902c4b628d1f0fc8f09f",
        "title": "Module 1 Quiz"
      },
      "score": 9,
      "totalQuestions": 10,
      "correctAnswers": 9,
      "isPassed": true,
      "completedAt": "2025-10-17T10:30:00.000Z"
    }
  ],
  "completedVideoIds": ["vid1", "vid2", "vid3", "vid4", "vid5"],
  "completedQuizIds": ["quiz1", "quiz2"]
}
```

**Error Responses:**
- `404 Not Found`: Employment or course not found

---

### 4. Get Quiz Attempts
**`GET /employment/:id/quiz-attempts?quizId=<quizId>`**

Get all quiz attempts for an employee, optionally filtered by quiz ID.

**URL Parameters:**
- `id` (string, required): Employment ID

**Query Parameters:**
- `quizId` (string, optional): Filter by specific quiz ID

**Success Response (200):**
```json
{
  "totalAttempts": 3,
  "attempts": [
    {
      "attemptId": "657e902c4b628d1f0fc8f0a0",
      "quizId": {
        "_id": "657e902c4b628d1f0fc8f09f",
        "title": "Module 1 Quiz",
        "description": "Test your knowledge of Module 1"
      },
      "score": 9,
      "totalQuestions": 10,
      "correctAnswers": 9,
      "wrongAnswers": 1,
      "percentage": 90,
      "isPassed": true,
      "completedAt": "2025-10-17T10:30:00.000Z"
    },
    {
      "attemptId": "657e902c4b628d1f0fc8f0a1",
      "quizId": {
        "_id": "657e902c4b628d1f0fc8f09f",
        "title": "Module 1 Quiz",
        "description": "Test your knowledge of Module 1"
      },
      "score": 7,
      "totalQuestions": 10,
      "correctAnswers": 7,
      "wrongAnswers": 3,
      "percentage": 70,
      "isPassed": false,
      "completedAt": "2025-10-16T14:15:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Employment not found

---

## Database Schema Updates

### UserProgress Schema
Updated to support both regular users and employees:

```typescript
{
  userId?: ObjectId;              // For regular users (optional)
  employmentId?: ObjectId;        // For employees (optional)
  courseId: ObjectId;             // Required
  completedVideos: string[];      // Array of video IDs
  completedQuizzes: string[];     // Array of quiz IDs
  progressPercentage: number;     // 0-100
  isCourseCompleted: boolean;     // True when all items completed
  createdAt: Date;
  updatedAt: Date;
}
```

### QuizAttempt Schema
Updated to support both regular users and employees:

```typescript
{
  userId?: ObjectId;              // For regular users (optional)
  employmentId?: ObjectId;        // For employees (optional)
  quizId: ObjectId;               // Required
  userAnswers: number[];          // Array of answer indices
  score: number;                  // Number of correct answers
  totalQuestions: number;         // Total questions in quiz
  correctAnswers: number;         // Number of correct answers
  isPassed: boolean;              // True if score >= passing threshold
  completedAt: Date;
}
```

---

## Usage Examples

### 1. Submit Quiz (JavaScript/Axios)

```javascript
const submitQuiz = async (employmentId, courseId, quizId, answers) => {
  try {
    const response = await axios.post(
      `http://localhost:3000/employment/${employmentId}/submit-quiz`,
      {
        courseId,
        quizId,
        answers
      }
    );
    
    if (response.data.isPassed) {
      console.log('🎉 Quiz Passed!', response.data);
    } else {
      console.log('❌ Quiz Failed:', response.data.feedback);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error.response.data);
  }
};

// Example usage
const answers = [0, 1, 2, 0, 1, 2, 3, 1, 0, 2]; // 10 answers
await submitQuiz(
  '657e902c4b628d1f0fc8f09d',  // employmentId
  '657e902c4b628d1f0fc8f09e',  // courseId
  '657e902c4b628d1f0fc8f09f',  // quizId
  answers
);
```

### 2. Mark Video Complete (cURL)

```bash
curl -X POST http://localhost:3000/employment/657e902c4b628d1f0fc8f09d/mark-video-complete \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "657e902c4b628d1f0fc8f09e",
    "videoId": "657e902c4b628d1f0fc8f09f"
  }'
```

### 3. Get Employee Progress (Fetch)

```javascript
const getProgress = async (employmentId, courseId) => {
  const response = await fetch(
    `http://localhost:3000/employment/${employmentId}/progress/${courseId}`
  );
  
  const data = await response.json();
  console.log('Course Progress:', data.progress.progressPercentage + '%');
  console.log('Completed:', data.progress.completedVideos, 'videos,', 
              data.progress.completedQuizzes, 'quizzes');
  
  return data;
};

await getProgress(
  '657e902c4b628d1f0fc8f09d',
  '657e902c4b628d1f0fc8f09e'
);
```

### 4. Get Quiz Attempts (React Example)

```javascript
import { useState, useEffect } from 'react';

function QuizHistory({ employmentId }) {
  const [attempts, setAttempts] = useState([]);
  
  useEffect(() => {
    const fetchAttempts = async () => {
      const response = await fetch(
        `http://localhost:3000/employment/${employmentId}/quiz-attempts`
      );
      const data = await response.json();
      setAttempts(data.attempts);
    };
    
    fetchAttempts();
  }, [employmentId]);
  
  return (
    <div>
      <h2>Quiz History ({attempts.length} attempts)</h2>
      {attempts.map(attempt => (
        <div key={attempt.attemptId}>
          <h3>{attempt.quizId.title}</h3>
          <p>Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)</p>
          <p>Status: {attempt.isPassed ? '✅ Passed' : '❌ Failed'}</p>
          <p>Date: {new Date(attempt.completedAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Business Logic

### Quiz Scoring
1. **Each question = 1 mark**
2. **Passing threshold = 80%** (minimum 8 out of 10 for a 10-question quiz)
3. **Automatic progress update**: Quiz is marked as complete only if passed
4. **Multiple attempts allowed**: Employees can retake quizzes
5. **All attempts tracked**: Every submission is saved for history

### Progress Calculation
```
Progress % = (Completed Videos + Completed Quizzes) / (Total Videos + Total Quizzes) * 100
```

### Course Completion
A course is marked as completed when:
- All videos are watched
- All quizzes are passed (80% or higher)

---

## Frontend Integration Guide

### Step 1: Display Quiz
```javascript
// Fetch quiz questions
const quiz = await fetch(`/courses/${courseId}/quizzes/${quizId}`);
// Display questions with multiple choice options
```

### Step 2: Collect Answers
```javascript
const answers = [];
quiz.questions.forEach((question, index) => {
  // User selects option (0, 1, 2, or 3)
  answers[index] = selectedOptionIndex;
});
```

### Step 3: Submit Quiz
```javascript
const result = await submitQuiz(employmentId, courseId, quizId, answers);

if (result.isPassed) {
  // Show success message
  alert(`Congratulations! You scored ${result.score}/${result.totalQuestions}`);
  // Update UI to show quiz as completed
} else {
  // Show retry message
  alert(`You need ${result.requiredScore} to pass. Try again!`);
}
```

### Step 4: Track Video Completion
```javascript
// When video ends or user clicks "Mark as Complete"
videoPlayer.on('ended', async () => {
  await markVideoComplete(employmentId, courseId, videoId);
  // Update progress bar
  const progress = await getProgress(employmentId, courseId);
  updateProgressBar(progress.progress.progressPercentage);
});
```

---

## Security Considerations

1. **Authentication**: Add authentication guard to verify employee identity
2. **Authorization**: Ensure employee can only access their assigned courses
3. **Validation**: All inputs are validated with class-validator
4. **Rate Limiting**: Consider adding rate limiting to prevent abuse
5. **Quiz Answer Security**: Don't expose correct answers in API responses

---

## Testing

### Test Quiz Submission (10 Questions)

```bash
# All correct (10/10) - Should Pass
curl -X POST http://localhost:3000/employment/EMPLOYMENT_ID/submit-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID",
    "quizId": "QUIZ_ID",
    "answers": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  }'

# 8 correct (8/10) - Should Pass (Minimum)
curl -X POST http://localhost:3000/employment/EMPLOYMENT_ID/submit-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID",
    "quizId": "QUIZ_ID",
    "answers": [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]
  }'

# 7 correct (7/10) - Should Fail
curl -X POST http://localhost:3000/employment/EMPLOYMENT_ID/submit-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID",
    "quizId": "QUIZ_ID",
    "answers": [0, 0, 0, 0, 0, 0, 0, 1, 1, 1]
  }'
```

---

## Monitoring & Analytics

### Key Metrics to Track
1. **Average quiz scores** per course
2. **Pass rates** per quiz
3. **Course completion rates**
4. **Time to complete** courses
5. **Most failed quizzes** (need improvement)
6. **Employee engagement** (video watch time, quiz attempts)

### Example Analytics Query
```javascript
// Get average score for a specific quiz
const avgScore = await QuizAttempt.aggregate([
  { $match: { quizId: quizId } },
  { $group: {
    _id: null,
    avgScore: { $avg: '$score' },
    passRate: { $avg: { $cond: ['$isPassed', 1, 0] } }
  }}
]);
```

---

## Future Enhancements

1. **Time-limited quizzes**: Add timer for quizzes
2. **Question randomization**: Randomize question order
3. **Detailed feedback**: Show which questions were wrong
4. **Certificates**: Generate certificates on course completion
5. **Leaderboards**: Show top performers
6. **Adaptive learning**: Recommend courses based on performance
7. **Video bookmarks**: Allow saving progress within videos
8. **Discussion forums**: Add Q&A for each course

---

## Support

For issues or questions:
- Check the API documentation at `/api-docs`
- Review error responses for troubleshooting
- Contact system administrator for access issues

