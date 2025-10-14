# Employment Course Status API Documentation

## Overview
This API allows you to retrieve comprehensive course information for an employee using their **Employment ID**. The endpoint returns all courses categorized as **completed**, **todo**, and **overdue**, along with a summary of their training progress.

## Endpoint

### Get Employment Course Status
**Method:** `GET`  
**URL:** `/courses/employment/:employmentId/status`

## Parameters

### Path Parameters
| Parameter    | Type   | Required | Description   |
|--------------|--------|----------|---------------|
| employmentId | string | Yes      | Employment ID |

## Response

### Success Response (200)
```json
{
  "employmentId": "507f1f77bcf86cd799439011",
  "userId": "507f191e810c19729de860ea",
  "employeeName": "John Doe",
  "employeeEmail": "john.doe@company.com",
  "completed": [
    {
      "courseId": "60d5ec49f1b2c72b8c8e4f1a",
      "title": "Safety Training",
      "description": "Workplace safety procedures",
      "thumbnail": "http://localhost:3000/courses/60d5ec49f1b2c72b8c8e4f1a/thumbnails/uuid-image.png",
      "dueDate": "2025-10-01T00:00:00.000Z",
      "progressPercentage": 100,
      "completedVideos": ["vid1", "vid2", "vid3"],
      "completedQuizzes": ["quiz1"],
      "videoCount": 3,
      "completedAt": "2025-09-28T15:30:00.000Z"
    }
  ],
  "todo": [
    {
      "courseId": "60d5ec49f1b2c72b8c8e4f1b",
      "title": "HR Compliance",
      "description": "Annual HR compliance training",
      "thumbnail": "http://localhost:3000/courses/60d5ec49f1b2c72b8c8e4f1b/thumbnails/uuid-image.png",
      "dueDate": "2025-11-15T00:00:00.000Z",
      "progressPercentage": 45,
      "completedVideos": ["vid1"],
      "completedQuizzes": [],
      "videoCount": 5,
      "daysRemaining": 32
    }
  ],
  "overdue": [
    {
      "courseId": "60d5ec49f1b2c72b8c8e4f1c",
      "title": "Cybersecurity Basics",
      "description": "Introduction to cybersecurity",
      "thumbnail": "http://localhost:3000/courses/60d5ec49f1b2c72b8c8e4f1c/thumbnails/uuid-image.png",
      "dueDate": "2025-10-01T00:00:00.000Z",
      "progressPercentage": 20,
      "completedVideos": ["vid1"],
      "completedQuizzes": [],
      "videoCount": 8,
      "daysOverdue": 13
    }
  ],
  "summary": {
    "total": 3,
    "completed": 1,
    "pending": 1,
    "overdue": 1,
    "completionRate": 33.33
  }
}
```

### Error Response (404)
```json
{
  "statusCode": 404,
  "message": "Employment record not found"
}
```

## Response Fields

### Root Level Fields
| Field         | Type   | Description                           |
|---------------|--------|---------------------------------------|
| employmentId  | string | Employment record ID                  |
| userId        | string | Associated user ID                    |
| employeeName  | string | Full name of the employee             |
| employeeEmail | string | Email address of the employee         |
| completed     | array  | List of completed courses             |
| todo          | array  | List of pending courses               |
| overdue       | array  | List of overdue courses               |
| summary       | object | Summary statistics                    |

### Course Object Fields (in completed/todo/overdue arrays)
| Field              | Type     | Description                                    | Present In         |
|--------------------|----------|------------------------------------------------|-------------------|
| courseId           | string   | Course ID                                      | All               |
| title              | string   | Course title                                   | All               |
| description        | string   | Course description                             | All               |
| thumbnail          | string   | Course thumbnail URL                           | All               |
| dueDate            | datetime | Due date for completion                        | All               |
| progressPercentage | number   | Progress percentage (0-100)                    | All               |
| completedVideos    | array    | Array of completed video IDs                   | All               |
| completedQuizzes   | array    | Array of completed quiz IDs                    | All               |
| videoCount         | number   | Total number of videos in course               | All               |
| completedAt        | datetime | Timestamp when course was completed            | Completed only    |
| daysRemaining      | number   | Days remaining until due date                  | Todo only         |
| daysOverdue        | number   | Days overdue since due date                    | Overdue only      |

### Summary Object Fields
| Field          | Type   | Description                              |
|----------------|--------|------------------------------------------|
| total          | number | Total number of assigned courses         |
| completed      | number | Number of completed courses              |
| pending        | number | Number of pending courses                |
| overdue        | number | Number of overdue courses                |
| completionRate | number | Percentage of courses completed (0-100)  |

## Example Usage

### Using cURL
```bash
curl -X GET http://localhost:3000/courses/employment/507f1f77bcf86cd799439011/status
```

### Using JavaScript (Fetch API)
```javascript
const employmentId = '507f1f77bcf86cd799439011';

fetch(`http://localhost:3000/courses/employment/${employmentId}/status`)
  .then(response => response.json())
  .then(data => {
    console.log('Employee:', data.employeeName);
    console.log('Completed Courses:', data.completed);
    console.log('Todo Courses:', data.todo);
    console.log('Overdue Courses:', data.overdue);
    console.log('Summary:', data.summary);
  })
  .catch(error => console.error('Error:', error));
```

### Using Axios
```javascript
const employmentId = '507f1f77bcf86cd799439011';

axios.get(`http://localhost:3000/courses/employment/${employmentId}/status`)
  .then(response => {
    const { employeeName, completed, todo, overdue, summary } = response.data;
    console.log(`Employee: ${employeeName}`);
    console.log(`Total Courses: ${summary.total}`);
    console.log(`Completion Rate: ${summary.completionRate}%`);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### Using React Example
```jsx
import React, { useEffect, useState } from 'react';

function EmployeeCourseStatus({ employmentId }) {
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/courses/employment/${employmentId}/status`)
      .then(res => res.json())
      .then(data => {
        setCourseData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [employmentId]);

  if (loading) return <div>Loading...</div>;
  if (!courseData) return <div>No data found</div>;

  return (
    <div>
      <h1>{courseData.employeeName}</h1>
      <p>Email: {courseData.employeeEmail}</p>
      
      <div className="summary">
        <h2>Course Summary</h2>
        <p>Total: {courseData.summary.total}</p>
        <p>Completed: {courseData.summary.completed}</p>
        <p>Pending: {courseData.summary.pending}</p>
        <p>Overdue: {courseData.summary.overdue}</p>
        <p>Completion Rate: {courseData.summary.completionRate}%</p>
      </div>

      <div className="completed-courses">
        <h2>Completed Courses ({courseData.completed.length})</h2>
        {courseData.completed.map(course => (
          <div key={course.courseId}>
            <h3>{course.title}</h3>
            <p>Completed: {new Date(course.completedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>

      <div className="todo-courses">
        <h2>Todo Courses ({courseData.todo.length})</h2>
        {courseData.todo.map(course => (
          <div key={course.courseId}>
            <h3>{course.title}</h3>
            <p>Progress: {course.progressPercentage}%</p>
            <p>Days Remaining: {course.daysRemaining}</p>
          </div>
        ))}
      </div>

      <div className="overdue-courses">
        <h2>Overdue Courses ({courseData.overdue.length})</h2>
        {courseData.overdue.map(course => (
          <div key={course.courseId}>
            <h3>{course.title}</h3>
            <p>Progress: {course.progressPercentage}%</p>
            <p>Days Overdue: {course.daysOverdue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeCourseStatus;
```

## Business Logic

### Course Categorization

1. **Completed Courses**: Courses with `progressPercentage >= 100`
   - Includes completion timestamp
   - Shows all completed videos and quizzes

2. **Todo Courses**: Courses with `progressPercentage < 100` AND `dueDate > currentDate`
   - Shows days remaining until due date
   - Displays current progress percentage

3. **Overdue Courses**: Courses with `progressPercentage < 100` AND `dueDate < currentDate`
   - Shows days overdue
   - Highlights incomplete courses that are past their due date

### Data Flow

1. Frontend sends employment ID to API
2. API finds the employment record by ID
3. API retrieves the associated user ID from employment record
4. API queries for all courses assigned to the user's group
5. API calculates progress for each course
6. API categorizes courses as completed, todo, or overdue
7. API generates summary statistics
8. API returns comprehensive response with employee details and course data

## Use Cases

### 1. Employee Dashboard
Display an employee's training progress on their personal dashboard.

### 2. Manager Overview
Managers can check training status of their team members using employment IDs.

### 3. HR Compliance Tracking
HR can monitor which employees have overdue training courses.

### 4. Training Reports
Generate reports showing completion rates and pending courses by employment ID.

### 5. Notifications
Trigger notifications for employees with overdue courses.

## Related APIs

- **Get User Course Status**: `GET /courses/user/:userId/status` - Similar endpoint but uses user ID
- **Get Completed Courses**: `GET /courses/user/:userId/completed` - Only completed courses
- **Get Todo Courses**: `GET /courses/user/:userId/todo` - Only pending courses
- **Get Overdue Courses**: `GET /courses/user/:userId/overdue` - Only overdue courses

## Implementation Details

### Files Created/Modified
- `courses.controller.ts` - Added new GET endpoint for employment course status
- `courses.service.ts` - Added `getEmploymentCourseStatus` method
- `courses.module.ts` - Added EmploymentDocument model import

### Key Features
1. **Employment-Based Query**: Uses employment ID instead of user ID
2. **Reuses Existing Logic**: Leverages the existing `getUserCourseStatus` method
3. **Employee Details**: Includes employee name and email in response
4. **Type-Safe**: Fully typed with TypeScript
5. **Error Handling**: Returns 404 if employment record not found
6. **Swagger Documentation**: Fully documented in Swagger UI

## Testing

You can test the API using:
1. **Swagger UI**: Navigate to `/api` endpoint on your server
2. **Postman**: Create a GET request with employment ID
3. **cURL**: Use the examples provided above
4. **Frontend Integration**: Use fetch or axios as shown in examples

## Notes

- The employee must be associated with a group to have assigned courses
- Courses are assigned to groups, not directly to employees
- Progress is tracked per user (derived from employment record)
- The completion rate is calculated as: `(completed courses / total courses) * 100`
- All dates are returned in ISO 8601 format
- Progress percentage is a number between 0 and 100

