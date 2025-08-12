# LifeConnect Admin API Documentation

## Base URL
All API endpoints are prefixed with `/api`

## Authentication
Most endpoints require admin authentication via `AdminGuard`. The login endpoint is used to obtain authentication credentials.

---

## Authentication Endpoints

### Admin Login
**POST** `/api/login`

Authenticates an admin user and returns login credentials.

#### Request Body
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "admin": {
      "id": 1,
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "token": "jwt_token_here"
  }
}
```

---

## Admin Management

### Bootstrap Admin
**POST** `/api/bootstrap-admin`

Creates the first admin account (no authentication required).

#### Request Body
```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "securePassword123",
  "phoneNumber": "+1234567890"
}
```

#### Response
```json
{
  "success": true,
  "message": "Bootstrap admin created successfully",
  "data": {
    "id": 1,
    "name": "Admin Name",
    "email": "admin@example.com",
    "phoneNumber": "+1234567890"
  }
}
```

### Create Admin
**POST** `/api/admins`
🔒 *Requires Admin Authentication*

Creates a new admin account.

#### Request Body
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "securePassword123",
  "phoneNumber": "+1234567890"
}
```

#### Response
```json
{
  "success": true,
  "message": "Admin created successfully",
  "data": {
    "id": 2,
    "name": "New Admin",
    "email": "newadmin@example.com",
    "phoneNumber": "+1234567890"
  }
}
```

---

## User Management

### Get All Users
**GET** `/api/users`
🔒 *Requires Admin Authentication*

Retrieves a list of all users (Donors and Managers).

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "bloodType": "O+",
      "userType": "donor",
      "roleId": 1,
      "isActive": true,
      "isVerified": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create User
**POST** `/api/users`
🔒 *Requires Admin Authentication*

Creates a new user account.

#### Request Body
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "bloodType": "A+",
  "userType": "donor",
  "roleId": 1
}
```

#### Response
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phoneNumber": "+1234567890",
    "bloodType": "A+",
    "userType": "donor",
    "roleId": 1
  }
}
```

### Delete User
**DELETE** `/api/users/:id`
🔒 *Requires Admin Authentication*

Deletes a user account by ID.

#### Path Parameters
- `id` (number): User ID to delete

#### Response
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Role Management

### Get All Roles
**GET** `/api/roles`
🔒 *Requires Admin Authentication*

Retrieves a list of all available roles.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Donor",
      "description": "Blood donor role",
      "permissions": ["donate_blood", "view_profile"]
    },
    {
      "id": 2,
      "name": "Manager",
      "description": "Blood bank manager role",
      "permissions": ["manage_requests", "view_donations"]
    }
  ]
}
```

### Update User Role
**PATCH** `/api/users/:id/role`
🔒 *Requires Admin Authentication*

Updates a user's role.

#### Path Parameters
- `id` (number): User ID to update

#### Request Body
```json
{
  "roleId": 2
}
```

#### Response
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "roleId": 2
  }
}
```

---

## Reports

### Donation Reports
**GET** `/api/reports/donations`
🔒 *Requires Admin Authentication*

Generates a report on donation statistics.

#### Response
```json
{
  "success": true,
  "data": {
    "totalDonations": 150,
    "monthlyDonations": 25,
    "donationsByBloodType": {
      "O+": 45,
      "A+": 30,
      "B+": 25,
      "AB+": 15,
      "O-": 20,
      "A-": 10,
      "B-": 3,
      "AB-": 2
    },
    "topDonors": [
      {
        "id": 1,
        "name": "John Doe",
        "donationCount": 5
      }
    ]
  }
}
```

### Request Reports
**GET** `/api/reports/requests`
🔒 *Requires Admin Authentication*

Generates a report on blood request statistics.

#### Response
```json
{
  "success": true,
  "data": {
    "totalRequests": 75,
    "pendingRequests": 12,
    "fulfilledRequests": 58,
    "cancelledRequests": 5,
    "requestsByBloodType": {
      "O+": 20,
      "A+": 15,
      "B+": 12,
      "AB+": 8,
      "O-": 10,
      "A-": 6,
      "B-": 3,
      "AB-": 1
    }
  }
}
```

---

## Alert Management

### Create Alert
**POST** `/api/alerts`
🔒 *Requires Admin Authentication*

Creates a new system-wide alert or notification.

#### Request Body
```json
{
  "title": "Blood Drive Event",
  "message": "Join us for a blood drive event this weekend at the community center.",
  "type": "info",
  "targetAudience": "all",
  "expiresAt": "2024-12-31T23:59:59.000Z",
  "priority": 1,
  "isSystemWide": true
}
```

#### Field Descriptions
- `type`: One of `"info"`, `"warning"`, `"error"`, `"success"` (default: `"info"`)
- `targetAudience`: One of `"all"`, `"donors"`, `"managers"`, `"admins"` (default: `"all"`)
- `priority`: Number 0-3, where 0 is lowest priority and 3 is highest (default: 0)
- `expiresAt`: ISO date string (optional)
- `isSystemWide`: Boolean (default: true)

#### Response
```json
{
  "success": true,
  "message": "Alert created successfully",
  "data": {
    "id": 1,
    "title": "Blood Drive Event",
    "message": "Join us for a blood drive event this weekend at the community center.",
    "type": "info",
    "targetAudience": "all",
    "priority": 1,
    "isSystemWide": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-12-31T23:59:59.000Z"
  }
}
```

### Get Active Alerts
**GET** `/api/alerts/active`
🔒 *Requires Admin Authentication*

Retrieves all active alerts.

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Blood Drive Event",
      "message": "Join us for a blood drive event this weekend.",
      "type": "info",
      "targetAudience": "all",
      "priority": 1,
      "isSystemWide": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-12-31T23:59:59.000Z"
    }
  ]
}
```

### Delete Alert
**DELETE** `/api/alerts/:id`
🔒 *Requires Admin Authentication*

Deletes a system-wide alert.

#### Path Parameters
- `id` (number): Alert ID to delete

#### Response
```json
{
  "success": true,
  "message": "Alert deleted successfully"
}
```

---

## Email Alert System

### Create Alert and Send Email
**POST** `/api/alerts/send-email`
🔒 *Requires Admin Authentication*

Creates an alert and immediately sends it via email to all users.

#### Request Body
```json
{
  "title": "Urgent: Blood Shortage Alert",
  "message": "We are experiencing a critical shortage of O- blood type. Please donate if you can.",
  "type": "warning",
  "targetAudience": "donors",
  "priority": 3,
  "sendEmail": true
}
```

#### Response
```json
{
  "success": true,
  "message": "Alert created and email process initiated",
  "data": {
    "alert": {
      "id": 2,
      "title": "Urgent: Blood Shortage Alert",
      "message": "We are experiencing a critical shortage of O- blood type.",
      "type": "warning",
      "targetAudience": "donors",
      "priority": 3
    },
    "emailResult": {
      "success": true,
      "sentCount": 45,
      "failedCount": 2,
      "message": "Emails sent successfully to 45 users, 2 failed"
    }
  }
}
```

### Send Existing Alert
**POST** `/api/alerts/:id/send-email`
🔒 *Requires Admin Authentication*

Sends an existing alert via email to all users.

#### Path Parameters
- `id` (number): Alert ID to send

#### Response
```json
{
  "success": true,
  "message": "Alert email sent successfully",
  "data": {
    "sentCount": 50,
    "failedCount": 1
  }
}
```

---

## Email System Testing

### Test Email Connection
**GET** `/api/mailer/test-connection`
🔒 *Requires Admin Authentication*

Tests the SMTP connection configuration.

#### Response
```json
{
  "success": true,
  "message": "SMTP connection successful",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Create Test User and Send Email
**POST** `/api/mailer/test-send`
🔒 *Requires Admin Authentication*

Creates a test user and sends a test email.

#### Request Body
```json
{
  "email": "test@example.com"
}
```

#### Response
```json
{
  "success": true,
  "message": "Test user created and email sent",
  "data": {
    "user": {
      "id": 99,
      "email": "test@example.com",
      "name": "Test User",
      "userType": "donor"
    },
    "emailResult": {
      "success": true,
      "message": "Test email sent successfully"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Error Responses

All endpoints may return the following error response format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)
- `500` - Internal Server Error

### Common Error Messages
- "User with this email already exists" (409)
- "Admin with this email already exists" (409)
- "User not found" (404)
- "Alert not found" (404)
- "Login failed" (401)
- "Failed to retrieve users" (500)
- "Failed to create user" (500)
- "Failed to delete user" (500)
- "Failed to update user role" (500)

---

## Request Headers

For authenticated endpoints, include the authorization header:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Rate Limiting
API requests may be subject to rate limiting. Check response headers for rate limit information.

## Validation Rules
- **Email**: Must be a valid email format
- **Password**: Required for user/admin creation
- **Phone Number**: Required for user creation, optional for admin creation
- **Role ID**: Must be a valid existing role ID
- **Alert Type**: Must be one of: `info`, `warning`, `error`, `success`
- **Target Audience**: Must be one of: `all`, `donors`, `managers`, `admins`
- **Priority**: Must be a number between 0-3
- **User Type**: Must be one of: `donor`, `manager`, `admin`