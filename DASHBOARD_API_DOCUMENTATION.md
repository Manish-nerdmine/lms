# Dashboard Analytics API Documentation

## Overview
Comprehensive dashboard APIs to power admin analytics, statistics, and monitoring for the LMS platform. These APIs provide real-time insights into learner activity, course performance, and enrollment trends.

---

## API Endpoints

### 1. Dashboard Statistics
**`GET /dashboard/stats`**

Get key dashboard metrics with percentage changes compared to the previous month.

**Query Parameters:**
- `userId` (optional): Filter statistics by specific user/admin

**Response (200):**
```json
{
  "activeLearners": 2847,
  "activeLearnersChange": 12.5,
  "totalCourses": 156,
  "totalCoursesChange": 2.1,
  "avgCompletionRate": 87,
  "avgCompletionRateChange": 1.2,
  "avgLearnerProgress": 83,
  "avgLearnerProgressChange": 7.8
}
```

**Response Fields:**
- `activeLearners`: Number of active employees (logged in this month)
- `activeLearnersChange`: Percentage change from last month
- `totalCourses`: Total number of active courses
- `totalCoursesChange`: Percentage change from last month
- `avgCompletionRate`: Average course completion rate (%)
- `avgCompletionRateChange`: Percentage change from last month
- `avgLearnerProgress`: Average learner progress across all courses (%)
- `avgLearnerProgressChange`: Percentage change from last month

---

### 2. Recent Enrollments
**`GET /dashboard/enrollments`**

Get enrollment data by month for the chart visualization.

**Query Parameters:**
- `userId` (optional): Filter by specific user/admin
- `months` (optional, default: 6): Number of months to retrieve

**Response (200):**
```json
[
  { "month": "Feb", "enrollments": 700 },
  { "month": "Mar", "enrollments": 780 },
  { "month": "Apr", "enrollments": 950 },
  { "month": "May", "enrollments": 870 },
  { "month": "Jun", "enrollments": 1010 },
  { "month": "Jul", "enrollments": 1120 }
]
```

**Response Fields:**
- `month`: Month name (Jan, Feb, Mar, etc.)
- `enrollments`: Number of new enrollments in that month

---

### 3. Most Active Learners
**`GET /dashboard/active-learners`**

Get top performing employees/learners ranked by progress and completed courses.

**Query Parameters:**
- `userId` (optional): Filter by specific user/admin
- `limit` (optional, default: 5): Number of top learners to return

**Response (200):**
```json
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
  {
    "rank": 2,
    "id": "657e902c4b628d1f0fc8f09e",
    "name": "Michael Chen",
    "initials": "MC",
    "completedCourses": 14,
    "timeSpent": "14h",
    "weeklyPerformance": 90
  },
  {
    "rank": 3,
    "id": "657e902c4b628d1f0fc8f09f",
    "name": "Emma Davis",
    "initials": "ED",
    "completedCourses": 16,
    "timeSpent": "16h",
    "weeklyPerformance": 92
  }
]
```

**Response Fields:**
- `rank`: Position in the leaderboard (1-based)
- `id`: Employee/learner ID
- `name`: Full name
- `initials`: Name initials (for avatar display)
- `completedCourses`: Number of courses completed
- `timeSpent`: Estimated time spent (rough calculation)
- `weeklyPerformance`: Average progress percentage across all courses

---

### 4. Top Performing Courses
**`GET /dashboard/top-courses`**

Get courses ranked by completion rate and enrollment numbers.

**Query Parameters:**
- `userId` (optional): Filter by specific user/admin
- `limit` (optional, default: 10): Number of courses to return

**Response (200):**
```json
[
  {
    "courseId": "657e902c4b628d1f0fc8f09e",
    "courseName": "Cybersecurity Fundamentals",
    "enrolled": 1200,
    "avgScore": 92,
    "completed": 1320,
    "completionRate": 94
  },
  {
    "courseId": "657e902c4b628d1f0fc8f09f",
    "courseName": "Data Privacy & GDPR",
    "enrolled": 920,
    "avgScore": 86,
    "completed": 1040,
    "completionRate": 89
  }
]
```

**Response Fields:**
- `courseId`: Course ID
- `courseName`: Course title
- `enrolled`: Number of learners enrolled
- `avgScore`: Average quiz score (%)
- `completed`: Number of completions
- `completionRate`: Completion percentage

---

### 5. New Courses
**`GET /dashboard/new-courses`**

Get recently created courses ordered by creation date.

**Query Parameters:**
- `userId` (optional): Filter by specific user/admin
- `limit` (optional, default: 10): Number of courses to return

**Response (200):**
```json
[
  {
    "courseId": "657e902c4b628d1f0fc8f09e",
    "courseName": "Advanced Threat Detection",
    "createdAgo": "0 day ago",
    "createdAt": "2025-10-18T10:30:00.000Z"
  },
  {
    "courseId": "657e902c4b628d1f0fc8f09f",
    "courseName": "Cloud Security Best Practices",
    "createdAgo": "2 days ago",
    "createdAt": "2025-10-16T14:20:00.000Z"
  }
]
```

**Response Fields:**
- `courseId`: Course ID
- `courseName`: Course title
- `createdAgo`: Human-readable time since creation
- `createdAt`: ISO timestamp of creation

---

### 6. Complete Dashboard
**`GET /dashboard/complete`**

Get all dashboard data in a single API call (optimized for efficiency).

**Query Parameters:**
- `userId` (optional): Filter by specific user/admin

**Response (200):**
```json
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
  "recentEnrollments": [
    { "month": "Feb", "enrollments": 700 },
    { "month": "Mar", "enrollments": 780 }
  ],
  "mostActiveLearners": [
    {
      "rank": 1,
      "id": "657e902c4b628d1f0fc8f09d",
      "name": "Sarah Johnson",
      "initials": "SJ",
      "completedCourses": 12,
      "timeSpent": "12h",
      "weeklyPerformance": 96
    }
  ],
  "topPerformingCourses": [
    {
      "courseId": "657e902c4b628d1f0fc8f09e",
      "courseName": "Cybersecurity Fundamentals",
      "enrolled": 1200,
      "avgScore": 92,
      "completed": 1320,
      "completionRate": 94
    }
  ],
  "newCourses": [
    {
      "courseId": "657e902c4b628d1f0fc8f09e",
      "courseName": "Advanced Threat Detection",
      "createdAgo": "0 day ago",
      "createdAt": "2025-10-18T10:30:00.000Z"
    }
  ]
}
```

---

## Usage Examples

### 1. Fetch Dashboard Stats (React/TypeScript)

```typescript
import { useEffect, useState } from 'react';
import axios from 'axios';

interface DashboardStats {
  activeLearners: number;
  activeLearnersChange: number;
  totalCourses: number;
  totalCoursesChange: number;
  avgCompletionRate: number;
  avgCompletionRateChange: number;
  avgLearnerProgress: number;
  avgLearnerProgressChange: number;
}

function DashboardStatsComponent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await axios.get('http://localhost:3000/dashboard/stats');
      setStats(response.data);
    };
    fetchStats();
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="stats-grid">
      <StatCard
        title="Active Learners"
        value={stats.activeLearners}
        change={stats.activeLearnersChange}
        icon="users"
      />
      <StatCard
        title="Total Courses"
        value={stats.totalCourses}
        change={stats.totalCoursesChange}
        icon="book"
      />
      <StatCard
        title="Avg Completion Rate"
        value={`${stats.avgCompletionRate}%`}
        change={stats.avgCompletionRateChange}
        icon="check"
      />
      <StatCard
        title="Avg Learner Progress"
        value={`${stats.avgLearnerProgress}%`}
        change={stats.avgLearnerProgressChange}
        icon="chart"
      />
    </div>
  );
}
```

### 2. Enrollment Chart (Chart.js)

```javascript
import { Chart } from 'chart.js/auto';

async function renderEnrollmentChart() {
  const response = await fetch('http://localhost:3000/dashboard/enrollments?months=6');
  const data = await response.json();

  const ctx = document.getElementById('enrollmentChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.month),
      datasets: [{
        label: 'Enrollments',
        data: data.map(d => d.enrollments),
        backgroundColor: '#8B5CF6',
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}
```

### 3. Active Learners Leaderboard (Vue.js)

```vue
<template>
  <div class="leaderboard">
    <h2>Most Active Learners</h2>
    <div v-for="learner in activeLearners" :key="learner.id" class="learner-card">
      <div class="rank">{{ learner.rank }}</div>
      <div class="avatar">{{ learner.initials }}</div>
      <div class="details">
        <h3>{{ learner.name }}</h3>
        <p>{{ learner.completedCourses }} Completed • {{ learner.timeSpent }}</p>
      </div>
      <div class="performance">{{ learner.weeklyPerformance }}%</div>
      <div class="progress-bar">
        <div class="progress" :style="{ width: learner.weeklyPerformance + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      activeLearners: []
    };
  },
  async mounted() {
    const response = await fetch('http://localhost:3000/dashboard/active-learners?limit=5');
    this.activeLearners = await response.json();
  }
};
</script>
```

### 4. Complete Dashboard (Single API Call)

```javascript
async function loadDashboard() {
  try {
    const response = await fetch('http://localhost:3000/dashboard/complete');
    const dashboard = await response.json();

    // Update all dashboard sections with one call
    updateStats(dashboard.stats);
    renderEnrollmentChart(dashboard.recentEnrollments);
    displayActiveLearners(dashboard.mostActiveLearners);
    displayTopCourses(dashboard.topPerformingCourses);
    displayNewCourses(dashboard.newCourses);
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}
```

### 5. Using cURL

```bash
# Get dashboard stats
curl http://localhost:3000/dashboard/stats

# Get enrollments for last 12 months
curl http://localhost:3000/dashboard/enrollments?months=12

# Get top 10 active learners
curl http://localhost:3000/dashboard/active-learners?limit=10

# Get top 5 performing courses
curl http://localhost:3000/dashboard/top-courses?limit=5

# Get recent courses
curl http://localhost:3000/dashboard/new-courses?limit=5

# Get complete dashboard (all data)
curl http://localhost:3000/dashboard/complete
```

---

## Calculation Formulas

### Active Learners
```
Active Learners = Count of employees where:
  - isActive = true
  - lastLoggedIn >= first day of current month
```

### Active Learners Change
```
Change % = ((Current Month - Last Month) / Last Month) * 100
```

### Completion Rate
```
Completion Rate = (Sum of all progressPercentage / Total Progress Records) * 100
```

### Course Completion Rate
```
Course Completion Rate = (Completed Count / Enrolled Count) * 100
```

### Weekly Performance (for learners)
```
Weekly Performance = Average of progressPercentage across all their courses
```

---

## Performance Optimization Tips

### 1. Use the Complete Dashboard Endpoint
Instead of making 5 separate API calls, use `/dashboard/complete` to get all data in one request:

**Bad (5 API calls):**
```javascript
Promise.all([
  fetch('/dashboard/stats'),
  fetch('/dashboard/enrollments'),
  fetch('/dashboard/active-learners'),
  fetch('/dashboard/top-courses'),
  fetch('/dashboard/new-courses')
]);
```

**Good (1 API call):**
```javascript
fetch('/dashboard/complete');
```

### 2. Implement Caching
Cache dashboard data for 5-10 minutes to reduce database load:

```javascript
// React Query example
const { data } = useQuery('dashboard', fetchDashboard, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000  // 10 minutes
});
```

### 3. Add Database Indexes
Ensure these indexes exist for optimal performance:

```javascript
// MongoDB indexes
db.employmentdocuments.createIndex({ isActive: 1, lastLoggedIn: -1 });
db.userprogresses.createIndex({ employmentId: 1, courseId: 1 });
db.userprogresses.createIndex({ isCourseCompleted: 1 });
db.courses.createIndex({ isActive: 1, createdAt: -1 });
db.quizattempts.createIndex({ employmentId: 1, quizId: 1 });
```

### 4. Pagination for Large Datasets
For organizations with many learners/courses, use pagination:

```javascript
// Get top 100 learners instead of all
fetch('/dashboard/active-learners?limit=100');
```

---

## Real-time Updates

### Using WebSockets (Socket.io)

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

// Listen for dashboard updates
socket.on('dashboard:stats-updated', (stats) => {
  updateDashboardStats(stats);
});

socket.on('dashboard:new-enrollment', (data) => {
  incrementEnrollmentCount(data);
});
```

### Polling Strategy

```javascript
// Update dashboard every 30 seconds
setInterval(async () => {
  const stats = await fetch('/dashboard/stats').then(r => r.json());
  updateDashboard(stats);
}, 30000);
```

---

## Data Export

### Export to CSV

```javascript
async function exportDashboardToCSV() {
  const response = await fetch('/dashboard/complete');
  const data = await response.json();
  
  // Convert to CSV
  const csv = convertToCSV(data);
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dashboard-${new Date().toISOString()}.csv`;
  a.click();
}
```

### Export to PDF (using jsPDF)

```javascript
import jsPDF from 'jspdf';

async function exportDashboardToPDF() {
  const response = await fetch('/dashboard/complete');
  const data = await response.json();
  
  const doc = new jsPDF();
  
  doc.text('Dashboard Report', 20, 20);
  doc.text(`Active Learners: ${data.stats.activeLearners}`, 20, 40);
  doc.text(`Total Courses: ${data.stats.totalCourses}`, 20, 50);
  doc.text(`Avg Completion: ${data.stats.avgCompletionRate}%`, 20, 60);
  
  doc.save('dashboard-report.pdf');
}
```

---

## Error Handling

```typescript
async function fetchDashboard() {
  try {
    const response = await fetch('/dashboard/complete');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    
    // Show fallback UI or cached data
    showErrorMessage('Unable to load dashboard. Please try again.');
    
    // Return cached data if available
    return getCachedDashboard();
  }
}
```

---

## Filtering by User/Admin

All endpoints support filtering by `userId` to show data for specific admins/users:

```javascript
// Get dashboard for specific user
const userId = '657e902c4b628d1f0fc8f09d';

// Individual endpoints
fetch(`/dashboard/stats?userId=${userId}`);
fetch(`/dashboard/enrollments?userId=${userId}`);
fetch(`/dashboard/active-learners?userId=${userId}`);

// Complete dashboard
fetch(`/dashboard/complete?userId=${userId}`);
```

---

## Testing

### Unit Tests Example (Jest)

```typescript
describe('DashboardService', () => {
  it('should return dashboard stats', async () => {
    const stats = await dashboardService.getDashboardStats();
    
    expect(stats).toHaveProperty('activeLearners');
    expect(stats).toHaveProperty('totalCourses');
    expect(stats.activeLearners).toBeGreaterThanOrEqual(0);
    expect(stats.totalCourses).toBeGreaterThanOrEqual(0);
  });

  it('should return enrollment data for specified months', async () => {
    const enrollments = await dashboardService.getRecentEnrollments(null, 6);
    
    expect(enrollments).toBeInstanceOf(Array);
    expect(enrollments.length).toBeLessThanOrEqual(6);
    enrollments.forEach(item => {
      expect(item).toHaveProperty('month');
      expect(item).toHaveProperty('enrollments');
    });
  });
});
```

---

## Swagger/OpenAPI Documentation

Access interactive API documentation at:
```
http://localhost:3000/api-docs
```

Look for the "Dashboard" section to test all endpoints interactively.

---

## Support & Troubleshooting

### Common Issues

**Issue: Stats showing 0**
- Ensure employees have `lastLoggedIn` dates set
- Check if courses are marked as `isActive: true`

**Issue: Slow response times**
- Add database indexes (see Performance section)
- Use the complete dashboard endpoint instead of multiple calls
- Implement caching

**Issue: Incorrect percentages**
- Verify `progressPercentage` is being updated correctly
- Check that `isCourseCompleted` flag is set when courses finish

---

## Related Documentation

- **Employee APIs**: `EMPLOYEE_APIS_QUICK_REFERENCE.md`
- **Course Tracking**: `EMPLOYEE_COURSE_TRACKING_API.md`
- **Employment Feature**: `EMPLOYMENT_FEATURE.md`

