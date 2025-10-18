# Dashboard APIs - Quick Reference

## 📊 All Dashboard Endpoints

### Statistics & Metrics
- **GET** `/dashboard/stats` - Get key metrics (Active Learners, Courses, Completion Rate, Progress)
- **GET** `/dashboard/enrollments` - Get monthly enrollment data for chart
- **GET** `/dashboard/active-learners` - Get top performing employees/learners
- **GET** `/dashboard/top-courses` - Get top performing courses by completion rate
- **GET** `/dashboard/new-courses` - Get recently created courses
- **GET** `/dashboard/complete` - Get all dashboard data in one call ⚡

---

## 🚀 Quick Examples

### Get All Dashboard Data (One API Call)
```bash
GET /dashboard/complete?userId=<optional>

# Response:
{
  "stats": {
    "activeLearners": 2847,
    "activeLearnersChange": 12.5,
    "totalCourses": 156,
    "totalCoursesChange": 2.1,
    "avgCompletionRate": 87,
    "avgCompletionRateChange": 1.2,
    "avgLearnerProgress": 83,
    "avgLearnerProgressChange": 7.8
  },
  "recentEnrollments": [...],
  "mostActiveLearners": [...],
  "topPerformingCourses": [...],
  "newCourses": [...]
}
```

### Dashboard Stats Only
```bash
GET /dashboard/stats

# Response:
{
  "activeLearners": 2847,
  "activeLearnersChange": 12.5,  // +12.5% from last month
  "totalCourses": 156,
  "totalCoursesChange": 2.1,     // +2.1% from last month
  "avgCompletionRate": 87,       // 87% completion rate
  "avgCompletionRateChange": 1.2,
  "avgLearnerProgress": 83,      // 83% average progress
  "avgLearnerProgressChange": 7.8
}
```

### Enrollment Chart Data
```bash
GET /dashboard/enrollments?months=6

# Response:
[
  { "month": "Feb", "enrollments": 700 },
  { "month": "Mar", "enrollments": 780 },
  { "month": "Apr", "enrollments": 950 },
  { "month": "May", "enrollments": 870 },
  { "month": "Jun", "enrollments": 1010 },
  { "month": "Jul", "enrollments": 1120 }
]
```

### Most Active Learners
```bash
GET /dashboard/active-learners?limit=5

# Response:
[
  {
    "rank": 1,
    "id": "657e902c4b628d1f0fc8f09d",
    "name": "Sarah Johnson",
    "initials": "SJ",
    "completedCourses": 12,
    "timeSpent": "12h",
    "weeklyPerformance": 96
  },
  ...
]
```

### Top Performing Courses
```bash
GET /dashboard/top-courses?limit=5

# Response:
[
  {
    "courseId": "657e902c4b628d1f0fc8f09e",
    "courseName": "Cybersecurity Fundamentals",
    "enrolled": 1200,
    "avgScore": 92,
    "completed": 1320,
    "completionRate": 94
  },
  ...
]
```

### New Courses
```bash
GET /dashboard/new-courses?limit=10

# Response:
[
  {
    "courseId": "657e902c4b628d1f0fc8f09e",
    "courseName": "Advanced Threat Detection",
    "createdAgo": "0 day ago",
    "createdAt": "2025-10-18T10:30:00.000Z"
  },
  ...
]
```

---

## 📈 Query Parameters

| Endpoint | Parameters | Description |
|----------|------------|-------------|
| `/dashboard/stats` | `userId` (optional) | Filter by user/admin |
| `/dashboard/enrollments` | `userId`, `months` (default: 6) | Filter + time range |
| `/dashboard/active-learners` | `userId`, `limit` (default: 5) | Filter + number of results |
| `/dashboard/top-courses` | `userId`, `limit` (default: 10) | Filter + number of results |
| `/dashboard/new-courses` | `userId`, `limit` (default: 10) | Filter + number of results |
| `/dashboard/complete` | `userId` (optional) | Filter all data |

---

## 💡 Best Practices

### 1. Use Complete Endpoint for Initial Load
```javascript
// ✅ GOOD - One API call
const dashboard = await fetch('/dashboard/complete').then(r => r.json());

// ❌ BAD - Five API calls
const stats = await fetch('/dashboard/stats').then(r => r.json());
const enrollments = await fetch('/dashboard/enrollments').then(r => r.json());
// ... 3 more calls
```

### 2. Implement Caching
```javascript
// Cache for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;
let cachedData = null;
let cacheTime = null;

async function getDashboard() {
  const now = Date.now();
  
  if (cachedData && cacheTime && (now - cacheTime) < CACHE_DURATION) {
    return cachedData;
  }
  
  cachedData = await fetch('/dashboard/complete').then(r => r.json());
  cacheTime = now;
  
  return cachedData;
}
```

### 3. Add Loading States
```javascript
const [loading, setLoading] = useState(true);
const [dashboard, setDashboard] = useState(null);

useEffect(() => {
  async function load() {
    setLoading(true);
    try {
      const data = await fetch('/dashboard/complete').then(r => r.json());
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }
  load();
}, []);
```

---

## 🎨 Frontend Integration

### React Component Example
```jsx
import { useEffect, useState } from 'react';

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/dashboard/complete')
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Active Learners"
          value={data.stats.activeLearners}
          change={data.stats.activeLearnersChange}
        />
        <StatCard
          title="Total Courses"
          value={data.stats.totalCourses}
          change={data.stats.totalCoursesChange}
        />
        <StatCard
          title="Avg Completion Rate"
          value={`${data.stats.avgCompletionRate}%`}
          change={data.stats.avgCompletionRateChange}
        />
        <StatCard
          title="Avg Learner Progress"
          value={`${data.stats.avgLearnerProgress}%`}
          change={data.stats.avgLearnerProgressChange}
        />
      </div>

      {/* Enrollment Chart */}
      <EnrollmentChart data={data.recentEnrollments} />

      {/* Active Learners List */}
      <LearnersList learners={data.mostActiveLearners} />

      {/* Top Courses */}
      <CoursesList courses={data.topPerformingCourses} />

      {/* New Courses */}
      <NewCoursesList courses={data.newCourses} />
    </div>
  );
}
```

### Chart.js Integration
```javascript
import { Chart } from 'chart.js/auto';

function renderEnrollmentChart(enrollments) {
  const ctx = document.getElementById('chart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: enrollments.map(e => e.month),
      datasets: [{
        label: 'Monthly Enrollments',
        data: enrollments.map(e => e.enrollments),
        backgroundColor: '#8B5CF6',
        borderRadius: 8
      }]
    }
  });
}

// Usage
const data = await fetch('/dashboard/complete').then(r => r.json());
renderEnrollmentChart(data.recentEnrollments);
```

---

## 🔄 Real-time Updates

### Polling Strategy
```javascript
// Update every 30 seconds
setInterval(async () => {
  const data = await fetch('/dashboard/stats').then(r => r.json());
  updateDashboard(data);
}, 30000);
```

### Manual Refresh Button
```jsx
function Dashboard() {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const refresh = async () => {
    const newData = await fetch('/dashboard/complete').then(r => r.json());
    setData(newData);
    setLastUpdate(new Date());
  };

  return (
    <div>
      <button onClick={refresh}>Refresh</button>
      <span>Last updated: {lastUpdate?.toLocaleTimeString()}</span>
      {/* Dashboard content */}
    </div>
  );
}
```

---

## 📊 Data Visualization Libraries

### Recommended Libraries

1. **Chart.js** - Simple bar/line charts
   ```bash
   npm install chart.js
   ```

2. **Recharts** - React-specific charting
   ```bash
   npm install recharts
   ```

3. **ApexCharts** - Advanced interactive charts
   ```bash
   npm install apexcharts react-apexcharts
   ```

4. **D3.js** - Custom visualizations
   ```bash
   npm install d3
   ```

---

## 🎯 Key Metrics Explained

### Active Learners
- **Definition**: Employees who logged in this month and are active
- **Change**: Compared to last month's count
- **Formula**: `COUNT(isActive=true AND lastLoggedIn >= firstDayOfMonth)`

### Total Courses
- **Definition**: Number of active courses in the system
- **Change**: Compared to last month
- **Formula**: `COUNT(isActive=true)`

### Avg Completion Rate
- **Definition**: Average course completion percentage across all learners
- **Change**: Compared to last month
- **Formula**: `AVG(progressPercentage) from UserProgress`

### Weekly Performance
- **Definition**: Individual learner's average progress across all their courses
- **Formula**: `AVG(progressPercentage) per employee`

### Course Completion Rate
- **Definition**: Percentage of enrolled learners who completed the course
- **Formula**: `(completedCount / enrolledCount) * 100`

---

## 🔍 Filtering by User/Admin

All endpoints support `userId` parameter to filter data:

```javascript
// Global admin view (all data)
fetch('/dashboard/complete');

// Specific user/admin view
const userId = '657e902c4b628d1f0fc8f09d';
fetch(`/dashboard/complete?userId=${userId}`);

// Apply to individual endpoints
fetch(`/dashboard/stats?userId=${userId}`);
fetch(`/dashboard/enrollments?userId=${userId}`);
fetch(`/dashboard/active-learners?userId=${userId}`);
```

---

## 🚨 Error Handling

```javascript
async function fetchDashboard() {
  try {
    const response = await fetch('/dashboard/complete');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Dashboard error:', error);
    
    // Show cached data or error message
    return getCachedData() || showError();
  }
}
```

---

## 📱 Responsive Design Tips

### Mobile-First Stats Cards
```css
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## ⚡ Performance Tips

1. **Use Complete Endpoint** - Single API call instead of 5
2. **Implement Caching** - Cache for 5-10 minutes
3. **Add Database Indexes** - On `lastLoggedIn`, `isActive`, `createdAt`
4. **Lazy Load Charts** - Load charts only when visible
5. **Debounce Refresh** - Prevent rapid API calls

---

## 🧪 Testing with cURL

```bash
# Get everything
curl http://localhost:3000/dashboard/complete

# Get stats only
curl http://localhost:3000/dashboard/stats

# Get enrollments for 12 months
curl "http://localhost:3000/dashboard/enrollments?months=12"

# Get top 10 learners
curl "http://localhost:3000/dashboard/active-learners?limit=10"

# Filter by user
curl "http://localhost:3000/dashboard/complete?userId=657e902c4b628d1f0fc8f09d"
```

---

## 📖 Full Documentation

For complete details, see:
- **`DASHBOARD_API_DOCUMENTATION.md`** - Full documentation with examples
- **Swagger UI**: `http://localhost:3000/api-docs` (Dashboard section)

---

## 🎉 Dashboard Components Checklist

- [ ] Stats cards with percentage changes
- [ ] Enrollment bar/line chart
- [ ] Active learners leaderboard
- [ ] Top performing courses list
- [ ] New courses list
- [ ] Refresh button
- [ ] Last updated timestamp
- [ ] Loading states
- [ ] Error handling
- [ ] Mobile responsive layout
- [ ] Auto-refresh (optional)
- [ ] Export to CSV/PDF (optional)

---

## 💻 Tech Stack Recommendations

### Frontend
- **React** + TypeScript
- **TailwindCSS** for styling
- **Chart.js** or **Recharts** for charts
- **React Query** for caching

### State Management
- **React Query** (recommended)
- **Redux Toolkit**
- **Zustand**

### UI Components
- **Shadcn/ui**
- **Material-UI**
- **Ant Design**

---

## 🔗 Related APIs

- Employee course tracking: `EMPLOYEE_COURSE_TRACKING_API.md`
- Employee authentication: `EMPLOYEE_UPDATE_PASSWORD_API.md`
- Employment management: `EMPLOYMENT_FEATURE.md`

---

## 🆘 Need Help?

- Check Swagger documentation at `/api-docs`
- Review full documentation in `DASHBOARD_API_DOCUMENTATION.md`
- Test endpoints individually before integrating
- Use browser DevTools Network tab to debug API calls

