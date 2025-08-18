# Email Setup for Course Assignment Notifications

## Overview
The LMS system now supports sending email notifications to group members when courses are assigned to their groups.

## Required Environment Variables

Add the following environment variables to your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

## API Usage

### Assign Course to Group
```http
POST /groups/{groupId}/assign-course
Content-Type: application/json

{
  "courseId": "course-id-here",
  "sendEmailNotifications": true
}
```

### Response
```json
{
  "message": "Course assigned to group successfully",
  "group": {
    "_id": "group-id",
    "name": "Group Name",
    "courses": ["course-id-here"]
  },
  "course": {
    "id": "course-id",
    "title": "Course Title",
    "description": "Course Description"
  },
  "emailsSent": "Yes"
}
```

## Features

- ✅ Assigns course to group
- ✅ Sends email notifications to all group members
- ✅ Prevents duplicate course assignments
- ✅ Graceful error handling for email failures
- ✅ Configurable email notifications (can be disabled)

## Email Template

The system sends a professional HTML email with:
- Personalized greeting with user's name
- Course and group details
- Call-to-action to access the course
- Professional styling

## Error Handling

- If email sending fails, the course assignment still succeeds
- Email errors are logged but don't break the assignment process
- Users without email addresses are automatically filtered out
