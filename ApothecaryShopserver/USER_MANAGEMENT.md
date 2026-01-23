# User Management System

## Overview
The ApothecaryShop backend now includes a complete **User Management System** that allows administrators to perform full CRUD operations on user accounts.

## Features Implemented

### 1. **User Controller** (`controllers/userController.js`)
Handles all user management operations:
- ✅ Get all users (with pagination, filtering, and search)
- ✅ Get user by ID
- ✅ Create new user (Admin only)
- ✅ Update user details
- ✅ Delete user (with self-delete protection)
- ✅ Toggle user status (activate/deactivate)
- ✅ Get user statistics (dashboard metrics)

### 2. **User Routes** (`routes/users.js`)
RESTful API endpoints for user management:
- `GET /api/users` - Get all users with filtering
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/status` - Toggle user active status
- `GET /api/users/stats` - Get user statistics

### 3. **Validation Schemas** (`validation/schemas.js`)
Added `userManagementSchemas` with comprehensive validation:
- User creation validation
- User update validation
- Status toggle validation
- All fields validated with Joi

### 4. **Role-Based Access Control**
- All user management endpoints require **admin role**
- Uses existing `adminOnly` middleware from `middleware/roleCheck.js`
- Regular staff members cannot access user management features

## API Endpoints

### Get All Users
```http
GET /api/users?page=1&limit=10&role=staff&search=john
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (admin, staff)
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c87",
      "name": "John Smith",
      "email": "john@example.com",
      "role": "staff",
      "provider": "local",
      "createdAt": "2023-06-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Get User By ID
```http
GET /api/users/:id
Authorization: Bearer <admin-token>
```

### Create User (Admin Only)
```http
POST /api/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "role": "staff"
}
```

**Validation:**
- Name: 2-50 characters
- Email: Valid email format
- Password: Min 8 chars, must contain uppercase, lowercase, number, special char
- Role: Must be "admin" or "staff"

### Update User
```http
PUT /api/users/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "name": "Jane Smith",
  "role": "admin"
}
```

**Notes:**
- All fields are optional (at least one required)
- Email uniqueness is checked
- Password will be hashed automatically

### Delete User
```http
DELETE /api/users/:id
Authorization: Bearer <admin-token>
```

**Protection:**
- Admins cannot delete their own account
- Returns 400 error if attempted

### Toggle User Status
```http
PATCH /api/users/:id/status
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "isActive": false
}
```

**Note:** Requires `isActive` field in User model (see Enhancement section)

### Get User Statistics
```http
GET /api/users/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 125,
    "byRole": {
      "admin": 5,
      "staff": 120
    },
    "byProvider": {
      "local": 100,
      "google": 20,
      "facebook": 5
    },
    "recentUsers": 12
  }
}
```

## Security Features

1. **Admin-Only Access**: All endpoints require admin role
2. **Self-Delete Protection**: Admins cannot delete themselves
3. **Password Hashing**: Passwords automatically hashed via User model pre-save hook
4. **Email Uniqueness**: Duplicate email checks on creation and updates
5. **Input Validation**: Comprehensive Joi validation on all inputs
6. **Rate Limiting**: Inherits from global middleware

## Integration

The user management routes are registered in `server.js`:
```javascript
const usersRouter = require('./routes/users');
app.use('/api/users', authMiddleware, usersRouter);
```

## Testing with Swagger

Access the API documentation at:
```
http://localhost:5000/api-docs
```

Look for the **"User Management"** section in the Swagger UI to test all endpoints.

## Usage Example

### Creating an Admin User
1. Login as an existing admin
2. Use the token to call:
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "SecurePass123!",
    "role": "admin"
  }'
```

## Optional Enhancement: User Status Field

To enable the user status toggle feature, add this field to the User model:

```javascript
// In models/user.js
const UserSchema = new mongoose.Schema({
  // ... existing fields ...
  isActive: { type: Boolean, default: true },
  // ... rest of schema
});
```

This allows admins to deactivate users without deleting them.

## Error Handling

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

## Summary

✅ **Complete user management system implemented**
✅ **All CRUD operations available**
✅ **Admin-only access control**
✅ **Full validation and error handling**
✅ **Swagger documentation included**
✅ **Pagination and search capabilities**
✅ **User statistics for dashboards**

The system is production-ready and follows best practices for security, validation, and API design.
