# SocialMedia Backend API

Express.js backend API for the SocialMedia Android application, providing RESTful endpoints for user authentication, posts, comments, likes, and friend management.

## Features

- **Authentication**: JWT-based user registration and login
- **User Management**: Profile management and user discovery
- **Posts**: Create posts and view timelines from friends
- **Comments**: Add and view comments on posts
- **Likes**: Like/unlike posts with tracking
- **Friends**: Add and remove friends, manage relationships
- **Security**: Password hashing, JWT tokens, input validation

## Tech Stack

- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: express-validator
- **Security**: Helmet, CORS, input sanitization

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with environment variables:
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=socialmedia
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users (with optional search)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/posts` - Get user's posts
- `GET /api/users/:id/comments` - Get user's comments
- `GET /api/users/:id/likes` - Get posts user has liked

### Posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post

### Timeline
- `GET /api/timeline` - Get timeline (posts from friends)

### Comments
- `POST /api/posts/:postId/comments` - Add comment to post
- `GET /api/posts/:postId/comments` - Get comments for post

### Likes
- `POST /api/posts/:postId/like` - Like a post
- `DELETE /api/posts/:postId/like` - Unlike a post
- `GET /api/posts/:postId/likes` - Get likes for post

### Friends
- `POST /api/users/:userId/friends` - Add friend
- `DELETE /api/users/:userId/friends` - Remove friend
- `GET /api/users/:userId/friends` - Get user's friends

## Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses with appropriate HTTP status codes:

```json
{
  "success": false,
  "error": "Error message",
  "details": []
}
```

## Database Schema

- **Users**: id, firstName, lastName, email, password
- **Posts**: id, content, userId
- **Comments**: id, content, userId, postId
- **Likes**: userId, postId (composite primary key)
- **Friends**: userId, friendId (composite primary key)

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention via Sequelize ORM
- CORS configuration
- Helmet security headers

## Environment Variables

- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - Token expiration (default: 24h)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin