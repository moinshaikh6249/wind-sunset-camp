# Wind & Sunset Camp Backend - Quick Start Guide

## 🎯 Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create .env File
```bash
cp .env.example .env
```

### 3. Configure MongoDB
Edit `.env` and add your MongoDB URI:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wind-sunset-camp
JWT_SECRET=your-secret-key-here
```

### 4. Start Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

---

## 🧪 Testing API Endpoints

### Using Postman Collection

Import this Postman collection to test all endpoints:

#### 1. Authentication
```
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "Password123",
  "confirmPassword": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "...",
    "firstName": "John",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

#### 2. Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

---

#### 3. Get Camps
```
GET http://localhost:5000/api/camps
```

---

#### 4. Create Booking
```
POST http://localhost:5000/api/bookings
Content-Type: application/json

{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "phone": "9876543210",
  "campId": "PASTE_CAMP_ID_HERE",
  "numberOfPeople": 3
}
```

---

#### 5. Submit Review
```
POST http://localhost:5000/api/reviews
Content-Type: application/json

{
  "name": "John Traveler",
  "email": "john@example.com",
  "rating": 5,
  "comment": "Amazing experience! Highly recommend this camp."
}
```

---

#### 6. Send Message
```
POST http://localhost:5000/api/messages
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john@example.com",
  "subject": "Group Booking Inquiry",
  "message": "We are interested in booking for a group of 50 people."
}
```

---

#### 7. Get Gallery
```
GET http://localhost:5000/api/gallery?page=1&limit=12
```

---

## 🔐 Admin Endpoints (Requires Auth Token)

### Login as Admin First
```
POST http://localhost:5000/api/auth/login
{
  "email": "admin@example.com",
  "password": "AdminPassword123"
}
```

Copy the returned `token` and use in Authorization header.

### Get Dashboard Stats
```
GET http://localhost:5000/api/admin/dashboard/stats
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get All Bookings
```
GET http://localhost:5000/api/bookings
Authorization: Bearer YOUR_TOKEN_HERE
```

### Update Booking Status
```
PUT http://localhost:5000/api/bookings/BOOKING_ID/status
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "status": "Approved"
}
```

### Get All Messages
```
GET http://localhost:5000/api/messages
Authorization: Bearer YOUR_TOKEN_HERE
```

### Get All Reviews (Admin)
```
GET http://localhost:5000/api/reviews/all
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 📋 Postman Setup Steps

1. **Open Postman**
2. **Create New Collection** → Name it "Wind & Sunset Camp"
3. **Add Environment**:
   - Variable: `base_url` = `http://localhost:5000`
   - Variable: `token` = (leave empty, will be filled after login)

4. **Import Requests** from above examples
5. **After login**, copy token to environment variable
6. **Use token in headers**:
   ```
   Authorization: Bearer {{token}}
   ```

---

## 💻 cURL Examples

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "email": "john@example.com",
    "password": "Password123",
    "confirmPassword": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Get Camps
```bash
curl -X GET http://localhost:5000/api/camps
```

### Create Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "9876543210",
    "campId": "CAMP_ID",
    "numberOfPeople": 3
  }'
```

---

## 🔍 Database Inspection

### MongoDB Atlas
1. Go to MongoDB Atlas Dashboard
2. Select your cluster
3. Click "Browse Collections"
4. View collections:
   - `users`
   - `camps`
   - `bookings`
   - `reviews`
   - `messages`
   - `galleryimages`

---

## 📊 Common Workflows

### Complete User Journey

1. **Sign Up**
   ```
   POST /api/auth/signup
   ```

2. **Login**
   ```
   POST /api/auth/login
   (Save token)
   ```

3. **View Camps**
   ```
   GET /api/camps
   ```

4. **Create Booking**
   ```
   POST /api/bookings
   ```

5. **Submit Review**
   ```
   POST /api/reviews
   ```

### Admin Tasks

1. **Login as Admin**
   ```
   POST /api/auth/login (with admin credentials)
   ```

2. **View Dashboard Stats**
   ```
   GET /api/admin/dashboard/stats
   ```

3. **Manage Bookings**
   ```
   GET /api/bookings (list)
   PUT /api/bookings/:id/status (update status)
   DELETE /api/bookings/:id (delete)
   ```

4. **Manage Camps**
   ```
   POST /api/camps (create)
   PUT /api/camps/:id (update)
   DELETE /api/camps/:id (delete)
   ```

5. **Manage Reviews**
   ```
   GET /api/reviews/all (list all)
   PUT /api/reviews/:id/visibility (toggle)
   DELETE /api/reviews/:id (delete)
   ```

---

## 🐛 Common Issues

### Error: "No token provided"
- Add `Authorization: Bearer YOUR_TOKEN` header
- Ensure token is copied correctly from login response

### Error: "MONGODB_URI is not defined"
- Check `.env` file exists
- Ensure `MONGODB_URI` is set correctly
- Restart server after updating `.env`

### Error: "All authentication requests failed"
- Check MongoDB connection
- Verify IP whitelist in MongoDB Atlas
- Check if MONGODB_URI is correct

### 404 Not Found
- Check endpoint URL is correct
- Ensure server is running on correct port
- Check route spelling

---

## 📚 API Documentation Files

- `README.md` - Complete API reference
- `QUICK_START.md` - This file
- `.env.example` - All environment variables
- Individual controller files have comments

---

## 🚀 Deployment Checklist

- [ ] Update `FRONTEND_URL` in .env
- [ ] Set secure `JWT_SECRET`
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Test all critical endpoints
- [ ] Setup error logging
- [ ] Configure CORS origins
- [ ] Enable HTTPS in production
- [ ] Setup monitoring/alerts

---

## 📞 Useful Commands

```bash
# Install dependencies
npm install

# Start server (development)
npm run dev

# Start server (production)
npm start

# Check if port is in use
lsof -i :5000

# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

---

**Ready to go!** 🚀

Start with signup, then explore other endpoints.
