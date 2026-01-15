# Inbox Feature Setup Guide

## Overview

This guide explains how to set up and test the complete inbox notification system, including email sending via Resend, admin message broadcasting, and the welcome prompt.

## Database Setup

### 1. Create Inbox Messages Table

Run the following SQL command in your MySQL database:

```sql
CREATE TABLE IF NOT EXISTS inbox_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('welcome', 'feature', 'notification', 'update') DEFAULT 'notification',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  icon VARCHAR(10),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES felhasznalok(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

Or use the provided SQL migration file: `DATABASE_INBOX_MIGRATION.sql`

## Environment Setup

Make sure your `.env.local` file has these variables:

```
NEXT_PUBLIC_BASE_URL=http://localhost:3000 (or your production URL)
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev (or your domain email)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=penzugyi_rendszer
```

## Features Implemented

### 1. **Welcome Email on Registration**
- Automatically sends a welcome email to new users
- Includes usage instructions and legal information
- Uses Resend for reliable email delivery

**File:** `src/app/api/auth/register/route.ts`

### 2. **Inbox Component**
- Shows notifications and messages to users
- Displays unread count badge
- Positioned next to the user profile button in the bottom-right corner
- Syncs with server via API

**Files:**
- `src/components/InboxDropdown.tsx`
- `src/context/InboxContext.tsx`

### 3. **Welcome Prompt (First Login)**
- Simple, clean popup showing:
  1. Greeting message
  2. 2-line description of the app
  3. "Check emails" message pointing to inbox
  4. CTA button

**File:** `src/components/WelcomePrompt.tsx`

### 4. **Admin Message Broadcasting**
- Admins can send messages to all users' inboxes
- Access from Admin Panel → "Üzenet Küldése Összes Felhasználónak"
- Message types: notification, update, feature, welcome
- Optional custom emoji/icon

**File:** `src/app/admin/page.tsx`

### 5. **Inbox API Endpoints**

#### GET `/api/inbox/messages`
Fetch user's inbox messages
```bash
curl -X GET http://localhost:3000/api/inbox/messages \
  --cookie "auth_token=YOUR_TOKEN"
```

Response:
```json
{
  "messages": [
    {
      "id": 1,
      "type": "notification",
      "title": "Message Title",
      "message": "Message content",
      "icon": "📢",
      "read": false,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "success": true
}
```

#### PUT `/api/inbox/messages`
Update message status (mark as read, delete, etc.)
```bash
# Mark as read
curl -X PUT http://localhost:3000/api/inbox/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{"messageId": 1, "action": "mark-read"}'

# Delete message
curl -X PUT http://localhost:3000/api/inbox/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{"messageId": 1, "action": "delete"}'

# Mark all as read
curl -X PUT http://localhost:3000/api/inbox/messages \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=YOUR_TOKEN" \
  -d '{"action": "mark-all-read"}'
```

#### POST `/api/inbox/broadcast`
Send message to all users (Admin only)
```bash
curl -X POST http://localhost:3000/api/inbox/broadcast \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=ADMIN_TOKEN" \
  -d '{
    "type": "update",
    "title": "New Feature Released",
    "message": "We've added expense categorization!",
    "icon": "✨"
  }'
```

Response:
```json
{
  "success": true,
  "count": 42,
  "message": "Üzenet sikeresen elküldve 42 felhasználónak!"
}
```

## Testing Guide

### Test 1: Registration and Welcome Email

1. Register a new user
2. Check inbox for the registration verification email
3. Once verified, you should also receive the welcome email
4. Welcome email should contain:
   - Greeting
   - App description
   - Feature list
   - Security information
   - Legal disclaimers

**Test Email:** Use `botondklics0129@gmail.com` or your Resend test email

### Test 2: Welcome Prompt

1. Log out and log back in with the newly registered user
2. A popup should appear with:
   - Greeting message (Üdvözöllek!)
   - 2-line description of the app
   - Message about checking emails
   - "Kezdjünk! 🚀" button

3. Click the button to close the popup
4. Check the inbox (📬 button in bottom-right)

### Test 3: Inbox Functionality

1. Check the inbox button (📬) shows unread count
2. Click the button to open dropdown
3. Click on a message to mark it as read
4. Delete messages with the ✕ button
5. Use "Mindent olvasottnak jelöl" button to mark all as read

### Test 4: Admin Broadcasting

1. Log in as an admin user
2. Navigate to Admin Panel
3. Go to "📢 Üzenet Küldése Összes Felhasználónak" section
4. Fill in:
   - Type: Select message type
   - Icon: Optional emoji (e.g., ✨, 🎉, 📢)
   - Title: Message title
   - Message: Message content
5. Click "📢 Üzenet Küldése" button
6. Should see success message with count of recipients
7. All users should see the message in their inbox immediately

### Test 5: Message Auto-Refresh

1. Have two browser windows open (same user)
2. In one window, send a broadcast message as admin
3. In the other window, the inbox should refresh within 30 seconds
4. New message should appear automatically

## CSS Styling Notes

The inbox component uses CSS modules for scoped styling:
- `InboxDropdown.module.css` - Inbox dropdown styling
- `UserIcon.module.css` - User icon and actions positioning
- `admin.module.css` - Admin panel and broadcast form styling

The dropdown is positioned above the user button in the bottom-right corner with:
- Position: absolute
- Bottom: 100% (above)
- Right-aligned with parent
- Maximum height: 500px
- Scrollable messages

## Troubleshooting

### Inbox Button Not Showing
- Check if user is logged in (button only shows for authenticated users)
- Verify InboxProvider is in layout.tsx
- Check browser console for errors

### Welcome Email Not Sending
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for failed email logs
- Ensure `RESEND_FROM_EMAIL` is configured
- Check server logs for errors

### Messages Not Appearing in Inbox
- Verify database connection and table exists
- Check if user is authenticated (has valid token)
- Ensure API endpoint `/api/inbox/messages` is reachable
- Check browser network tab for failed requests

### Admin Broadcast Not Working
- Verify user has `szerep = 'admin'`
- Check database for inbox_messages records
- Verify all users are in the system
- Check server logs for errors

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── inbox/
│   │       ├── messages/
│   │       │   └── route.ts          # GET/PUT inbox messages
│   │       └── broadcast/
│   │           └── route.ts          # POST broadcast messages
│   ├── admin/
│   │   ├── page.tsx                  # Admin panel with broadcast form
│   │   └── admin.module.css          # Admin styles
│   ├── auth/
│   │   ├── register/
│   │   │   └── route.ts              # Registration with welcome email
│   ├── globals.css
│   └── layout.tsx                    # InboxProvider wrapper
├── components/
│   ├── InboxDropdown.tsx             # Inbox UI component
│   ├── InboxDropdown.module.css      # Inbox styles
│   ├── UserIcon.tsx                  # User button + inbox wrapper
│   ├── UserIcon.module.css           # User icon styles
│   └── WelcomePrompt.tsx             # First login popup
├── context/
│   └── InboxContext.tsx              # Inbox state management
└── lib/
    ├── email.ts                      # Email templates (welcome, etc.)
    └── db.ts                         # Database connection

DATABASE_INBOX_MIGRATION.sql           # SQL migration file
INBOX_SETUP_GUIDE.md                   # This file
```

## API Error Codes

- `401` - Not authenticated (missing or invalid token)
- `403` - Not authorized (trying to broadcast as non-admin)
- `400` - Bad request (missing required fields)
- `404` - User not found
- `500` - Server error

## Performance Notes

- Inbox messages refresh every 30 seconds automatically
- Maximum 100 messages fetched per request (configurable)
- Messages are indexed by user_id and created_at for fast queries
- Unread count is calculated client-side to reduce server load

## Security Considerations

- All API endpoints require authentication
- Broadcast endpoint checks admin role
- Messages are filtered by user_id (can't see other users' messages)
- Email tokens expire after 24 hours
- Passwords are hashed with bcryptjs

---

For issues or questions, check the troubleshooting section or review the server logs.
