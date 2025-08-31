# Employment Feature Documentation

## Overview

The Employment feature allows employees to sign up in the LMS portal using email addresses that already exist in the user schema. This enables organizations to have both regular users and employees with the same email addresses, providing different access levels and roles.

## Key Features

### 1. Employment Schema
- **EmploymentDocument**: New schema for employee records
- **Role-based access**: Employees get a "user" role by default
- **Group association**: Employees can be assigned to groups
- **Email validation**: Must exist in user schema before employment creation

### 2. Employee Signup Process
- Employee can sign up with an email that exists in the user schema
- System validates that the email exists in the user collection
- Employment record is created with "user" role
- Employee gets their own password and login credentials

### 3. Course Assignment Integration
- When courses are assigned to groups, both users and employees receive access
- Email notifications are sent to both users and employees in the group
- Course availability is shared between users and employees with the same email

## API Endpoints

### Employment Management

#### POST `/employment/signup`
Create a new employment record.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john.doe@company.com",
  "password": "securepassword",
  "role": "user",
  "position": "Software Engineer",
  "groupId": "657e902c4b628d1f0fc8f09e",
  "departmentId": "657e902c4b628d1f0fc8f09e",
  "isTermsAccepted": true
}
```

**Requirements:**
- Email must exist in user schema
- Email must not already be used in employment schema
- Group and department IDs must be valid (if provided)

#### POST `/employment/login`
Login for employment accounts.

**Request Body:**
```json
{
  "email": "john.doe@company.com",
  "password": "securepassword"
}
```

#### GET `/employment/:id`
Get employment record by ID.

#### GET `/employment/user-info/:email`
Get employment record with associated user information.

#### GET `/employment/group/:groupId`
Get all employment records for a specific group.

## Database Schema

### EmploymentDocument
```typescript
{
  fullName: string;           // Required
  email: string;             // Required, must exist in user schema
  password?: string;         // Optional, for login
  role: string;              // Default: 'user'
  position?: string;         // Optional
  groupId?: ObjectId;        // Optional, references Group
  departmentId?: ObjectId;   // Optional, references Department
  isActive?: boolean;        // Default: true
  lastLoggedIn?: Date;       // Optional
  createdAt: Date;           // Auto-generated
  updatedAt: Date;           // Auto-generated
}
```

## Business Logic

### 1. Email Validation
- Employment creation requires the email to exist in the user schema
- This ensures that employees are associated with valid user accounts
- Prevents creation of employment records for non-existent users

### 2. Course Access
- When a course is assigned to a group, it becomes available to:
  - All users in the group
  - All employees in the group
- Email notifications are sent to both users and employees
- Course progress tracking works for both user types

### 3. Group Statistics
- Group stats now include:
  - `totalUsers`: Count of regular users
  - `totalEmployees`: Count of employees
  - `totalMembers`: Combined count of users and employees

## Usage Examples

### 1. Creating an Employment Record
```bash
curl -X POST http://localhost:3000/employment/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane.smith@company.com",
    "password": "password123",
    "role": "user",
    "position": "Marketing Manager",
    "groupId": "657e902c4b628d1f0fc8f09e",
    "isTermsAccepted": true
  }'
```

### 2. Employee Login
```bash
curl -X POST http://localhost:3000/employment/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@company.com",
    "password": "password123"
  }'
```

### 3. Assigning Course to Group (includes employees)
```bash
curl -X POST http://localhost:3000/groups/657e902c4b628d1f0fc8f09e/assign-course \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "657e902c4b628d1f0fc8f09e",
    "dueDate": "2024-12-31",
    "sendEmailNotifications": true
  }'
```

## Security Considerations

1. **Password Security**: Employee passwords are hashed using the same mechanism as user passwords
2. **Email Validation**: Employment records can only be created for existing user emails
3. **Role-based Access**: Employees get "user" role by default, limiting their permissions
4. **Active Status**: Employment records have an `isActive` flag for account management

## Integration Points

1. **User Schema**: Employment records reference existing user emails
2. **Group System**: Employees can be assigned to groups like regular users
3. **Course System**: Course assignments include both users and employees
4. **Email System**: Notifications are sent to both user types
5. **Authentication**: Separate login system for employment accounts

## Future Enhancements

1. **Role Management**: Additional roles beyond "user" and "admin"
2. **Department Integration**: Enhanced department-based access control
3. **Progress Tracking**: Separate progress tracking for employees
4. **Bulk Operations**: Bulk employment creation and management
5. **Audit Logging**: Track employment-related activities

