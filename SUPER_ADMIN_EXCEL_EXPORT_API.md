# Super Admin Excel Export API

## Overview
This API allows super admins to export complete user information to an Excel file including user details, employment information, group details, and course progress.

## Endpoint

### Export User Information to Excel

**Endpoint:** `GET /super-admin/user/:userId/export`

**Authentication:** Required (Super Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `userId` (required): The unique identifier of the user to export

**Response:** Excel file download (.xlsx format)

**Filename Format:** `{UserFullName}_{Timestamp}.xlsx`

---

## Excel Structure

The exported Excel file contains **4 sheets**:

### Sheet 1: User Information
Contains all user profile fields:
- Full Name
- Email
- Phone
- Company Name
- Country
- User Type
- Company ID
- Is Super Admin
- Terms Accepted
- Group Name
- Last Logged In
- Created At
- Updated At

### Sheet 2: Employment Information
Contains employment record details if exists:
- Full Name
- Email
- Role
- Is Active
- Last Logged In
- Created At
- Updated At

If no employment record exists, shows "No Employment Record"

### Sheet 3: Group Information
Contains group details if assigned:
- Group Name
- Description
- Total Courses (count of assigned courses)
- Created At
- Updated At

If no group assigned, shows "No Group Assigned"

### Sheet 4: Course Progress
Contains detailed course progress with the following columns:
- No (row number)
- Course Title
- Progress Percentage
- Completed Videos (count)
- Completed Quizzes (count)
- Last Updated

If no courses enrolled, shows "No courses enrolled"

---

## Example Usage

### cURL
```bash
curl -X GET \
  http://localhost:3000/super-admin/user/60d5ec49f1b2c72b8c8e4a1b/export \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  --output John_Doe_report.xlsx
```

### JavaScript/Fetch
```javascript
const userId = '60d5ec49f1b2c72b8c8e4a1b';
const token = 'YOUR_TOKEN';

fetch(`http://localhost:3000/super-admin/user/${userId}/export`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_report.xlsx';
    a.click();
  });
```

### Axios
```javascript
const axios = require('axios');
const fs = require('fs');

axios({
  method: 'GET',
  url: 'http://localhost:3000/super-admin/user/60d5ec49f1b2c72b8c8e4a1b/export',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  responseType: 'arraybuffer'
})
  .then(response => {
    fs.writeFileSync('user_report.xlsx', response.data);
    console.log('Excel file saved successfully!');
  });
```

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
  "message": "Failed to export user to Excel: <error message>"
}
```

---

## Features

✅ **Complete User Data Export**
- User profile information
- Employment records
- Group assignment details
- Course enrollment and progress

✅ **Organized Multi-Sheet Excel File**
- User Information sheet
- Employment Information sheet
- Group Information sheet
- Course Progress sheet

✅ **Super Admin Only Access**
- Protected by SuperAdminGuard
- Requires authentication token

✅ **Automatic Filename Generation**
- Format: `{UserFullName}_{Timestamp}.xlsx`
- Unique filename with user name and timestamp

✅ **Comprehensive Data**
- Includes all user-related information
- Populated group and department details
- Course progress with completion percentages
- Employment status and role information

---

## Notes

1. **Authentication**: Requires valid JWT token with super admin privileges
2. **File Format**: Excel 2007+ (.xlsx) format
3. **File Size**: Depends on number of courses enrolled by the user
4. **Download**: Automatically downloads as attachment when accessed via browser
5. **Group Details**: Automatically fetches group information from both user and employment records

