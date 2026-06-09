# MGate HRMS — API Contract

> **Base URL:** `https://api.mgate-hrms.com/api/v1`
> **Auth:** All endpoints require `Authorization: Bearer <token>` header (except `/auth/*`)
> **Content-Type:** `application/json` unless noted as `multipart/form-data`
> **Response envelope:**
> ```json
> { "success": true, "data": { ... } }
> { "success": false, "message": "Error description" }
> ```

---

## 1. Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Get current user |

### POST `/auth/login`
**Request:**
```json
{ "email": "superadmin@mgatesystems.com", "password": "secret123" }
```
**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Super Admin",
    "email": "superadmin@mgatesystems.com",
    "role": "SUPER_ADMIN",
    "status": "Active",
    "dept": "Management",
    "phone": "+91 98765 00001",
    "joined": "2020-01-01",
    "lastLogin": "2026-06-09T09:14:00Z"
  }
}
```

### GET `/auth/me`
**Response:**
```json
{
  "id": 1,
  "name": "Super Admin",
  "email": "superadmin@mgatesystems.com",
  "role": "SUPER_ADMIN",
  "status": "Active"
}
```

---

## 2. User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/superadmin/users` | List all users |
| POST | `/superadmin/users` | Create user |
| PUT | `/superadmin/users/:id` | Update user |
| DELETE | `/superadmin/users/:id` | Delete user |
| PATCH | `/superadmin/users/:id/toggle-status` | Suspend / Activate |
| PATCH | `/superadmin/users/:id/role` | Change role |
| POST | `/superadmin/users/:id/reset-password` | Send password reset email |
| GET | `/superadmin/users/:id/activity` | Get user activity log |

### GET `/superadmin/users`
**Query params:** `search` `role` `status` `page` `limit`

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Super Admin",
      "email": "superadmin@mgatesystems.com",
      "role": "SUPER_ADMIN",
      "status": "Active",
      "dept": "Management",
      "phone": "+91 98765 00001",
      "joined": "2020-01-01",
      "lastLogin": "2026-06-09T09:14:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

### POST `/superadmin/users`
**Request:**
```json
{
  "name": "Kavitha R",
  "email": "kavitha@mgatesystems.com",
  "role": "HR",
  "password": "Temp@1234",
  "dept": "HR",
  "phone": "+91 98765 00012"
}
```
**Response:** Created user object (same shape as list item)

### PUT `/superadmin/users/:id`
**Request:** Any subset of user fields (name, email, dept, phone)

### PATCH `/superadmin/users/:id/toggle-status`
**Response:**
```json
{ "id": 1, "status": "Suspended" }
```

### PATCH `/superadmin/users/:id/role`
**Request:**
```json
{ "role": "ADMIN" }
```
**Allowed roles:** `SUPER_ADMIN` `ADMIN` `HR` `MANAGER` `FINANCE` `IT_ADMIN` `EMPLOYEE`

### GET `/superadmin/users/:id/activity`
**Response:**
```json
{
  "activities": [
    { "action": "Logged in", "time": "2026-06-09T09:14:00Z", "ip": "203.0.113.12" },
    { "action": "Updated role permissions", "time": "2026-06-09T08:10:00Z", "ip": "203.0.113.12" }
  ]
}
```

---

## 3. Audit Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/superadmin/audit-logs` | List logs with filters |
| GET | `/superadmin/audit-logs/stats` | Summary counts |
| GET | `/superadmin/audit-logs/export` | Export as CSV (file download) |

### GET `/superadmin/audit-logs`
**Query params:** `module` `severity` `actor` `dateRange` (Today/This Week/This Month/All Time) `search` `page` `limit`

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "ts": "2026-06-09T09:14:00Z",
      "actor": "superadmin@mgatesystems.com",
      "action": "Login failed — 3 attempts",
      "module": "Security",
      "ip": "203.0.113.12",
      "sev": "Critical",
      "detail": { "event": "brute_force", "attempts": 3, "blocked": true }
    }
  ],
  "total": 248,
  "page": 1,
  "limit": 20
}
```
**Allowed `module` values:** `Security` `System` `User Actions`
**Allowed `sev` values:** `Critical` `Warning` `Info`

### GET `/superadmin/audit-logs/stats`
**Response:**
```json
{
  "total": 248,
  "security": 6,
  "system": 8,
  "userActions": 6
}
```

### GET `/superadmin/audit-logs/export`
**Query params:** same as list endpoint
**Response:** `Content-Type: text/csv` — file download

---

## 4. Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notifications` | List notifications |
| GET | `/notifications/unread-count` | Unread badge count |
| PATCH | `/notifications/:id/read` | Mark one as read |
| PATCH | `/notifications/read-all` | Mark all as read |
| DELETE | `/notifications/:id` | Delete one |
| DELETE | `/notifications/clear-read` | Delete all read |

### GET `/notifications`
**Query params:** `category` `unreadOnly` (boolean) `search` `page` `limit`

**Response:**
```json
{
  "notifications": [
    {
      "id": 1,
      "category": "Security",
      "title": "Failed login attempt detected",
      "body": "3 consecutive failed login attempts from IP 203.0.113.12.",
      "time": "2026-06-09T09:12:00Z",
      "read": false,
      "severity": "critical"
    }
  ],
  "total": 12,
  "unreadCount": 4
}
```
**Allowed `category` values:** `HR` `Payroll` `Security` `System` `Assets` `Leave` `Document`
**Allowed `severity` values:** `critical` `warning` `info`

### GET `/notifications/unread-count`
**Response:**
```json
{ "unreadCount": 4 }
```

---

## 5. Security Center

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/superadmin/security/settings` | Get all security settings |
| PUT | `/superadmin/security/settings` | Save all security settings |
| GET | `/superadmin/security/stats` | Live security stats |
| GET | `/superadmin/security/sessions` | Active sessions |
| DELETE | `/superadmin/security/sessions/:id` | Force logout one session |
| DELETE | `/superadmin/security/sessions` | Force logout all sessions |
| POST | `/superadmin/security/ip-whitelist` | Add IP |
| DELETE | `/superadmin/security/ip-whitelist` | Remove IP |

### GET `/superadmin/security/settings`
**Response:**
```json
{
  "mfaEnabled": true,
  "passwordMinLength": "10",
  "complexityUppercase": true,
  "complexityLowercase": true,
  "complexityNumbers": true,
  "complexitySymbols": false,
  "loginAttemptLimit": "5",
  "sessionTimeout": "30",
  "singleSession": false,
  "rememberDevice": "14",
  "whitelistEnabled": true,
  "ipList": ["10.0.1.0/24", "203.0.113.12", "198.51.100.5"],
  "logRetention": "90",
  "autoExport": false,
  "siemIntegration": false
}
```

### PUT `/superadmin/security/settings`
**Request:** Any subset of the settings object above

### GET `/superadmin/security/stats`
**Response:**
```json
{
  "activeSessions": 8,
  "failedLoginsToday": 3,
  "mfaEnabled": 5,
  "mfaTotal": 12,
  "securityScore": 74
}
```

### GET `/superadmin/security/sessions`
**Response:**
```json
{
  "sessions": [
    {
      "id": "sess_abc123",
      "userId": 1,
      "userName": "Super Admin",
      "ip": "203.0.113.12",
      "device": "Chrome / macOS",
      "location": "Chennai, India",
      "loginAt": "2026-06-09T08:00:00Z",
      "lastActive": "2026-06-09T09:30:00Z"
    }
  ]
}
```

### POST `/superadmin/security/ip-whitelist`
**Request:** `{ "ip": "192.168.1.0/24" }`

### DELETE `/superadmin/security/ip-whitelist`
**Request body:** `{ "ip": "192.168.1.0/24" }`

---

## 6. Company Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/superadmin/company/settings` | Get full company config |
| PUT | `/superadmin/company/settings` | Save company profile + branding + regional |
| POST | `/superadmin/company/logo` | Upload logo image |
| POST | `/superadmin/company/favicon` | Upload favicon image |
| GET | `/superadmin/company/email-templates` | List email templates |
| PUT | `/superadmin/company/email-templates/:id` | Update an email template |
| GET | `/superadmin/company/notification-settings` | Get notification toggles |
| PUT | `/superadmin/company/notification-settings` | Save notification toggles |

### GET `/superadmin/company/settings`
**Response:**
```json
{
  "profile": {
    "name": "MGate Systems",
    "legalName": "MGate Systems Pvt. Ltd.",
    "gstin": "29ABCDE1234F1Z5",
    "pan": "ABCDE1234F",
    "cin": "U72900KA2020PTC123456",
    "email": "contact@mgatesystems.com",
    "phone": "+91 98765 43210",
    "website": "www.mgatesystems.com",
    "address": "123, Tech Park, Whitefield",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560066",
    "country": "India",
    "industry": "Information Technology",
    "employees": "50-200",
    "founded": "2020",
    "timezone": "Asia/Kolkata",
    "currency": "INR",
    "dateFormat": "DD/MM/YYYY",
    "fiscalYear": "April - March"
  },
  "branding": {
    "primaryColor": "#2563eb",
    "accentColor": "#7c3aed",
    "logoUrl": "https://cdn.mgate.com/logo.png",
    "faviconUrl": "https://cdn.mgate.com/favicon.ico",
    "emailHeader": "MGate HRMS",
    "tagline": "Empowering People. Enabling Growth.",
    "footerText": "© 2026 MGate Systems Pvt. Ltd. All rights reserved."
  }
}
```

### POST `/superadmin/company/logo`
**Content-Type:** `multipart/form-data`
**Field:** `file` (image/*)
**Response:**
```json
{ "logoUrl": "https://cdn.mgate.com/logo-new.png" }
```

### GET `/superadmin/company/email-templates`
**Response:**
```json
{
  "templates": [
    {
      "id": "welcome",
      "label": "Welcome Email",
      "subject": "Welcome to MGate HRMS!",
      "body": "Dear {{employee_name}}, Welcome aboard! Your account has been created."
    }
  ]
}
```

### PUT `/superadmin/company/email-templates/:id`
**Request:**
```json
{
  "subject": "Welcome to MGate HRMS!",
  "body": "Dear {{employee_name}}, Welcome aboard!"
}
```

### GET `/superadmin/company/notification-settings`
**Response:**
```json
{
  "notifications": [
    {
      "id": "leave_apply",
      "label": "Leave Applied",
      "channel": "In-App + Email",
      "trigger": "When employee applies leave",
      "active": true
    }
  ]
}
```

### PUT `/superadmin/company/notification-settings`
**Request:**
```json
{
  "notifications": [
    { "id": "leave_apply", "active": true },
    { "id": "birthday",    "active": false }
  ]
}
```

---

## 7. Multi-Company / Tenants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/superadmin/companies` | List all tenants |
| GET | `/superadmin/companies/:id` | Get single tenant |
| POST | `/superadmin/companies` | Create tenant |
| PUT | `/superadmin/companies/:id` | Update tenant |
| DELETE | `/superadmin/companies/:id` | Delete tenant |
| PATCH | `/superadmin/companies/:id/status` | Change status |

### GET `/superadmin/companies`
**Query params:** `search` `status` `plan`

**Response:**
```json
{
  "companies": [
    {
      "id": 1,
      "name": "MGate Systems",
      "industry": "Technology",
      "plan": "Enterprise",
      "employees": 13,
      "status": "Active",
      "city": "Chennai",
      "country": "India",
      "admin": "Super Admin",
      "adminEmail": "superadmin@mgatesystems.com",
      "created": "2024-01-15",
      "monthlyCost": 45000
    }
  ],
  "total": 4
}
```
**Allowed `plan` values:** `Starter` `Pro` `Enterprise`
**Allowed `status` values:** `Active` `Trial` `Suspended`

### POST `/superadmin/companies`
**Request:**
```json
{
  "name": "SynEx Systems",
  "industry": "Consulting",
  "plan": "Starter",
  "city": "Hyderabad",
  "country": "India",
  "adminName": "Rajan M",
  "adminEmail": "rajan@synex.com",
  "adminPassword": "Temp@1234"
}
```

### PATCH `/superadmin/companies/:id/status`
**Request:** `{ "status": "Suspended" }`

---

## 8. Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/superadmin/billing/plan` | Current plan details |
| GET | `/superadmin/billing/invoices` | Invoice history |
| GET | `/superadmin/billing/invoice/:id/download` | Download invoice PDF |
| GET | `/superadmin/billing/usage` | Current usage vs limits |
| POST | `/superadmin/billing/payment-method` | Add payment method |
| POST | `/superadmin/billing/upgrade` | Upgrade plan |

### GET `/superadmin/billing/plan`
**Response:**
```json
{
  "plan": "Enterprise",
  "status": "Active",
  "billingCycle": "Monthly",
  "amount": 45000,
  "currency": "INR",
  "nextBillingDate": "2026-07-01",
  "features": ["Unlimited employees", "Advanced analytics", "Priority support", "Custom branding"]
}
```

### GET `/superadmin/billing/invoices`
**Response:**
```json
{
  "invoices": [
    {
      "id": "INV-2026-005",
      "date": "2026-06-01",
      "amount": 45000,
      "currency": "INR",
      "status": "Paid",
      "plan": "Enterprise",
      "downloadUrl": "/superadmin/billing/invoice/INV-2026-005/download"
    }
  ]
}
```
**Allowed `status` values:** `Paid` `Pending` `Failed`

### GET `/superadmin/billing/usage`
**Response:**
```json
{
  "employees":  { "used": 13,   "limit": 200,   "unit": "users"  },
  "storage":    { "used": 2.3,  "limit": 50,    "unit": "GB"     },
  "apiCalls":   { "used": 8420, "limit": 100000,"unit": "calls/month" }
}
```

### POST `/superadmin/billing/payment-method`
**Request:**
```json
{
  "type": "card",
  "cardLast4": "4242",
  "cardBrand": "Visa",
  "expiry": "12/28",
  "holderName": "Super Admin"
}
```

### POST `/superadmin/billing/upgrade`
**Request:** `{ "plan": "Enterprise" }`

---

## 9. Integrations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/superadmin/integrations` | List all integrations |
| GET | `/superadmin/integrations/:id/status` | Check connection status |
| POST | `/superadmin/integrations/:id/connect` | Connect integration |
| POST | `/superadmin/integrations/:id/test` | Test connection |
| DELETE | `/superadmin/integrations/:id` | Disconnect integration |

### GET `/superadmin/integrations`
**Response:**
```json
{
  "integrations": [
    {
      "id": "slack",
      "name": "Slack",
      "category": "Communication",
      "description": "Send notifications and alerts to Slack channels",
      "connected": true,
      "lastSync": "2026-06-09T08:30:00Z",
      "iconUrl": "https://cdn.mgate.com/integrations/slack.png"
    }
  ]
}
```
**Allowed `category` values:** `Communication` `HR` `Productivity` `Security`

### POST `/superadmin/integrations/:id/connect`
**Request:**
```json
{ "apiKey": "xoxb-...", "webhookUrl": "https://hooks.slack.com/..." }
```
**Response:**
```json
{ "id": "slack", "connected": true, "lastSync": "2026-06-09T09:00:00Z" }
```

### GET `/superadmin/integrations/:id/status`
**Response:**
```json
{ "id": "slack", "connected": true, "lastSync": "2026-06-09T09:00:00Z", "error": null }
```

---

## Error Codes

| HTTP | Meaning |
|------|---------|
| 400 | Bad request — validation error, message explains which field |
| 401 | Unauthorized — invalid or expired token |
| 403 | Forbidden — role not permitted for this endpoint |
| 404 | Resource not found |
| 409 | Conflict — e.g. email already exists |
| 422 | Unprocessable — business rule violation |
| 500 | Internal server error |

---

## Summary — Total Endpoints

| Module | Count |
|--------|-------|
| Auth | 3 |
| User Management | 8 |
| Audit Logs | 3 |
| Notifications | 6 |
| Security Center | 8 |
| Company Settings | 8 |
| Multi-Company | 6 |
| Billing | 6 |
| Integrations | 5 |
| **Total** | **53** |
