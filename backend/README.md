# Bataknese Backend API

Exclusive online social community platform for Bataknese people. Built with Node.js, Express, PostgreSQL, and Socket.io for real-time chat functionality.

## Features

✅ **Authentication & Authorization**
- User registration with auto-generated Batak ID Card (BTC-YEAR-XXXXX)
- JWT-based authentication
- Profile management with avatar upload

✅ **User Directory**
- Search and filter users by name, marga, age, city, province, gender
- Paginated results
- User statistics

✅ **Marga Reference System**
- 60+ Batak marga from all sub-ethnics (Toba, Karo, Simalungun, Pakpak, Mandailing, Angkola)
- Validated during registration

✅ **Community Management**
- Create, read, update, delete communities
- Join/leave communities
- Role-based access (leader, vice_leader, secretary, treasurer, supervisor, member)
- Only leaders can assign roles

✅ **Real-time Chat**
- Community group chat
- Peer-to-peer direct messaging
- Unread message tracking
- Typing indicators
- Image sharing
- Socket.io for real-time communication

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Real-time:** Socket.io
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer
- **Security:** Helmet, bcryptjs
- **Validation:** express-validator

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd bataknese-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bataknese
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

UPLOAD_PATH=uploads
MAX_FILE_SIZE=5242880

CLIENT_URL=http://localhost:3000
```

### 4. Create database
```bash
psql -U postgres
CREATE DATABASE bataknese;
\q
```

### 5. Initialize database schema
```bash
npm run init-db
# Or manually:
psql -U postgres -d bataknese -f src/database/schema.sql
```

### 6. Start the server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

### 🔐 Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "full_name": "John Siregar",
  "marga": "Siregar",
  "email": "john.siregar@example.com",
  "password": "password123",
  "gender": "Male",
  "date_of_birth": "1990-05-15",
  "phone": "+628123456789",
  "address": "Jl. Batak No. 123",
  "city": "Jakarta",
  "province": "DKI Jakarta"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "full_name": "John Siregar",
      "marga": "Siregar",
      "email": "john.siregar@example.com",
      "gender": "Male",
      "batak_id_card": "BTC-2024-00001"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john.siregar@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

full_name: John Siregar Updated
phone: +628123456789
city: Jakarta
avatar: <file>
```

#### Get Marga List
```http
GET /auth/marga-list
```

---

### 👥 Users

#### Search Users
```http
GET /users/search?name=john&marga=siregar&gender=Male&city=jakarta&min_age=25&max_age=40&page=1&limit=20
Authorization: Bearer <token>
```

#### Get User by ID
```http
GET /users/:userId
Authorization: Bearer <token>
```

#### Get User Statistics
```http
GET /users/stats
Authorization: Bearer <token>
```

---

### 🏘️ Communities

#### Create Community
```http
POST /communities
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: Jakarta Batak Community
description: Community for Bataknese in Jakarta
category: Regional
city: Jakarta
province: DKI Jakarta
avatar: <file>
```

#### Get All Communities
```http
GET /communities?search=jakarta&city=jakarta&page=1&limit=20
Authorization: Bearer <token>
```

#### Get My Communities
```http
GET /communities/my
Authorization: Bearer <token>
```

#### Get Community by ID
```http
GET /communities/:communityId
Authorization: Bearer <token>
```

#### Update Community (Leader only)
```http
PUT /communities/:communityId
Authorization: Bearer <token>
Content-Type: multipart/form-data

name: Updated Community Name
description: Updated description
```

#### Delete Community (Leader only)
```http
DELETE /communities/:communityId
Authorization: Bearer <token>
```

#### Join Community
```http
POST /communities/:communityId/join
Authorization: Bearer <token>
```

#### Leave Community
```http
DELETE /communities/:communityId/leave
Authorization: Bearer <token>
```

#### Get Community Members
```http
GET /communities/:communityId/members?page=1&limit=50
Authorization: Bearer <token>
```

#### Assign Role (Leader only)
```http
PUT /communities/:communityId/members/:memberId/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "secretary"
}
```

**Valid roles:** leader, vice_leader, secretary, treasurer, supervisor, member

---

### 💬 Chat

#### Get or Create DM Room
```http
GET /chat/dm/:userId
Authorization: Bearer <token>
```

#### Get My DM Rooms
```http
GET /chat/dm
Authorization: Bearer <token>
```

#### Get Unread Count
```http
GET /chat/unread
Authorization: Bearer <token>
```

#### Get Community Chat Room
```http
GET /chat/community/:communityId
Authorization: Bearer <token>
```

#### Get Room Messages
```http
GET /chat/rooms/:roomId/messages?page=1&limit=50
Authorization: Bearer <token>
```

#### Send Message (REST alternative)
```http
POST /chat/rooms/:roomId/messages
Authorization: Bearer <token>
Content-Type: multipart/form-data

content: Hello, this is a message
message_type: text
image: <file> (optional)
```

---

## Socket.io Events

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});
```

### Events

#### Join Room
```javascript
socket.emit('room:join', { roomId: 'room-uuid' });

socket.on('room:joined', (data) => {
  console.log('Joined room:', data.roomId);
});
```

#### Leave Room
```javascript
socket.emit('room:leave', { roomId: 'room-uuid' });
```

#### Send Message
```javascript
socket.emit('message:send', {
  roomId: 'room-uuid',
  content: 'Hello everyone!',
  messageType: 'text'
});
```

#### Receive Message
```javascript
socket.on('message:received', (message) => {
  console.log('New message:', message);
});
```

#### Typing Indicators
```javascript
// Start typing
socket.emit('typing:start', { roomId: 'room-uuid' });

// Stop typing
socket.emit('typing:stop', { roomId: 'room-uuid' });

// Listen for typing
socket.on('typing:user', (data) => {
  console.log(`${data.full_name} is typing...`);
});
```

#### Mark Messages as Read
```javascript
socket.emit('message:mark_read', { roomId: 'room-uuid' });
```

#### Community Chat
```javascript
socket.emit('community:join_chat', { communityId: 'community-uuid' });

socket.on('community:chat_joined', (data) => {
  console.log('Joined community chat:', data);
});
```

#### User Status
```javascript
socket.on('user:online', (data) => {
  console.log(`${data.full_name} is online`);
});

socket.on('user:offline', (data) => {
  console.log(`${data.full_name} is offline`);
});
```

---

## Database Schema

### Users Table
- Auto-generated Batak ID Card (BTC-YEAR-XXXXX)
- Validated marga from reference table
- Profile with avatar support

### Communities Table
- CRUD operations
- Avatar support
- Auto-creation of chat room on community creation

### Community Members Table
- Role-based access control
- Unique constraint per user-community pair
- Auto-add creator as leader

### Chat Rooms Table
- Two types: 'community' and 'direct'
- Unique constraints for room integrity

### Chat Messages Table
- Support for text and image messages
- Unread tracking
- Soft delete support

### Marga Reference Table
- 60+ Batak marga names
- Organized by sub-ethnic

---

## Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Helmet for HTTP headers security
- ✅ CORS configuration
- ✅ Input validation
- ✅ File upload restrictions (images only, max 5MB)
- ✅ SQL injection protection (parameterized queries)
- ✅ XSS protection

---

## File Upload

Supported formats: JPEG, JPG, PNG, GIF
Max file size: 5MB

Upload directories:
- `/uploads/avatars` - User avatars
- `/uploads/communities` - Community avatars
- `/uploads/chat` - Chat images

---

## Development

### Run in development mode
```bash
npm run dev
```

### Database migrations
```bash
npm run init-db
```

### Check database connection
```bash
psql -U postgres -d bataknese -c "SELECT COUNT(*) FROM users;"
```

---

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper database credentials
4. Use process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name bataknese-api
   pm2 save
   pm2 startup
   ```
5. Setup reverse proxy (Nginx)
6. Enable HTTPS
7. Configure proper CORS origins

---

## License

MIT

---

## Support

For issues and questions, please contact the development team.
