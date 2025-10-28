# Super Admin Dashboard API Documentation

## Overview
This document describes the new super admin dashboard APIs that allow super admins to view system statistics and detailed user information.

## Endpoints

### 1. Get Dashboard Statistics

Get total counts of users, courses, and employed users.

**Endpoint:** `GET /super-admin/dashboard/stats`

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalUsers": 150,
  "totalCourses": 25,
  "totalEmployedUsers": 120
}
```

**Response Fields:**
- `totalUsers`: Total number of active users in the system
- `totalCourses`: Total number of courses in the system
- `totalEmployedUsers`: Total number of active employed users

---

### 2. Get User Details

Get complete information about a specific user including their progress and statistics.

**Endpoint:** `GET /super-admin/user/:userId`

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `userId`: The unique identifier of the user

**Response:**
```json
{
  "user": {
    "_id": "60d5ec49f1b2c72b8c8e4a1b",
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "companyName": "Example Corp",
    "country": "USA",
    "userType": "user",
    "isSuperAdmin": false,
    "isTermsAccepted": true,
    "groupId": {
      "_id": "60d5ec49f1b2c72b8c8e4a1c",
      "name": "Engineering Team"
    },
    "departmentId": {
      "_id": "60d5ec49f1b2c72b8c8e4a1d",
      "name": "Software Development"
    },
    "companyId": 1001,
    "lastLoggedIn": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "employment": {
    "_id": "60d5ec49f1b2c72b8c8e4a1e",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "Software Engineer",
    "groupId": {
      "_id": "60d5ec49f1b2c72b8c8e4a1c",
      "name": "Engineering Team"
    },
    "isActive": true,
    "lastLoggedIn": "2024-01-15T10:30:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "progress": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4a1f",
      "userId": "60d5ec49f1b2c72b8c8e4a1b",
      "courseId": {
        "_id": "60d5ec49f1b2c72b8c8e4a20",
        "title": "Introduction to React",
        "description": "Learn React basics",
        "thumbnail": "https://example.com/thumbnail.jpg"
      },
      "completedVideos": ["video1", "video2"],
      "completedQuizzes": ["quiz1"],
      "progressPercentage": 75,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-14T10:30:00Z"
    }
  ],
  "statistics": {
    "totalCourses": 10,
    "completedCourses": 5,
    "inProgressCourses": 5,
    "averageProgress": 65.5
  }
}
```

**Response Fields:**
- `user`: Complete user information with populated group and department
- `employment`: Employment record if exists (with populated group)
- `progress`: Array of all courses the user is enrolled in with progress details
- `statistics`: Aggregated statistics including:
  - `totalCourses`: Total courses enrolled
  - `completedCourses`: Number of completed courses (100% progress)
  - `inProgressCourses`: Number of in-progress courses
  - `averageProgress`: Average progress percentage across all courses

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied. Super admin privileges required."
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Failed to fetch dashboard statistics: <error message>"
}
```

---

### 3. Export User to Excel

Export complete user information including user details, employment, group, and course progress to Excel.

**Endpoint:** `GET /super-admin/user/:userId/export`

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `userId`: The unique identifier of the user

**Response:** Excel file download

**Excel Structure:**
- **Sheet 1: User Information** - All user fields (name, email, phone, company, etc.)
- **Sheet 2: Employment Information** - Employment record details if exists
- **Sheet 3: Group Information** - Group details with assigned courses
- **Sheet 4: Course Progress** - Complete course enrollment and progress data

**Excel Filename Format:** `{UserFullName}_{Timestamp}.xlsx`

---

## Usage Examples

### cURL Examples

#### Get Dashboard Statistics
```bash
curl -X GET \
  http://localhost:3000/super-admin/dashboard/stats \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Get User Details
```bash
curl -X GET \
  http://localhost:3000/super-admin/user/60d5ec49f1b2c72b8c8e4a1b \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

#### Export User to Excel
```bash
curl -X GET \
  http://localhost:3000/super-admin/user/60d5ec49f1b2c72b8c8e4a1b/export \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  --output user_report.xlsx
```

### JavaScript/Fetch Example

#### Export User to Excel
```javascript
const response = await fetch('http://localhost:3000/super-admin/user/60d5ec49f1b2c72b8c8e4a1b/export', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});

const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'user_report.xlsx';
a.click();
```

---

## Notes

1. **Authentication**: Both endpoints require the user to be authenticated as a super admin
2. **Authorization**: The `SuperAdminGuard` ensures only users with `isSuperAdmin: true` can access these endpoints
3. **User Progress**: The progress array includes course details populated from the Course collection
4. **Statistics**: Calculated in real-time from user progress data
5. **Group and Department**: Automatically populated with names for better readability

