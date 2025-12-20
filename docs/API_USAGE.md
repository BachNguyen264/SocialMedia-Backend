# SocialMedia API Usage Guide for Android Developers

This guide shows how to use the backend API endpoints that replace the Android controller logic.

## Authentication

### Register New User
**Replaces**: `CreateUser.java`

```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### User Login
**Replaces**: `ReadUser.java`

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**: Same format as register

## User Management

### Get All Users (for discovery)
**Replaces**: `ReadAllUsers.java`

```http
GET /api/users
Authorization: Bearer <token>
```

**Optional search**: `GET /api/users?search=john`

### Get User Profile
**Replaces**: `ReadUserByID.java`

```http
GET /api/users/123
Authorization: Bearer <token>
```

### Update User Profile
**Replaces**: `UpdateUser.java`

```http
PUT /api/users/123
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith"
}
```

## Posts

### Create Post
**Replaces**: `CreatePost.java`

```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is my post content!"
}
```

### Get Timeline (from friends)
**Replaces**: `GenerateTimeline.java`

```http
GET /api/timeline
Authorization: Bearer <token>
```

**Pagination**: `GET /api/timeline?page=1&limit=20`

## Comments

### Create Comment
**Replaces**: `CreateComment.java`

```http
POST /api/posts/123/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Great post!"
}
```

### Get Post Comments
**Replaces**: `ReadPostComments.java`

```http
GET /api/posts/123/comments
Authorization: Bearer <token>
```

## Likes

### Like Post
**Replaces**: `LikePost.java`

```http
POST /api/posts/123/like
Authorization: Bearer <token>
```

### Unlike Post
**Replaces**: `DislikePost.java`

```http
DELETE /api/posts/123/like
Authorization: Bearer <token>
```

### Get Post Likes
**Replaces**: `ReadPostLikes.java`

```http
GET /api/posts/123/likes
Authorization: Bearer <token>
```

## Friends

### Add Friend
**Replaces**: `AddFriend.java`

```http
POST /api/users/123/friends
Authorization: Bearer <token>
```

### Remove Friend
**Replaces**: `RemoveFriend.java`

```http
DELETE /api/users/123/friends
Authorization: Bearer <token>
```

### Get User's Friends

```http
GET /api/users/123/friends
Authorization: Bearer <token>
```

## User Activity

### Get User's Posts
**Replaces**: `ReadUserPosts.java`

```http
GET /api/users/123/posts
Authorization: Bearer <token>
```

### Get User's Comments
**Replaces**: `ReadUserComments.java`

```http
GET /api/users/123/comments
Authorization: Bearer <token>
```

### Get User's Liked Posts
**Replaces**: `ReadUserLikes.java`

```http
GET /api/users/123/likes
Authorization: Bearer <token>
```

## Error Handling

All API endpoints return consistent responses:

**Success Response**:
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message",
  "details": []
}
```

**Common HTTP Status Codes**:
- 200: Success
- 201: Created (POST requests)
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/expired token)
- 403: Forbidden (permission denied)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 500: Internal Server Error

## Authentication Flow

1. **Register/Login**: Get JWT token
2. **Include token** in Authorization header: `Bearer <token>`
3. **Token expires** after 24 hours (user must login again)

## Migration Notes

- Direct database queries replaced with REST API calls
- JDBC connection replaced with HTTP requests
- User authentication now uses JWT instead of direct database validation
- All functionality preserved from original Android controllers
- Enhanced security with password hashing and token-based auth