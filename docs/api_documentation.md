# Schedule App - API Documentation

**Base URL**: `http://localhost:3000/api`

**Authentication**: Most endpoints require JWT authentication via `Authorization: Bearer <token>` header.

---

## Authentication Endpoints

### POST /auth/login
Login with email and password.

**Authentication**: None required

**Request Body**:
```json
{
  "email": "admin@scheduleapp.com",
  "password": "Admin123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "dee9c6b7-5a5b-4799-9be3-72c9011a59e9",
      "email": "admin@scheduleapp.com",
      "role": "admin",
      "first_name": "Admin",
      "last_name": "User",
      "phone": null,
      "is_active": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

### POST /auth/refresh
Refresh access token using refresh token.

**Authentication**: None required (refresh token in body)

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": "Invalid refresh token"
}
```

---

### POST /auth/logout
Logout and invalidate refresh token.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /auth/change-password
Change own password.

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Current password is incorrect"
}
```

---

## User Management Endpoints

### GET /users
Get all users (admin only).

**Authentication**: Required (Admin only)

**Query Parameters**:
- `role` (optional): Filter by role (`admin` or `entertainer`)
- `is_active` (optional): Filter by active status (`true` or `false`)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "dee9c6b7-5a5b-4799-9be3-72c9011a59e9",
      "email": "admin@scheduleapp.com",
      "role": "admin",
      "first_name": "Admin",
      "last_name": "User",
      "phone": null,
      "is_active": true,
      "created_at": "2024-10-22T20:00:00.000Z",
      "updated_at": "2024-10-22T20:00:00.000Z"
    },
    {
      "id": "f1e2c6b7-5a5b-4799-9be3-72c9011a59e9",
      "email": "dj1@scheduleapp.com",
      "role": "entertainer",
      "first_name": "DJ",
      "last_name": "One",
      "phone": "+1234567890",
      "is_active": true,
      "created_at": "2024-10-22T20:00:00.000Z",
      "updated_at": "2024-10-22T20:00:00.000Z"
    }
  ]
}
```

---

### GET /users/me
Get current user's profile.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "dee9c6b7-5a5b-4799-9be3-72c9011a59e9",
    "email": "admin@scheduleapp.com",
    "role": "admin",
    "first_name": "Admin",
    "last_name": "User",
    "phone": null,
    "is_active": true,
    "created_at": "2024-10-22T20:00:00.000Z",
    "updated_at": "2024-10-22T20:00:00.000Z"
  }
}
```

---

### GET /users/entertainers
Get all entertainers (for use in scheduling).

**Authentication**: Required

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "f1e2c6b7-5a5b-4799-9be3-72c9011a59e9",
      "email": "dj1@scheduleapp.com",
      "role": "entertainer",
      "first_name": "DJ",
      "last_name": "One",
      "phone": "+1234567890",
      "is_active": true
    },
    {
      "id": "a3b4c6b7-5a5b-4799-9be3-72c9011a59e9",
      "email": "dj2@scheduleapp.com",
      "role": "entertainer",
      "first_name": "DJ",
      "last_name": "Two",
      "phone": "+1234567891",
      "is_active": true
    }
  ]
}
```

---

### GET /users/:id
Get user by ID.

**Authentication**: Required (Admin or own profile)

**URL Parameters**:
- `id`: User UUID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "f1e2c6b7-5a5b-4799-9be3-72c9011a59e9",
    "email": "dj1@scheduleapp.com",
    "role": "entertainer",
    "first_name": "DJ",
    "last_name": "One",
    "phone": "+1234567890",
    "is_active": true,
    "created_at": "2024-10-22T20:00:00.000Z",
    "updated_at": "2024-10-22T20:00:00.000Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "User not found"
}
```

---

### POST /users
Create new user (admin only).

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "email": "newdj@scheduleapp.com",
  "password": "Password123!",
  "role": "entertainer",
  "first_name": "New",
  "last_name": "DJ",
  "phone": "+1234567892"
}
```

**Validation Rules**:
- `email`: Valid email format, unique
- `password`: Min 8 characters, at least 1 uppercase, 1 lowercase, 1 number
- `role`: Must be `admin` or `entertainer`
- `first_name`: Required, 1-50 characters
- `last_name`: Required, 1-50 characters
- `phone`: Optional, valid phone format

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "b5c6d7e8-5a5b-4799-9be3-72c9011a59e9",
    "email": "newdj@scheduleapp.com",
    "role": "entertainer",
    "first_name": "New",
    "last_name": "DJ",
    "phone": "+1234567892",
    "is_active": true,
    "created_at": "2024-10-22T22:00:00.000Z",
    "updated_at": "2024-10-22T22:00:00.000Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "User with this email already exists"
}
```

---

### PUT /users/:id
Update user details.

**Authentication**: Required (Admin or own profile)

**URL Parameters**:
- `id`: User UUID

**Request Body** (all fields optional):
```json
{
  "email": "updatedemail@scheduleapp.com",
  "first_name": "Updated",
  "last_name": "Name",
  "phone": "+1234567893",
  "role": "entertainer"
}
```

**Note**: Only admins can change `role` and `is_active` fields.

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "f1e2c6b7-5a5b-4799-9be3-72c9011a59e9",
    "email": "updatedemail@scheduleapp.com",
    "role": "entertainer",
    "first_name": "Updated",
    "last_name": "Name",
    "phone": "+1234567893",
    "is_active": true,
    "created_at": "2024-10-22T20:00:00.000Z",
    "updated_at": "2024-10-22T22:30:00.000Z"
  }
}
```

---

### DELETE /users/:id
Deactivate user (admin only).

**Authentication**: Required (Admin only)

**URL Parameters**:
- `id`: User UUID

**Note**: Cannot deactivate own account.

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "You cannot deactivate your own account"
}
```

---

### POST /users/:id/reactivate
Reactivate deactivated user (admin only).

**Authentication**: Required (Admin only)

**URL Parameters**:
- `id`: User UUID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User reactivated successfully"
}
```

---

## Area Management Endpoints

### GET /areas
Get all active areas.

**Authentication**: Required

**Query Parameters**:
- `include_inactive` (optional): Include inactive areas (`true` or `false`, admin only)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
      "name": "Pub",
      "display_order": 1,
      "operating_hours": {
        "monday": { "open": "18:00", "close": "02:00" },
        "tuesday": { "open": "18:00", "close": "02:00" },
        "wednesday": { "open": "18:00", "close": "02:00" },
        "thursday": { "open": "18:00", "close": "02:00" },
        "friday": { "open": "18:00", "close": "03:00" },
        "saturday": { "open": "17:00", "close": "03:00" },
        "sunday": { "open": "17:00", "close": "02:00" }
      },
      "capacity": 100,
      "notes": "Main pub area with DJ booth",
      "is_active": true,
      "created_at": "2024-10-22T20:00:00.000Z",
      "updated_at": "2024-10-22T20:00:00.000Z"
    },
    {
      "id": "b2c3d4e5-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
      "name": "Terrace",
      "display_order": 2,
      "operating_hours": {
        "thursday": { "open": "19:00", "close": "01:00" },
        "friday": { "open": "19:00", "close": "02:00" },
        "saturday": { "open": "19:00", "close": "02:00" },
        "sunday": { "open": "18:00", "close": "01:00" }
      },
      "capacity": 50,
      "notes": "Outdoor terrace area, weather permitting",
      "is_active": true,
      "created_at": "2024-10-22T20:00:00.000Z",
      "updated_at": "2024-10-22T20:00:00.000Z"
    }
  ]
}
```

---

### GET /areas/:id
Get area by ID.

**Authentication**: Required

**URL Parameters**:
- `id`: Area UUID

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "name": "Pub",
    "display_order": 1,
    "operating_hours": {
      "monday": { "open": "18:00", "close": "02:00" },
      "tuesday": { "open": "18:00", "close": "02:00" },
      "wednesday": { "open": "18:00", "close": "02:00" },
      "thursday": { "open": "18:00", "close": "02:00" },
      "friday": { "open": "18:00", "close": "03:00" },
      "saturday": { "open": "17:00", "close": "03:00" },
      "sunday": { "open": "17:00", "close": "02:00" }
    },
    "capacity": 100,
    "notes": "Main pub area with DJ booth",
    "is_active": true,
    "created_at": "2024-10-22T20:00:00.000Z",
    "updated_at": "2024-10-22T20:00:00.000Z"
  }
}
```

---

### POST /areas
Create new area (admin only).

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "name": "VIP Lounge",
  "display_order": 5,
  "operating_hours": {
    "friday": { "open": "20:00", "close": "03:00" },
    "saturday": { "open": "20:00", "close": "03:00" }
  },
  "capacity": 30,
  "notes": "Private VIP area",
  "is_active": true
}
```

**Validation Rules**:
- `name`: Required, 1-100 characters, unique
- `display_order`: Optional, integer >= 0 (default: 0)
- `operating_hours`: Optional, JSONB object with day keys and `{open, close}` values
- `capacity`: Optional, integer >= 1
- `notes`: Optional, text
- `is_active`: Optional, boolean (default: true)

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    "name": "VIP Lounge",
    "display_order": 5,
    "operating_hours": {
      "friday": { "open": "20:00", "close": "03:00" },
      "saturday": { "open": "20:00", "close": "03:00" }
    },
    "capacity": 30,
    "notes": "Private VIP area",
    "is_active": true,
    "created_at": "2024-10-22T23:00:00.000Z",
    "updated_at": "2024-10-22T23:00:00.000Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Area with this name already exists"
}
```

---

### PUT /areas/:id
Update area details (admin only).

**Authentication**: Required (Admin only)

**URL Parameters**:
- `id`: Area UUID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Pub Name",
  "display_order": 1,
  "operating_hours": {
    "monday": { "open": "17:00", "close": "02:00" }
  },
  "capacity": 120,
  "notes": "Updated notes",
  "is_active": true
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "name": "Updated Pub Name",
    "display_order": 1,
    "operating_hours": {
      "monday": { "open": "17:00", "close": "02:00" }
    },
    "capacity": 120,
    "notes": "Updated notes",
    "is_active": true,
    "created_at": "2024-10-22T20:00:00.000Z",
    "updated_at": "2024-10-22T23:30:00.000Z"
  }
}
```

---

### DELETE /areas/:id
Deactivate area (soft delete, admin only).

**Authentication**: Required (Admin only)

**URL Parameters**:
- `id`: Area UUID

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Area deactivated successfully"
}
```

---

### PUT /areas/reorder
Reorder areas by updating display_order (admin only).

**Authentication**: Required (Admin only)

**Request Body**:
```json
{
  "areas": [
    { "id": "a1b2c3d4-5e6f-7g8h-9i0j-1k2l3m4n5o6p", "display_order": 1 },
    { "id": "b2c3d4e5-6f7g-8h9i-0j1k-2l3m4n5o6p7q", "display_order": 2 },
    { "id": "c3d4e5f6-7g8h-9i0j-1k2l-3m4n5o6p7q8r", "display_order": 3 }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Areas reordered successfully"
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Validation error or invalid input
- **401 Unauthorized**: Authentication required or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., duplicate email)
- **500 Internal Server Error**: Server error

---

## Authentication Flow

1. **Login**: POST `/auth/login` with email/password → Receive `accessToken` (15min) and `refreshToken` (7 days)
2. **Store tokens**: Store both tokens securely (localStorage or memory)
3. **Authenticated requests**: Include `Authorization: Bearer <accessToken>` header in all requests
4. **Token expiry**: When access token expires (401 response), call POST `/auth/refresh` with refresh token
5. **Logout**: POST `/auth/logout` to invalidate refresh token

### Token Refresh Example

```javascript
// On 401 error
if (error.response.status === 401) {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await axios.post('/api/auth/refresh', { refreshToken });
  const newAccessToken = response.data.data.accessToken;

  // Retry original request with new token
  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
  return axios(originalRequest);
}
```

---

## Rate Limiting

Rate limiting is applied to authentication endpoints:
- **Login**: 5 requests per 15 minutes per IP
- **Refresh**: 10 requests per 15 minutes per IP
- **Other endpoints**: No rate limiting in development (to be added in production)

---

## CORS Configuration

In development:
- **Allowed Origin**: `http://localhost:5173` (frontend)
- **Credentials**: Allowed
- **Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Content-Type, Authorization

---

## Pagination (Future)

Not implemented in Phase 1-2. For future phases with large datasets:

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response Format**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Testing the API

### Using cURL

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@scheduleapp.com","password":"Admin123!"}'
```

**Get Areas** (authenticated):
```bash
TOKEN="your_access_token_here"

curl -X GET http://localhost:3000/api/areas \
  -H "Authorization: Bearer $TOKEN"
```

**Create User** (admin only):
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"newuser@test.com",
    "password":"Password123!",
    "role":"entertainer",
    "first_name":"New",
    "last_name":"User",
    "phone":"+1234567890"
  }'
```

---

## Future Endpoints (Phase 3+)

The following endpoints will be implemented in future phases:

### Availability (Phase 3)
- GET `/api/availability`
- POST `/api/availability`
- DELETE `/api/availability/:id`
- POST `/api/availability/bulk`

### Bookings (Phase 4)
- GET `/api/bookings`
- POST `/api/bookings`
- PUT `/api/bookings/:id`
- DELETE `/api/bookings/:id`
- GET `/api/bookings/month/:year/:month`

### Public Schedule (Phase 6)
- GET `/api/public/schedule/:year/:month`
- GET `/api/public/schedule/current`

---

## Support

For issues or questions about the API:
- Check backend logs: `docker-compose logs -f backend`
- Review validation errors in response body
- Ensure JWT token is valid and not expired
- Verify user has required role/permissions

---

**Last Updated**: October 22, 2024
**API Version**: 1.0 (Phase 1-2 Complete)
