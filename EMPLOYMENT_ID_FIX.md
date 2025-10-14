# Employment ID Fix - Course Users Progress API

## Problem
The `getCourseUsersWithProgress` API was returning **User** data instead of **Employment** (employee) data.

## What Was Changed

### 1. Service Method (`courses.service.ts`)

**Before:**
```typescript
// Was querying UserDocument model
const usersInGroups = await this.userModel.find({
  groupId: { $in: groupIds }
}).exec();

// Was returning user fields
return {
  userId: user._id.toString(),
  fullName: user.fullName,
  email: user.email,
  companyName: user.companyName,
  userType: user.userType,
  // ...
};
```

**After:**
```typescript
// Now queries EmploymentDocument model
const employeesInGroups = await this.employmentModel.find({
  groupId: { $in: groupIds }
}).exec();

// Now returns employment fields
return {
  employmentId: employee._id.toString(),
  userId: employee.userId.toString(),
  fullName: employee.fullName,
  email: employee.email,
  role: employee.role,
  isActive: employee.isActive,
  // ...
};
```

### 2. DTO Updates (`course-users-progress.dto.ts`)

**Before:**
```typescript
export class UserWithProgressDto {
  userId: string;
  fullName: string;
  email: string;
  companyName: string;  // ❌ User field
  userType: string;     // ❌ User field
  progress: UserProgressDto;
  lastUpdated: Date;
}
```

**After:**
```typescript
export class UserWithProgressDto {
  employmentId: string;  // ✅ Added
  userId: string;
  fullName: string;
  email: string;
  role: string;          // ✅ Employment field
  isActive: boolean;     // ✅ Employment field
  progress: UserProgressDto;
  lastUpdated: Date;
}
```

### 3. Controller Documentation (`courses.controller.ts`)

Updated the API response description:
- Before: "Returns all **users** associated with the course..."
- After: "Returns all **employees** associated with the course..."

## Why This Matters

### Employment vs User Model

In your LMS system, there are two separate entities:

1. **UserDocument** - Generic users of the system
   - Has fields: companyName, userType, departmentId
   - Represents general user accounts

2. **EmploymentDocument** - Employees in the organization
   - Has fields: role, isActive, groupId
   - Represents actual employees who take courses
   - References a UserDocument via `userId`

### The Correct Flow

```
Course → Group → Employees (EmploymentDocument) → User (UserDocument)
                     ↓
              UserProgress (tracked by userId from employment)
```

## API Response Changes

### Before
```json
{
  "courseId": "...",
  "courseTitle": "Safety Training",
  "videoCount": 5,
  "totalUsers": 2,
  "users": [
    {
      "userId": "user123",
      "fullName": "John Doe",
      "email": "john@example.com",
      "companyName": "Acme Corp",
      "userType": "employee",
      "progress": { ... }
    }
  ]
}
```

### After
```json
{
  "courseId": "...",
  "courseTitle": "Safety Training",
  "videoCount": 5,
  "totalUsers": 2,
  "users": [
    {
      "employmentId": "emp123",
      "userId": "user123",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "Manager",
      "isActive": true,
      "progress": { ... }
    }
  ]
}
```

## Benefits

1. ✅ **Correct Data Model** - Returns employment records, not user records
2. ✅ **Employment ID** - Frontend can track by employment ID
3. ✅ **Role Information** - Shows employee role in the organization
4. ✅ **Active Status** - Shows if employee account is active
5. ✅ **Proper Relationship** - Follows the correct data flow

## Testing

### Test the Endpoint
```bash
curl -X GET http://localhost:3000/courses/{courseId}/users-progress
```

### Expected Response Structure
```json
{
  "courseId": "670f1f77bcf86cd799439011",
  "courseTitle": "Introduction to Safety",
  "videoCount": 5,
  "totalUsers": 10,
  "users": [
    {
      "employmentId": "68e9eb3d33960808f39fe0f3",
      "userId": "686b9bfc7af1657846ddd7e2",
      "fullName": "Jane Smith",
      "email": "jane.smith@company.com",
      "role": "Safety Officer",
      "isActive": true,
      "progress": {
        "completedVideos": ["vid1", "vid2"],
        "completedQuizzes": ["quiz1"],
        "progressPercentage": 60,
        "totalCompletedItems": 3
      },
      "lastUpdated": "2025-10-14T10:30:00.000Z"
    }
  ]
}
```

## Files Modified

1. ✅ `/apps/auth/src/courses/courses.service.ts` - Changed to use employmentModel
2. ✅ `/apps/auth/src/courses/dto/course-users-progress.dto.ts` - Updated DTO fields
3. ✅ `/apps/auth/src/courses/courses.controller.ts` - Updated API documentation

## Migration Notes

If your frontend is currently using this API, you'll need to update it to:

1. Use `employmentId` instead of just `userId` for identifying employees
2. Use `role` instead of `userType`
3. Use `isActive` to check if employee account is active
4. Remove references to `companyName` (not available in employment records)

## Summary

**What**: Changed course users progress API to return employment data instead of user data  
**Why**: Employment records are what's linked to groups and courses  
**Impact**: Frontend needs to update to use new response fields  
**Status**: ✅ Complete

The API now correctly returns employee (employment) information with their course progress! 🎉

