# Super Admin - Quick Reference

## 🎯 What is Super Admin?

Super admins have **elevated privileges** and their courses are **visible to ALL users** automatically!

---

## ✨ Key Features

| Feature | Regular Admin | Super Admin |
|---------|--------------|-------------|
| Create courses | ✅ Yes | ✅ Yes |
| Course visibility | Group members only | **🌍 ALL USERS** |
| Manage super admins | ❌ No | ✅ Yes |
| Group required | ✅ Yes | ❌ No |

---

## 🚀 Quick Start

### 1. Create First Super Admin
```bash
POST /super-admin
{
  "fullName": "Platform Admin",
  "email": "admin@lms.com",
  "password": "SecurePass123!",
  "phone": "1234567890",
  "companyName": "LMS Platform"
}
```

### 2. Login as Super Admin
```bash
POST /users/login
{
  "email": "admin@lms.com",
  "password": "SecurePass123!"
}

# Save the token!
```

### 3. Create Global Course
```bash
POST /courses
{
  "title": "Company-Wide Security Training",
  "description": "Mandatory for all employees",
  "userId": "superAdminId"
}

# ✅ Automatically visible to ALL users!
```

---

## 📋 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/super-admin` | Create super admin | None |
| GET | `/super-admin` | List all super admins | Super Admin |
| PATCH | `/super-admin/toggle/:userId` | Toggle super admin status | Super Admin |
| DELETE | `/super-admin/:userId` | Remove super admin status | Super Admin |

---

## 💡 How It Works

### Regular Admin Course:
```mermaid
Regular Admin → Creates Course → Only Group Members See It
```

### Super Admin Course:
```mermaid
Super Admin → Creates Course → 🌍 EVERYONE Sees It
```

---

## 🔍 Check Status

### Check if User is Super Admin:
```bash
GET /users/{userId}

# Look for: "isSuperAdmin": true
```

### Check if Course is Global:
```bash
GET /courses/{courseId}

# Look for: "isSuperAdminCourse": true
```

---

## 🎯 Use Cases

### ✅ Perfect for:
- Company-wide mandatory training
- Compliance courses
- Security awareness training
- Platform announcements
- New employee onboarding

### ❌ Not recommended for:
- Department-specific training
- Team-level courses
- Role-based content
- Limited audience materials

---

## 🔐 Security

### Protected Endpoints:
- All management endpoints require **Super Admin** privileges
- Uses two guards:
  1. `PasscodeAuthGuard` - Authentication
  2. `SuperAdminGuard` - Super admin check

### Example Header:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📊 Database Schema

### UserDocument:
```typescript
{
  // ... existing fields ...
  isSuperAdmin: boolean;  // ✅ NEW
}
```

### Course:
```typescript
{
  // ... existing fields ...
  isSuperAdminCourse: boolean;  // ✅ NEW
}
```

---

## 🎨 Frontend Examples

### React: Check Super Admin Status
```jsx
function UserBadge({ user }) {
  return (
    <div>
      <h3>{user.fullName}</h3>
      {user.isSuperAdmin && (
        <span className="badge">Super Admin ⭐</span>
      )}
    </div>
  );
}
```

### React: Create Super Admin Form
```jsx
function CreateSuperAdmin() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/super-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await response.json();
    alert(data.message);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={form.fullName}
        onChange={(e) => setForm({...form, fullName: e.target.value})}
        placeholder="Full Name"
        required
      />
      <input 
        type="email"
        value={form.email}
        onChange={(e) => setForm({...form, email: e.target.value})}
        placeholder="Email"
        required
      />
      <input 
        type="password"
        value={form.password}
        onChange={(e) => setForm({...form, password: e.target.value})}
        placeholder="Password (min 8 chars)"
        required
        minLength={8}
      />
      <button type="submit">Create Super Admin</button>
    </form>
  );
}
```

### React: Toggle Super Admin
```jsx
async function toggleSuperAdmin(userId, isSuperAdmin) {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`/super-admin/toggle/${userId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ isSuperAdmin })
  });
  return await response.json();
}

// Usage:
await toggleSuperAdmin('user123', true);  // Promote
await toggleSuperAdmin('user123', false); // Demote
```

---

## 🧪 Testing

### Test Course Visibility

```bash
# 1. Super admin creates course
curl -X POST http://localhost:3000/courses \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Course","userId":"superAdminId"}'

# 2. Regular user fetches courses
curl http://localhost:3000/courses?userId=regularUserId

# 3. Verify super admin course appears!
```

### Test Super Admin Access

```bash
# Try without super admin (should fail)
curl -X GET http://localhost:3000/super-admin \
  -H "Authorization: Bearer regularUserToken"

# Response: 403 Forbidden

# Try with super admin (should succeed)
curl -X GET http://localhost:3000/super-admin \
  -H "Authorization: Bearer superAdminToken"

# Response: List of super admins
```

---

## ⚠️ Important Notes

### 1. **First Super Admin**
- Create via unprotected POST endpoint
- Or insert directly in database
- Then protect the endpoint if needed

### 2. **Limited Number**
- Keep super admins to minimum (2-5)
- Only trusted personnel
- Regular admins don't need this

### 3. **Course Scope**
- Use for platform-wide content only
- Not for department/team courses
- Consider impact on all users

### 4. **No Undo**
- Once course is created as super admin course
- It's visible to ALL users
- Cannot easily revert to group-based

---

## 🆘 Common Issues

### Issue: Course not visible globally
**Fix**: Verify creator has `isSuperAdmin: true`

### Issue: Cannot access /super-admin endpoints
**Fix**: Ensure token is valid and user is super admin

### Issue: Super admin status not saving
**Fix**: Check database schema is updated

---

## 📖 Full Documentation

For complete details, see: **`SUPER_ADMIN_DOCUMENTATION.md`**

---

## 🔗 Related

- Dashboard APIs: `DASHBOARD_API_QUICK_REFERENCE.md`
- Employee APIs: `EMPLOYEE_APIS_QUICK_REFERENCE.md`
- All APIs: `API_SUMMARY.md`
- Swagger: `http://localhost:3000/api-docs`

---

## ✅ Quick Checklist

Setup:
- [ ] Create first super admin
- [ ] Test login
- [ ] Verify super admin status in DB
- [ ] Test creating a course
- [ ] Verify course visible to all users

Management:
- [ ] List all super admins
- [ ] Test promoting user
- [ ] Test demoting user
- [ ] Test access restrictions

Security:
- [ ] Verify guard protection works
- [ ] Test with non-super admin (should fail)
- [ ] Check authentication required
- [ ] Audit super admin list

---

**Quick Tip**: Start with one super admin, test thoroughly, then add others as needed!

