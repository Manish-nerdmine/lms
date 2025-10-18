# Super Admin Feature Documentation

## Overview
The Super Admin feature provides elevated privileges for administrators who can create courses visible to all users across the platform, regardless of group assignments.

---

## Key Features

### 1. **Super Admin Privileges**
- Create courses visible to ALL users
- Manage other super admins
- Full system access
- Override group-based restrictions

### 2. **Global Course Visibility**
- Courses created by super admins are automatically marked as "Super Admin Courses"
- These courses appear in course lists for ALL users
- No group assignment required
- Perfect for mandatory training, company-wide courses

### 3. **Super Admin Management**
- Create new super admins
- Toggle super admin status for existing users
- List all super admins
- Remove super admin privileges

---

## Database Schema Updates

### UserDocument Schema
```typescript
{
  // ... existing fields ...
  isSuperAdmin: boolean;  // ✅ NEW: Marks user as super admin
  createdAt: Date;
  updatedAt: Date;
}
```

### Course Schema
```typescript
{
  // ... existing fields ...
  isSuperAdminCourse: boolean;  // ✅ NEW: Marks course as visible to all
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Endpoints

### 1. Create Super Admin
**`POST /super-admin`**

Create a new super admin user with full privileges.

**Request Body:**
```json
{
  "fullName": "Super Admin",
  "email": "superadmin@lms.com",
  "password": "SuperSecurePass123!",
  "phone": "1234567890",
  "companyName": "LMS Platform"
}
```

**Success Response (201):**
```json
{
  "message": "Super admin created successfully",
  "superAdmin": {
    "_id": "657e902c4b628d1f0fc8f09d",
    "fullName": "Super Admin",
    "email": "superadmin@lms.com",
    "userType": "admin",
    "isSuperAdmin": true,
    "isTermsAccepted": true,
    "createdAt": "2025-10-18T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `409 Conflict`: User with this email already exists

---

### 2. Get All Super Admins
**`GET /super-admin`**

Get a list of all super admins in the system.

**Authentication:** Super Admin only (Bearer token required)

**Success Response (200):**
```json
{
  "total": 3,
  "superAdmins": [
    {
      "_id": "657e902c4b628d1f0fc8f09d",
      "fullName": "Super Admin",
      "email": "superadmin@lms.com",
      "userType": "admin",
      "isSuperAdmin": true,
      "createdAt": "2025-10-18T10:30:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `403 Forbidden`: Access denied. Super admin privileges required.

---

### 3. Toggle Super Admin Status
**`PATCH /super-admin/toggle/:userId`**

Promote a regular user to super admin or demote a super admin to regular user.

**Authentication:** Super Admin only (Bearer token required)

**Request Body:**
```json
{
  "isSuperAdmin": true
}
```

**Success Response (200):**
```json
{
  "message": "User promoted to super admin successfully",
  "userId": "657e902c4b628d1f0fc8f09d",
  "isSuperAdmin": true
}
```

**Error Responses:**
- `404 Not Found`: User not found
- `403 Forbidden`: Access denied. Super admin privileges required.

---

### 4. Remove Super Admin Status
**`DELETE /super-admin/:userId`**

Remove super admin privileges from a user.

**Authentication:** Super Admin only (Bearer token required)

**Success Response (200):**
```json
{
  "message": "Super admin status removed successfully",
  "userId": "657e902c4b628d1f0fc8f09d"
}
```

**Error Responses:**
- `404 Not Found`: User not found
- `400 Bad Request`: User is not a super admin
- `403 Forbidden`: Access denied. Super admin privileges required.

---

## How It Works

### Course Creation Flow

#### Regular Admin Creates Course:
```javascript
// 1. Regular admin creates a course
POST /courses
{
  "title": "Department Training",
  "description": "For marketing team",
  "userId": "regularAdminId"
}

// 2. System checks: user.isSuperAdmin = false
// 3. Course created with: isSuperAdminCourse = false
// 4. Course visible only to users in assigned groups
```

#### Super Admin Creates Course:
```javascript
// 1. Super admin creates a course
POST /courses
{
  "title": "Company-Wide Security Training",
  "description": "Mandatory for all employees",
  "userId": "superAdminId"
}

// 2. System checks: user.isSuperAdmin = true ✅
// 3. Course created with: isSuperAdminCourse = true ✅
// 4. Course visible to ALL users automatically! 🌍
```

### Course Visibility Logic

```javascript
// When fetching courses for a user
GET /courses?userId=user123

// Query logic:
{
  $or: [
    { userId: user123 },           // User's own courses
    { isSuperAdminCourse: true }   // ✅ ALL super admin courses
  ]
}

// Result: User sees their courses + all super admin courses
```

---

## Usage Examples

### 1. Create First Super Admin (Setup)

```bash
curl -X POST http://localhost:3000/super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Platform Admin",
    "email": "admin@lms.com",
    "password": "SecurePassword123!",
    "phone": "1234567890",
    "companyName": "LMS Platform"
  }'
```

### 2. Super Admin Login

```bash
# Login as super admin
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lms.com",
    "password": "SecurePassword123!"
  }'

# Save the token
# TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. Create Global Course (Visible to All)

```bash
# Super admin creates a course
curl -X POST http://localhost:3000/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Annual Compliance Training",
    "description": "Mandatory for all employees - covers data privacy, security, and company policies",
    "userId": "superAdminId"
  }'

# ✅ This course is automatically visible to ALL users!
```

### 4. Promote User to Super Admin

```bash
curl -X PATCH http://localhost:3000/super-admin/toggle/USER_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isSuperAdmin": true
  }'
```

### 5. List All Super Admins

```bash
curl -X GET http://localhost:3000/super-admin \
  -H "Authorization: Bearer $TOKEN"
```

---

## React/TypeScript Integration

### Create Super Admin Component

```typescript
import { useState } from 'react';
import axios from 'axios';

interface CreateSuperAdminForm {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
}

function CreateSuperAdmin() {
  const [form, setForm] = useState<CreateSuperAdminForm>({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    companyName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('/super-admin', form);
      alert(response.data.message);
      console.log('Super Admin Created:', response.data.superAdmin);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create super admin');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={form.fullName}
        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password (min 8 characters)"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={8}
      />
      <input
        type="tel"
        placeholder="Phone (optional)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <input
        type="text"
        placeholder="Company Name (optional)"
        value={form.companyName}
        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
      />
      <button type="submit">Create Super Admin</button>
    </form>
  );
}
```

### Toggle Super Admin Status

```typescript
async function toggleSuperAdmin(userId: string, isSuperAdmin: boolean) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await axios.patch(
      `/super-admin/toggle/${userId}`,
      { isSuperAdmin },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    alert(response.data.message);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      alert('Access denied. Super admin privileges required.');
    } else {
      alert('Failed to toggle super admin status');
    }
    throw error;
  }
}

// Usage
await toggleSuperAdmin('user123', true);  // Promote to super admin
await toggleSuperAdmin('user123', false); // Remove super admin
```

### List Super Admins

```typescript
import { useEffect, useState } from 'react';

interface SuperAdmin {
  _id: string;
  fullName: string;
  email: string;
  isSuperAdmin: boolean;
  createdAt: string;
}

function SuperAdminList() {
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuperAdmins = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('/super-admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuperAdmins(response.data.superAdmins);
      } catch (error) {
        console.error('Failed to fetch super admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuperAdmins();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Super Admins ({superAdmins.length})</h2>
      <ul>
        {superAdmins.map((admin) => (
          <li key={admin._id}>
            <strong>{admin.fullName}</strong>
            <span>{admin.email}</span>
            <span>Created: {new Date(admin.createdAt).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Security Considerations

### 1. **Super Admin Guard**
All super admin management endpoints are protected:

```typescript
@UseGuards(PasscodeAuthGuard, SuperAdminGuard)
```

- **PasscodeAuthGuard**: Ensures user is authenticated
- **SuperAdminGuard**: Ensures user has `isSuperAdmin: true`

### 2. **Password Requirements**
- Minimum 8 characters
- Use strong passwords for super admin accounts
- Consider implementing 2FA for super admins

### 3. **Audit Logging**
Consider adding audit logs for:
- Super admin creation
- Super admin status changes
- Super admin course creation
- Super admin access to sensitive endpoints

### 4. **First Super Admin Creation**
The first super admin should be created through:
- Direct database insertion, OR
- A secure setup script, OR
- The unprotected `/super-admin` POST endpoint (then disable it)

---

## Use Cases

### 1. **Company-Wide Mandatory Training**
```javascript
// Super admin creates compliance course
POST /courses
{
  "title": "Annual Security Training",
  "description": "Required for all employees",
  "userId": "superAdminId"
}

// ✅ Automatically visible to ALL employees
// ❌ No need to assign to each group individually
```

### 2. **Platform Announcements**
```javascript
// Super admin creates announcement course
POST /courses
{
  "title": "New Platform Features",
  "description": "Overview of Q4 updates",
  "userId": "superAdminId"
}

// ✅ All users see it immediately
```

### 3. **Executive Training**
```javascript
// Regular admin creates department-specific course
POST /courses
{
  "title": "Sales Techniques",
  "description": "For sales team only",
  "userId": "regularAdminId"
}

// ✅ Only visible to users in assigned sales groups
// ❌ Not visible to other departments
```

---

## Testing

### Test Super Admin Creation
```bash
# Create super admin
curl -X POST http://localhost:3000/super-admin \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test Super Admin",
    "email": "test-super@lms.com",
    "password": "TestPassword123!"
  }'

# Verify in database
# MongoDB: db.userdocuments.findOne({ email: "test-super@lms.com" })
# Should have: isSuperAdmin: true
```

### Test Course Visibility
```bash
# 1. Super admin creates course
# 2. Regular user logs in
# 3. GET /courses?userId=regularUserId
# 4. Verify super admin course appears in response
```

---

## Migration Guide

### Existing System Migration

If you already have users and need to make one a super admin:

```javascript
// Option 1: Direct database update
db.userdocuments.updateOne(
  { email: "admin@company.com" },
  { $set: { isSuperAdmin: true } }
);

// Option 2: Use toggle API (requires existing super admin)
PATCH /super-admin/toggle/{userId}
{ "isSuperAdmin": true }
```

### Existing Courses

Existing courses remain unchanged:
- `isSuperAdminCourse` defaults to `false`
- Only new courses by super admins are marked as global
- Existing courses maintain group-based visibility

---

## Best Practices

### 1. **Limit Super Admins**
- Only assign super admin to trusted personnel
- Typically 2-5 super admins maximum
- Regular users should NOT have super admin access

### 2. **Document Super Admin Actions**
- Log course creation by super admins
- Track changes to super admin status
- Monitor global course deployments

### 3. **Use for Platform-Wide Content Only**
Super admin courses should be for:
- ✅ Company-wide mandatory training
- ✅ Compliance courses
- ✅ Platform announcements
- ❌ Department-specific content
- ❌ Team-level training

### 4. **Regular Audits**
- Review list of super admins quarterly
- Verify all super admin courses are still relevant
- Remove super admin access when no longer needed

---

## Troubleshooting

### Issue: Course not visible to all users
**Solution**: Check if creator has `isSuperAdmin: true`

```javascript
// Check user status
GET /users/{userId}
// Response should have: "isSuperAdmin": true

// Check course status
GET /courses/{courseId}
// Response should have: "isSuperAdminCourse": true
```

### Issue: Cannot access super admin endpoints
**Solution**: Ensure user is authenticated AND has super admin status

```javascript
// 1. Check authentication token is valid
// 2. Verify user has isSuperAdmin: true
// 3. Use both guards: PasscodeAuthGuard + SuperAdminGuard
```

### Issue: Super admin status not persisting
**Solution**: Verify database schema is updated

```bash
# Check MongoDB collection
db.userdocuments.findOne({ _id: ObjectId("...") })

# Should have isSuperAdmin field
# If missing, run migration or update schema
```

---

## Related Documentation

- **Dashboard APIs**: `DASHBOARD_API_DOCUMENTATION.md`
- **Employee Management**: `EMPLOYMENT_FEATURE.md`
- **Course Management**: Course-related endpoints in Swagger
- **API Summary**: `API_SUMMARY.md`

---

## Swagger Documentation

Access interactive API documentation at:
```
http://localhost:3000/api-docs
```

Look for the "Super Admin" section to test all endpoints.

---

**Version**: 1.0  
**Last Updated**: October 18, 2025  
**Author**: LMS Development Team

