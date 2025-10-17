# Employee Update Password API Documentation

## Overview
This document describes the newly created API endpoint for updating employee passwords in the LMS system.

## Files Created/Modified

### 1. Created Files
- **`apps/auth/src/employment/dto/update-password.dto.ts`**: DTO for password update request validation

### 2. Modified Files
- **`apps/auth/src/employment/employment.service.ts`**: Added `updatePassword` method
- **`apps/auth/src/employment/employment.controller.ts`**: Added password update endpoint

## API Endpoint

### PATCH `/employment/:id/update-password`

Update the password for an employee account.

**URL Parameters:**
- `id` (string, required): The employment ID

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Validation Rules:**
- Both `currentPassword` and `newPassword` are required
- Both passwords must be at least 6 characters long
- Current password must match the stored password
- New password must be different from the current password

**Success Response (200):**
```json
{
  "message": "Password updated successfully",
  "employmentId": "657e902c4b628d1f0fc8f09e"
}
```

**Error Responses:**

1. **404 Not Found** - Employment record not found
```json
{
  "statusCode": 404,
  "message": "Employment record not found"
}
```

2. **422 Unprocessable Entity** - Current password is incorrect
```json
{
  "statusCode": 422,
  "message": "Current password is incorrect"
}
```

3. **422 Unprocessable Entity** - New password same as current
```json
{
  "statusCode": 422,
  "message": "New password must be different from current password"
}
```

4. **422 Unprocessable Entity** - No password set
```json
{
  "statusCode": 422,
  "message": "No password set for this employment account. Please contact administrator."
}
```

5. **400 Bad Request** - Validation error
```json
{
  "statusCode": 400,
  "message": [
    "Current password must be at least 6 characters long",
    "New password must be at least 6 characters long"
  ]
}
```

## Usage Examples

### Using cURL

```bash
curl -X PATCH http://localhost:3000/employment/657e902c4b628d1f0fc8f09e/update-password \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }'
```

### Using Axios (JavaScript/TypeScript)

```typescript
import axios from 'axios';

const updateEmployeePassword = async (employmentId: string) => {
  try {
    const response = await axios.patch(
      `http://localhost:3000/employment/${employmentId}/update-password`,
      {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456'
      }
    );
    console.log(response.data);
  } catch (error) {
    console.error('Error updating password:', error.response.data);
  }
};
```

### Using Fetch API

```javascript
const updatePassword = async (employmentId, currentPassword, newPassword) => {
  const response = await fetch(`http://localhost:3000/employment/${employmentId}/update-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currentPassword,
      newPassword
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message);
  }
  
  return data;
};
```

## Security Features

1. **Password Hashing**: Passwords are hashed using PBKDF2 algorithm with SHA-512
2. **Current Password Verification**: Requires current password to prevent unauthorized changes
3. **Password Comparison**: New password must be different from current password
4. **Secure Storage**: Passwords are stored with the `select: false` flag in the schema
5. **Validation**: Input validation using class-validator decorators

## Implementation Details

### Service Method (`employment.service.ts`)

The `updatePassword` method:
1. Fetches the employment record with password (using `select` to include password field)
2. Verifies the employment record exists
3. Checks if a password is set
4. Verifies the current password matches
5. Ensures new password is different from current
6. Hashes the new password
7. Updates the password in the database

### Password Utilities

The service uses the following utility functions from `apps/auth/src/utils/common.utils.ts`:
- `hashPassword(password: string)`: Hashes a password
- `comparePassword(enteredPassword: string, storedPassword: string)`: Compares passwords

## Testing

You can test the endpoint using the Swagger UI at:
```
http://localhost:3000/api-docs
```

Look for the "Employment" section and find the "Update employee password" endpoint.

## Notes

- The endpoint uses PATCH method as per REST conventions for partial updates
- The employment ID must be valid MongoDB ObjectId
- Only the employee themselves should be able to update their password (consider adding authentication guard)
- Consider adding rate limiting to prevent brute force attacks
- Consider adding password strength requirements (uppercase, lowercase, numbers, special characters)

## Future Enhancements

Potential improvements to consider:
1. Add authentication guard to ensure only the employee can update their own password
2. Add "forgot password" functionality with email verification
3. Implement password history to prevent reusing recent passwords
4. Add password strength meter on frontend
5. Send email notification when password is changed
6. Add two-factor authentication (2FA) support
7. Implement password expiry and force password change

