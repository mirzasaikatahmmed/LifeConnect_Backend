# LifeConnect Admin API Documentation

## Overview
This document provides comprehensive documentation for all Admin APIs in the LifeConnect blood donation management system. The admin APIs are divided into two controllers:
1. **AdminController** (`/api/*`) - Main admin functionality 
2. **AlertController** (`/admin/alerts/*`) - Advanced alert management

## Base URL
```
http://localhost:3007
```

## Authentication
All admin endpoints (except login and bootstrap-admin) require authentication using JWT Bearer tokens.

### Headers Required:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 1. Authentication Endpoints

### 1.1 Admin Login
**Endpoint:** `POST /api/login`  
**Description:** Authenticate admin user and get JWT token  
**Authentication:** Not required  

**Request Body:**
```json
{
  "email": "john.admin@lifeconnect.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 17,
    "email": "john.admin@lifeconnect.com",
    "name": "John Admin",
    "phoneNumber": "+1234567891",
    "bloodType": null,
    "userType": "admin",
    "role": {
      "id": 1,
      "name": "admin",
      "description": "System administrator with full access",
      "permissions": ["create", "read", "update", "delete", "manage_users", "manage_roles", "send_alerts", "view_reports"],
      "isActive": true,
      "createdAt": "2025-08-15T17:29:58.214Z",
      "updatedAt": "2025-08-15T17:29:58.214Z"
    },
    "roleId": 1,
    "isActive": true,
    "isVerified": true,
    "createdAt": "2025-08-15T17:29:58.242Z",
    "updatedAt": "2025-08-15T17:29:58.242Z"
  }
}
```

### 1.2 Bootstrap Admin
**Endpoint:** `POST /api/bootstrap-admin`  
**Description:** Create the first admin account (no authentication required)  
**Authentication:** Not required  

**Request Body:**
```json
{
  "name": "Super Admin",
  "email": "admin@lifeconnect.com",
  "password": "securepassword",
  "phoneNumber": "+1234567890",
  "userType": "admin",
  "roleId": 1
}
```

---

## 2. User Management Endpoints

### 2.1 Get All Users
**Endpoint:** `GET /api/users`  
**Description:** Retrieve all users (donors, managers, admins)  
**Authentication:** Required  

**Response:**
```json
[
  {
    "id": 17,
    "email": "john.admin@lifeconnect.com",
    "password": "$2b$10$...",
    "name": "John Admin",
    "phoneNumber": "+1234567891",
    "bloodType": null,
    "userType": "admin",
    "role": {
      "id": 1,
      "name": "admin",
      "description": "System administrator with full access",
      "permissions": ["create", "read", "update", "delete", "manage_users", "manage_roles", "send_alerts", "view_reports"],
      "isActive": true,
      "createdAt": "2025-08-15T17:29:58.214Z",
      "updatedAt": "2025-08-15T17:29:58.214Z"
    },
    "roleId": 1,
    "isActive": true,
    "isVerified": true,
    "createdAt": "2025-08-15T17:29:58.242Z",
    "updatedAt": "2025-08-15T17:29:58.242Z"
  }
]
```

### 2.2 Create User
**Endpoint:** `POST /api/users`  
**Description:** Create a new user account  
**Authentication:** Required  

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "bloodType": "O+",
  "userType": "donor",
  "roleId": 3
}
```

### 2.3 Create Admin
**Endpoint:** `POST /api/admins`  
**Description:** Create a new admin account  
**Authentication:** Required  

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "adminpass123",
  "phoneNumber": "+1234567890",
  "userType": "admin",
  "roleId": 1
}
```

### 2.4 Delete User
**Endpoint:** `DELETE /api/users/:id`  
**Description:** Delete a user account by ID  
**Authentication:** Required  

**Parameters:**
- `id` (path): User ID to delete

### 2.5 Update User Role
**Endpoint:** `PATCH /api/users/:id/role`  
**Description:** Update a user's role  
**Authentication:** Required  

**Parameters:**
- `id` (path): User ID

**Request Body:**
```json
{
  "roleId": 2
}
```

---

## 3. Role Management Endpoints

### 3.1 Get All Roles
**Endpoint:** `GET /api/roles`  
**Description:** Retrieve all available roles  
**Authentication:** Required  

**Response:**
```json
[
  {
    "id": 1,
    "name": "admin",
    "description": "System administrator with full access",
    "permissions": ["create", "read", "update", "delete", "manage_users", "manage_roles", "send_alerts", "view_reports"],
    "isActive": true,
    "createdAt": "2025-08-15T17:29:58.214Z",
    "updatedAt": "2025-08-15T17:29:58.214Z"
  },
  {
    "id": 2,
    "name": "manager",
    "description": "Blood bank manager with limited admin access",
    "permissions": ["create", "read", "update", "manage_requests", "view_donors"],
    "isActive": true,
    "createdAt": "2025-08-15T17:29:58.233Z",
    "updatedAt": "2025-08-15T17:29:58.233Z"
  },
  {
    "id": 3,
    "name": "donor",
    "description": "Blood donor with basic access",
    "permissions": ["read", "update_profile", "book_appointment"],
    "isActive": true,
    "createdAt": "2025-08-15T17:29:58.235Z",
    "updatedAt": "2025-08-15T17:29:58.235Z"
  }
]
```

### 3.2 Create Role
**Endpoint:** `POST /api/roles`  
**Description:** Create a new role  
**Authentication:** Required  

**Request Body:**
```json
{
  "name": "admin",
  "description": "Custom role description",
  "permissions": ["read", "write"]
}
```

---

## 4. Alert Management Endpoints (AdminController)

### 4.1 Create Alert
**Endpoint:** `POST /api/alerts`  
**Description:** Create a new system alert  
**Authentication:** Required  

**Request Body:**
```json
{
  "title": "Test Alert API",
  "message": "This is a test alert created via API documentation",
  "type": "info",
  "priority": 1,
  "targetAudience": "all",
  "expiresAt": "2025-12-31T00:00:00.000Z",
  "isSystemWide": true
}
```

**Response:**
```json
{
  "id": 11,
  "title": "Test Alert API",
  "message": "This is a test alert created via API documentation",
  "type": "info",
  "status": "active",
  "targetAudience": null,
  "expiresAt": null,
  "priority": 1,
  "isSystemWide": true,
  "userId": null,
  "createdAt": "2025-08-17T18:10:18.148Z",
  "updatedAt": "2025-08-17T18:10:18.148Z"
}
```

### 4.2 Get Active Alerts
**Endpoint:** `GET /api/alerts/active`  
**Description:** Retrieve all active alerts  
**Authentication:** Required  

**Response:**
```json
[
  {
    "id": 5,
    "title": "Urgent Blood Shortage",
    "message": "We are experiencing a critical shortage of O- blood type. Please donate if you are eligible.",
    "type": "error",
    "status": "active",
    "targetAudience": "donors",
    "expiresAt": "2025-12-31T00:00:00.000Z",
    "priority": 3,
    "isSystemWide": true,
    "userId": null,
    "createdAt": "2025-08-15T17:29:58.269Z",
    "updatedAt": "2025-08-15T17:29:58.269Z"
  }
]
```

### 4.3 Delete Alert
**Endpoint:** `DELETE /api/alerts/:id`  
**Description:** Delete an alert by ID  
**Authentication:** Required  

**Parameters:**
- `id` (path): Alert ID to delete

### 4.4 Create Alert and Send Email
**Endpoint:** `POST /api/alerts/send-email`  
**Description:** Create alert and send email notification to all users  
**Authentication:** Required  

**Request Body:**
```json
{
  "title": "Email Alert",
  "message": "This alert will be sent via email",
  "type": "warning",
  "targetAudience": "all",
  "priority": 2,
  "sendEmail": true
}
```

### 4.5 Send Existing Alert via Email
**Endpoint:** `POST /api/alerts/:id/send-email`  
**Description:** Send existing alert via email to all users  
**Authentication:** Required  

**Parameters:**
- `id` (path): Alert ID to send

---

## 5. Alert Management Endpoints (AlertController)

### 5.1 Get All Alerts (AlertController)
**Endpoint:** `GET /admin/alerts`  
**Description:** Retrieve all alerts with advanced filtering  
**Authentication:** Required  

**Query Parameters:**
- `status` (optional): Filter by status (e.g., "active")

**Response:**
```json
[
  {
    "id": 11,
    "title": "Test Alert API",
    "message": "This is a test alert created via API documentation",
    "type": "info",
    "status": "active",
    "expiresAt": null,
    "isSystemWide": true,
    "targetAudience": null,
    "priority": 1,
    "userId": null,
    "createdAt": "2025-08-17T18:10:18.148Z",
    "updatedAt": "2025-08-17T18:10:18.148Z"
  }
]
```

### 5.2 Create Alert (AlertController)
**Endpoint:** `POST /admin/alerts`  
**Description:** Create a new alert with creator tracking  
**Authentication:** Required  

**Request Body:**
```json
{
  "title": "New Alert",
  "message": "Alert message",
  "type": "info",
  "status": "active",
  "expiresAt": "2025-12-31T00:00:00.000Z",
  "isSystemWide": true,
  "targetAudience": "all",
  "priority": 1
}
```

### 5.3 Get Alert by ID
**Endpoint:** `GET /admin/alerts/:id`  
**Description:** Retrieve a specific alert by ID  
**Authentication:** Required  

**Parameters:**
- `id` (path): Alert ID

### 5.4 Update Alert
**Endpoint:** `PUT /admin/alerts/:id`  
**Description:** Update an existing alert  
**Authentication:** Required  

**Parameters:**
- `id` (path): Alert ID

**Request Body:**
```json
{
  "title": "Updated Alert Title",
  "message": "Updated message",
  "type": "warning",
  "status": "active"
}
```

### 5.5 Delete Alert (AlertController)
**Endpoint:** `DELETE /admin/alerts/:id`  
**Description:** Delete an alert (with creator verification)  
**Authentication:** Required  

**Parameters:**
- `id` (path): Alert ID

### 5.6 Get Alerts by Audience
**Endpoint:** `GET /admin/alerts/by-audience/:audience`  
**Description:** Get alerts filtered by target audience  
**Authentication:** Required  

**Parameters:**
- `audience` (path): Target audience (e.g., "donors", "managers", "admins", "all")

### 5.7 Get My Alerts
**Endpoint:** `GET /admin/alerts/my-alerts`  
**Description:** Get alerts created by the current admin user  
**Authentication:** Required  

**Response:**
```json
[]
```

### 5.8 Archive Expired Alerts
**Endpoint:** `POST /admin/alerts/archive-expired`  
**Description:** Archive all expired alerts  
**Authentication:** Required  

**Response:**
```json
{
  "message": "Expired alerts archived successfully",
  "archivedCount": 5
}
```

---

## 6. Reports Endpoints

### 6.1 Donation Reports
**Endpoint:** `GET /api/reports/donations`  
**Description:** Generate donation statistics report  
**Authentication:** Required  

**Response:**
```json
{
  "totalDonors": 7,
  "activeDonors": 7,
  "inactiveDonors": 0,
  "bloodTypeDistribution": {},
  "monthlyDonations": [],
  "generatedAt": "2025-08-17T18:10:04.836Z"
}
```

### 6.2 Request Reports
**Endpoint:** `GET /api/reports/requests`  
**Description:** Generate blood request statistics report  
**Authentication:** Required  

**Response:**
```json
{
  "totalManagers": 2,
  "pendingRequests": 0,
  "fulfilledRequests": 0,
  "monthlyRequests": [],
  "generatedAt": "2025-08-17T18:10:05.639Z"
}
```

---

## 7. Blood Request Management Endpoints

### 7.1 Get All Blood Requests
**Endpoint:** `GET /api/blood-requests`  
**Description:** Retrieve all blood requests  
**Authentication:** Required  

**Response:**
```json
[
  {
    "id": 5,
    "bloodType": "AB+",
    "urgencyLevel": "high",
    "hospitalName": "Final Test Hospital",
    "hospitalAddress": "999 Final Test Ave",
    "status": "active",
    "neededBy": "2025-08-25T12:00:00.000Z",
    "unitsNeeded": 3,
    "postedBy": {
      "id": 18,
      "email": "sarah.manager@lifeconnect.com",
      "name": "Sarah Manager",
      "phoneNumber": "+1234567892",
      "bloodType": null,
      "userType": "manager",
      "role": {
        "id": 2,
        "name": "manager",
        "description": "Blood bank manager with limited admin access",
        "permissions": ["create", "read", "update", "manage_requests", "view_donors"],
        "isActive": true,
        "createdAt": "2025-08-15T17:29:58.233Z",
        "updatedAt": "2025-08-15T17:29:58.233Z"
      },
      "roleId": 2,
      "isActive": true,
      "isVerified": true,
      "createdAt": "2025-08-15T17:29:58.244Z",
      "updatedAt": "2025-08-15T17:29:58.244Z"
    },
    "userId": 18,
    "createdAt": "2025-08-16T22:03:52.432Z",
    "updatedAt": "2025-08-16T22:03:52.432Z"
  }
]
```

### 7.2 Get Blood Request by ID
**Endpoint:** `GET /api/blood-requests/:id`  
**Description:** Retrieve a specific blood request by ID  
**Authentication:** Required  

**Parameters:**
- `id` (path): Blood request ID

### 7.3 Create Blood Request
**Endpoint:** `POST /api/blood-requests`  
**Description:** Create a new blood request  
**Authentication:** Required  

**Request Body:**
```json
{
  "bloodType": "O+",
  "urgencyLevel": "high",
  "hospitalName": "Emergency Hospital",
  "hospitalAddress": "123 Emergency St",
  "neededBy": "2025-08-25T12:00:00.000Z",
  "unitsNeeded": 2
}
```

### 7.4 Update Blood Request
**Endpoint:** `PATCH /api/blood-requests/:id`  
**Description:** Update an existing blood request  
**Authentication:** Required  

**Parameters:**
- `id` (path): Blood request ID

**Request Body:**
```json
{
  "urgencyLevel": "critical",
  "unitsNeeded": 5,
  "status": "active"
}
```

### 7.5 Delete Blood Request
**Endpoint:** `DELETE /api/blood-requests/:id`  
**Description:** Delete a blood request  
**Authentication:** Required  

**Parameters:**
- `id` (path): Blood request ID

---

## 8. Email/Mailer Endpoints

### 8.1 Test Email Connection
**Endpoint:** `GET /api/mailer/test-connection`  
**Description:** Test SMTP connection  
**Authentication:** Required  

**Response:**
```json
{
  "success": true,
  "message": "SMTP connection successful",
  "timestamp": "2025-08-17T18:10:07.759Z"
}
```

### 8.2 Create Test User and Send Email
**Endpoint:** `POST /api/mailer/test-send`  
**Description:** Create a test user and send test email  
**Authentication:** Required  

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

---

## 9. Data Types and Enums

### Alert Types
- `info` - Informational alert
- `warning` - Warning alert
- `error` - Error alert
- `success` - Success alert

### Alert Status
- `active` - Alert is active
- `inactive` - Alert is inactive
- `archived` - Alert is archived
- `expired` - Alert has expired

### Alert Priority
- `0` - Low priority
- `1` - Normal priority
- `2` - High priority
- `3` - Critical priority

### Target Audience
- `all` - All users
- `donors` - Only donors
- `managers` - Only managers
- `admins` - Only admins

### User Types
- `admin` - System administrator
- `manager` - Blood bank manager
- `donor` - Blood donor

### Blood Types
- `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`

### Urgency Levels
- `low` - Low urgency
- `medium` - Medium urgency
- `high` - High urgency
- `critical` - Critical urgency
- `urgent` - Urgent

### Blood Request Status
- `active` - Request is active
- `fulfilled` - Request has been fulfilled
- `cancelled` - Request was cancelled
- `expired` - Request has expired

---

## 10. Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthorized access. Admin privileges required.",
  "error": "Unauthorized",
  "statusCode": 401
}
```

### 404 Not Found
```json
{
  "message": "User not found",
  "error": "Not Found",
  "statusCode": 404
}
```

### 409 Conflict
```json
{
  "message": "User with this email already exists",
  "error": "Conflict",
  "statusCode": 409
}
```

### 500 Internal Server Error
```json
{
  "message": "Failed to create role",
  "statusCode": 500
}
```

---

## Notes

1. **Authentication**: All endpoints require a valid JWT token in the Authorization header except for login and bootstrap-admin endpoints.

2. **Base URL**: The server runs on port 3007 by default (configurable via `PORT` environment variable).

3. **Database**: The system uses PostgreSQL database with TypeORM.

4. **Email Service**: SMTP email functionality is available for alert notifications.

5. **Two Alert Controllers**: The system has two separate alert controllers:
   - `/api/alerts/*` (AdminController) - Basic alert management
   - `/admin/alerts/*` (AlertController) - Advanced alert management with user tracking

6. **Role-Based Access**: All admin endpoints verify that the user has admin privileges through the AdminGuard.

7. **Password Security**: Passwords are hashed using bcrypt before storage.

8. **JWT Configuration**: JWT tokens are signed with the secret key defined in the `JWT_SECRET` environment variable.

---

## Testing Credentials

**Admin Login:**
- Email: `john.admin@lifeconnect.com`
- Password: `password`

This documentation was generated on August 17, 2025, by testing the actual API endpoints.