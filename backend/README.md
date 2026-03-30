# Wind & Sunset Camp - Backend API

A complete Node.js + Express backend for the Wind & Sunset Camp application with MongoDB integration.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Database Models](#database-models)
- [Error Handling](#error-handling)
- [Development](#development)

---

## 📁 Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── constants.js         # Application constants
├── controllers/
│   ├── authController.js    # Auth logic (signup, login)
│   ├── campController.js    # Camp CRUD
│   ├── bookingController.js # Booking CRUD
│   ├── reviewController.js  # Review CRUD
│   ├── messageController.js # Message CRUD
│   ├── galleryController.js # Gallery CRUD
│   └── adminController.js   # Admin dashboard
├── models/
│   ├── User.js              # User schema
│   ├── Admin.js             # Admin schema
│   ├── Camp.js              # Camp schema
│   ├── Booking.js           # Booking schema
│   ├── Review.js            # Review schema
│   ├── Message.js           # Message schema
│   ├── GalleryImage.js      # Gallery image schema
│   └── Activity.js          # User activity schema
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── admin.js             # Admin/role checks
│   └── error.js             # Error handling
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── campRoutes.js        # Camp endpoints
│   ├── bookingRoutes.js     # Booking endpoints
│   ├── reviewRoutes.js      # Review endpoints
│   ├── messageRoutes.js     # Message endpoints
│   ├── galleryRoutes.js     # Gallery endpoints
│   └── adminRoutes.js       # Admin endpoints
├── utils/
│   ├── jwt.js               # JWT utilities
│   ├── password.js          # Password hashing
│   └── validators.js        # Input validators
├── server.js                # Main application file
├── .env.example             # Environment template
├── package.json             # Dependencies
└── README.md                # This file
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file:**
   ```bash
   cp .env.example .env
   ```

4. **Update environment variables** in `.env` with your actual values

5. **Start the server:**
   ```bash
   # Development with hot reload
   npm run dev

   # Production
   npm start
   ```

The server will be available at `http://localhost:5000`

---

## 🔐 Environment Variables

See `.env.example` for all required variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud-name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-api-secret` |
| `RAZORPAY_KEY_ID` | Razorpay key ID | `rzp_test_xxxxxxxxxxxxx` |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | `your-razorpay-key-secret` |
| `EMAIL_USER` | Gmail address used to send booking emails | `yourgmail@gmail.com` |
| `EMAIL_PASS` | Gmail app password for the sender account | `your-app-password` |
| `ADMIN_EMAIL` | Admin inbox for booking alerts | `admin@windandsunsetcamp.com` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `NODE_ENV` | Environment | `development` |

---

## 📡 API Endpoints

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "securePassword123",
  "confirmPassword": "securePassword123"
}

Response:
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Log In
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "token": "JWT_TOKEN",
  "refreshToken": "REFRESH_TOKEN",
  "user": { ... }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer JWT_TOKEN

Response:
{
  "success": true,
  "user": { ... }
}
```

#### Update Profile
```
POST /api/auth/update-profile
Authorization: Bearer JWT_TOKEN
Content-Type: application/json

{
  "firstName": "Jane",
  "phone": "9876543210"
}

Response:
{
  "success": true,
  "user": { ... }
}
```

### Camp Endpoints

#### Get All Camps
```
GET /api/camps?location=Colorado&sort=price-low&page=1&limit=10
```

#### Get Camp by ID
```
GET /api/camps/:id
```

#### Create Camp (Admin)
```
POST /api/camps
Authorization: Bearer JWT_TOKEN
{
  "name": "Mountain Peak Camp",
  "description": "...",
  "location": "Colorado",
  "date": "2025-06-15",
  "price": 299.99,
  "activities": ["hiking", "climbing"]
}
```

#### Update Camp (Admin)
```
PUT /api/camps/:id
Authorization: Bearer JWT_TOKEN
```

#### Delete Camp (Admin)
```
DELETE /api/camps/:id
Authorization: Bearer JWT_TOKEN
```

### Booking Endpoints

#### Create Booking
```
POST /api/bookings
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "campId": "CAMP_ID",
  "numberOfPeople": 3,
  "specialRequests": "..."
}
```

#### Get All Bookings (Admin)
```
GET /api/bookings?status=Pending&page=1&limit=10
Authorization: Bearer JWT_TOKEN
```

#### Update Booking Status (Admin)
```
PUT /api/bookings/:id/status
Authorization: Bearer JWT_TOKEN
{
  "status": "Approved"
}
```

#### Delete Booking (Admin)
```
DELETE /api/bookings/:id
Authorization: Bearer JWT_TOKEN
```

### Review Endpoints

#### Get All Reviews (Public)
```
GET /api/reviews?page=1&limit=10
```

#### Create Review
```
POST /api/reviews
{
  "name": "John Traveler",
  "rating": 5,
  "comment": "Amazing experience! Highly recommend.",
  "email": "john@example.com"
}
```

#### Update Review
```
PUT /api/reviews/:id
Authorization: Bearer JWT_TOKEN
{
  "comment": "Updated comment"
}
```

#### Toggle Review Visibility (Admin)
```
PUT /api/reviews/:id/visibility
Authorization: Bearer JWT_TOKEN
```

#### Pin/Unpin Review (Admin)
```
PUT /api/reviews/:id/pin
Authorization: Bearer JWT_TOKEN
```

#### Delete Review (Admin)
```
DELETE /api/reviews/:id
Authorization: Bearer JWT_TOKEN
```

### Message Endpoints

#### Create Message
```
POST /api/messages
{
  "name": "John Smith",
  "email": "john@example.com",
  "subject": "Group Booking",
  "message": "We need to book for 20 people"
}
```

#### Get All Messages (Admin)
```
GET /api/messages?read=false&page=1&limit=10
Authorization: Bearer JWT_TOKEN
```

#### Mark as Read (Admin)
```
PUT /api/messages/:id/read
Authorization: Bearer JWT_TOKEN
```

#### Delete Message (Admin)
```
DELETE /api/messages/:id
Authorization: Bearer JWT_TOKEN
```

### Gallery Endpoints

#### Get Gallery Images
```
GET /api/gallery?featured=false&category=camp&page=1&limit=12
```

#### Upload Image (Admin)
```
POST /api/gallery
Authorization: Bearer JWT_TOKEN
{
  "imageUrl": "https://example.com/image.jpg",
  "description": "Beautiful sunset view",
  "imageHint": "sunset",
  "category": "camp"
}
```

#### Delete Image (Admin)
```
DELETE /api/gallery/:id
Authorization: Bearer JWT_TOKEN
```

### Admin Endpoints

#### Get Dashboard Stats
```
GET /api/admin/dashboard/stats
Authorization: Bearer JWT_TOKEN

Response:
{
  "success": true,
  "stats": {
    "totalUsers": 150,
    "totalBookings": 45,
    "averageRating": 4.5,
    "unreadMessages": 5,
    ...
  }
}
```

#### Get Users (Admin)
```
GET /api/admin/users?page=1&limit=10
Authorization: Bearer JWT_TOKEN
```

#### Delete User (Admin)
```
DELETE /api/admin/users/:id
Authorization: Bearer JWT_TOKEN
```

---

## 🔐 Authentication

### JWT Token Structure

The JWT token contains:
```javascript
{
  userId: "MONGODB_ID",
  email: "user@example.com",
  role: "user|admin|super-admin",
  permissions: {...},
  iat: timestamp,
  exp: timestamp
}
```

### Using Authorization Header

All protected endpoints require:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Token Expiration

- **Access Token:** 7 days
- **Refresh Token:** 30 days

---

## 📊 Database Models

### User Schema
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  photoURL: String,
  password: String (hashed),
  role: String (user|admin|super-admin),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Camp Schema
```javascript
{
  name: String (unique),
  slug: String,
  description: String,
  location: String,
  date: Date,
  endDate: Date,
  price: Number,
  capacity: Number,
  activities: [String],
  amenities: [String],
  image: { id, imageUrl, imageHint },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Schema
```javascript
{
  userId: ObjectId (ref User),
  fullName: String,
  email: String,
  phone: String,
  campId: ObjectId (ref Camp),
  campName: String,
  numberOfPeople: Number,
  totalPrice: Number,
  status: String (Pending|Approved|Canceled|Completed),
  createdAt: Date,
  updatedAt: Date
}
```

### Review Schema
```javascript
{
  userId: ObjectId (ref User),
  campId: ObjectId (ref Camp),
  name: String,
  rating: Number (1-5),
  comment: String,
  visible: Boolean,
  pinned: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  userId: ObjectId (ref User),
  name: String,
  email: String,
  subject: String,
  message: String,
  read: Boolean,
  timestamp: Date
}
```

### GalleryImage Schema
```javascript
{
  imageUrl: String,
  description: String,
  imageHint: String,
  category: String,
  isPublic: Boolean,
  featured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## ❌ Error Handling

### Standard Error Response
```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Error details (development only)"
}
```

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Messages
- `"No token provided. Please log in."` - Missing JWT token
- `"Invalid token"` - Malformed or expired token
- `"Access denied. Admin privileges required."` - Insufficient permissions
- `"Email already registered"` - Duplicate email signup
- `"Validation failed"` - Input validation error

---

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

This uses `nodemon` to automatically restart the server on file changes.

### Creating New Endpoints

1. **Create controller** in `controllers/`
2. **Define routes** in `routes/`
3. **Add route to server.js**
4. **Test with Postman/curl**

### Adding Middleware

1. Create middleware in `middleware/`
2. Import and use in routes: `router.use(middleware)`

### Database Migrations

MongoDB uses Mongoose schemas. To update:
1. Modify schema in `models/`
2. Mongoose handles schema updates automatically
3. For complex changes, write migration scripts

---

## 📝 Logging

Morgan middleware logs all HTTP requests:
```
GET /api/camps 200 2.5ms
POST /api/bookings 201 15.3ms
```

---

## 🔒 Security Features

- ✅ JWT Authentication
- ✅ Password hashing (bcrypt)
- ✅ CORS enabled
- ✅ Helmet headers
- ✅ Input validation
- ✅ Role-based access control
- ✅ SQL injection prevention (MongoDB)
- ✅ XSS protection via helmet

---

## 📦 Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ORM
- **jsonwebtoken** - JWT handling
- **bcryptjs** - Password hashing
- **cors** - Cross-origin requests
- **helmet** - Security headers
- **morgan** - HTTP logging
- **dotenv** - Environment variables
- **validator** - Input validation

---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check `MONGODB_URI` in `.env`
- Ensure MongoDB Atlas IP whitelist includes your IP
- Verify network connectivity

### JWT Token Invalid
- Ensure `JWT_SECRET` matches between server and frontend
- Check token expiration (7 days)
- Verify token is sent in `Authorization: Bearer` header

### CORS Issues
- Update `FRONTEND_URL` to match frontend origin
- Ensure credentials are set in frontend requests

### Port Already in Use
- Change `PORT` in `.env`
- Or kill process using port: `lsof -ti:5000 | xargs kill -9`

---

## 📞 Support

For issues or questions, contact the development team.

---

**Created:** March 10, 2026  
**Version:** 1.0.0  
**Status:** Production Ready
