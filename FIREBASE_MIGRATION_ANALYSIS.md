# Firebase to MongoDB/REST API Migration Analysis
## Wind & Sunset Camp - Next.js Project

**Date:** March 10, 2026  
**Project:** Wind & Sunset Camp (Next.js with Firebase)  
**Status:** Analysis Complete - Migration Plan Ready

---

## SECTION 1: FIREBASE IMPORTS INVENTORY

### Files Using Firebase Libraries

| File | Imports | Purpose |
|------|---------|---------|
| `src/lib/firebase.ts` | initializeApp, getAuth, getFirestore | Firebase initialization |
| `src/firebase/index.ts` | getAuth, getDatabase, getFirestore, getStorage | Main Firebase exports |
| `src/firebase/config.ts` | Firebase config object | Environment variables |
| `src/firebase/provider.tsx` | Auth, Firestore, Database, Storage types | Firebase context provider |
| `src/firebase/non-blocking-updates.tsx` | setDoc, addDoc, updateDoc, deleteDoc, CollectionReference | Write operations |
| `src/firebase/non-blocking-login.tsx` | Auth, signInAnonymously, createUserWithEmailAndPassword | Auth operations |
| `src/firebase/database/use-database-value.tsx` | onValue, off, Query | Real-time database |
| `src/firebase/errors.ts` | getAuth, User type | Error handling |

### Page Components Using Firebase

| Page | Firebase Operations | Status |
|------|-------------------|--------|
| `src/app/page.tsx` | Read camps | Public |
| `src/app/signup/SignupForm.tsx` | createUserWithEmailAndPassword, setDoc (users), addDoc (history) | Auth + User creation |
| `src/app/login/LoginForm.tsx` | signInWithEmailAndPassword, getDoc (admin check) | Auth |
| `src/app/booking/BookingForm.tsx` | collection (camps), doc (user), addDoc (bookings) | Read/Write |
| `src/app/camps/CampsPageContent.tsx` | useCollectionData (camps) | Public |
| `src/app/contact/ContactPageContent.tsx` | addDoc (messages) | Public write |
| `src/app/reviews/ReviewsPageContent.tsx` | useCollection, addDoc, query, where | Public read/write |
| `src/app/gallery/GalleryPageContent.tsx` | useCollectionData (galleryImages) | Public |
| `src/app/dashboard/page.tsx` | doc, collection, query, updateDoc | User data |
| `src/app/admin/login/LoginForm.tsx` | signInWithEmailAndPassword, getDoc (admin) | Admin auth |
| `src/app/admin/dashboard/page.tsx` | useCollectionData (users) | Analytics |
| `src/app/admin/camps/page.tsx` | useCollectionData, deleteDoc, setDoc | CRUD camps |
| `src/app/admin/bookings/page.tsx` | useCollection, updateDoc, deleteDoc | CRUD bookings |
| `src/app/admin/gallery/page.tsx` | useCollectionData, deleteDoc | CRUD images |
| `src/app/admin/gallery/UploadImageForm.tsx` | addDoc, serverTimestamp | Create images |
| `src/app/admin/messages/page.tsx` | useCollectionData (messages) | Read |
| `src/app/admin/reviews/page.tsx` | useCollectionData, updateDoc, deleteDoc | Manage reviews |
| `src/app/admin/users/page.tsx` | useCollectionData (users), deleteDoc, updateDoc | User management |

---

## SECTION 2: FIRESTORE OPERATIONS USED

### Read Operations
```
✓ getDocs() / useCollectionData()  → collections: camps, reviews, users, bookings, messages, galleryImages
✓ getDoc() / useDocumentData()     → collections: users, admins
✓ collection()                     → references to all collections
✓ doc()                            → document references
✓ query() + where()                → filtered queries (reviews with visible=true)
✓ onValue()                        → real-time updates (Firebase Database)
```

### Write Operations
```
✓ addDoc()     → messages, reviews, bookings, galleryImages, history
✓ setDoc()     → users (create/overwrite), camps
✓ updateDoc()  → bookings (status), reviews (visibility/pin), users, camps
✓ deleteDoc()  → bookings, camps, reviews, galleryImages, users
```

### Authentication Operations
```
✓ createUserWithEmailAndPassword()
✓ signInWithEmailAndPassword()
✓ updateProfile()
✓ signOut()
✓ getAuth() / useAuthState()
```

### Special Operations
```
✓ serverTimestamp() → for createdAt fields
✓ useCollection()   → real-time collection queries
✓ useCollectionData() → with idField mapping
```

---

## SECTION 3: FIREBASE COLLECTIONS IDENTIFIED

### 1. **admins** Collection
**Purpose:** Admin user roles and permissions  
**Document Structure:**
```json
{
  "email": "admin@example.com",
  "role": "admin|super-admin",
  "createdAt": "2025-01-01T00:00:00Z"
}
```
**Used By:** Admin login verification  
**Operations:** getDoc (read-only for auth check)

---

### 2. **users** Collection
**Purpose:** User profiles and account data  
**Document Structure:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "phone": "1234567890",
  "photoURL": "https://...",
  "createdAt": "2025-01-01T00:00:00Z"
}
```
**Subcollections:**
- `users/{uid}/history` - User activity log (signup, bookings, etc.)
- `users/{uid}/bookings` - User's booking records (legacy structure)

**Used By:** User profile pages, dashboard, bookings, signup  
**Operations:** setDoc (create), updateDoc (edit), getDoc (read), deleteDoc (admin), useCollectionData (analytics)  
**Document ID:** Firebase Auth UID

---

### 3. **bookings** Collection
**Purpose:** Camp booking records  
**Document Structure:**
```json
{
  "userId": "auth-uid|null",
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "campName": "Mountain Peak Camp",
  "peopleCount": 3,
  "status": "Pending|Approved|Canceled",
  "createdAt": "2025-01-15T10:30:00Z"
}
```
**Used By:** Booking form, admin bookings page, dashboard  
**Operations:** addDoc (create), updateDoc (status changes), deleteDoc (cancel), useCollection (list)

---

### 4. **camps** Collection
**Purpose:** Camp event information  
**Document Structure:**
```json
{
  "name": "Mountain Peak Camp",
  "date": "2025-06-15",
  "location": "Colorado Rockies",
  "price": 299.99,
  "description": "A full adventure...",
  "activities": "Hiking, Climbing, Camping",
  "image": {
    "id": "img-001",
    "imageUrl": "https://...",
    "imageHint": "mountain view"
  },
  "createdAt": "2025-01-01T00:00:00Z"
}
```
**Used By:** Camps page, booking form, admin camps management, home page  
**Operations:** useCollectionData (read), addDoc/setDoc (create), updateDoc (edit), deleteDoc (remove)

---

### 5. **reviews** Collection
**Purpose:** User-submitted camp reviews  
**Document Structure:**
```json
{
  "userId": "auth-uid|null",
  "name": "John Traveler",
  "rating": 5,
  "comment": "Amazing experience! Highly recommend this camp.",
  "visible": true,
  "pinned": false,
  "createdAt": { "seconds": 1704067200, "nanoseconds": 0 }
}
```
**Used By:** Reviews page, admin review management  
**Operations:** useCollection (read with filter), addDoc (create), updateDoc (visibility/pin), deleteDoc (remove)

---

### 6. **messages** Collection
**Purpose:** Contact form submissions  
**Document Structure:**
```json
{
  "name": "John Smith",
  "email": "contact@example.com",
  "subject": "Group Booking Inquiry",
  "message": "We are interested in booking for 20 people...",
  "userId": "auth-uid|null",
  "timestamp": "2025-02-10T14:25:30Z",
  "read": false
}
```
**Used By:** Contact form, admin messages dashboard  
**Operations:** addDoc (create), useCollectionData (read)

---

### 7. **galleryImages** Collection
**Purpose:** Gallery image metadata and URLs  
**Document Structure:**
```json
{
  "imageUrl": "https://example.com/camp-image.jpg",
  "description": "Beautiful sunset over the camp",
  "imageHint": "sunset camp",
  "createdAt": { "seconds": 1704067200, "nanoseconds": 0 }
}
```
**Used By:** Gallery page, admin image management  
**Operations:** useCollectionData (read), addDoc (create), deleteDoc (remove)

---

## SECTION 4: FRONTEND PAGES & FIREBASE DEPENDENCIES

### Public Pages
| Page | Collections | Read/Write | Auth Required | Functionality |
|------|-----------|-----------|---------------|---------------|
| `/` | camps | Read | NO | Display featured camps |
| `/camps` | camps | Read | NO | List all camps with filters |
| `/gallery` | galleryImages | Read | NO | Browse gallery images |
| `/reviews` | reviews | R/W | NO | View and submit reviews |
| `/contact` | messages | Write | NO | Submit contact messages |
| `/about` | None | - | NO | Static content |

### Authentication Pages
| Page | Collections | Functionality |
|------|-----------|--------------|
| `/signup` | users, history | Create account, profile setup |
| `/login` | admins | User/admin authentication |

### User Pages (Auth Required)
| Page | Collections | Operations |
|------|-----------|-----------|
| `/dashboard` | users, bookings, history | View profile, booking history, activity |
| `/booking` | camps, users, bookings | Create new bookings using camp data |

### Admin Pages (Admin Auth Required)
| Page | Collections | Operations |
|------|-----------|-----------|
| `/admin/login` | admins | Admin authentication |
| `/admin/dashboard` | users, bookings | View analytics & stats |
| `/admin/camps` | camps | CRUD camps, manage dates/prices |
| `/admin/bookings` | bookings | View/update/delete bookings & status |
| `/admin/gallery` | galleryImages | CRUD gallery images |
| `/admin/images` | galleryImages | Upload/manage images |
| `/admin/messages` | messages | View contact form submissions |
| `/admin/reviews` | reviews | Approve/delete/pin reviews |
| `/admin/users` | users | View/delete user accounts |

---

## SECTION 5: SUGGESTED REST API ENDPOINTS

### Authentication Endpoints
```
POST   /api/auth/signup              → Create user account
POST   /api/auth/login               → User login
POST   /api/auth/admin-login         → Admin login
POST   /api/auth/logout              → User logout
POST   /api/auth/refresh-token       → Refresh JWT
GET    /api/auth/me                  → Get current user
POST   /api/auth/update-profile      → Update user profile
```

### User Endpoints
```
GET    /api/users/:id                → Get user profile
PUT    /api/users/:id                → Update user profile
DELETE /api/users/:id                → Delete user account (admin)
GET    /api/users                    → List users (admin)
GET    /api/users/:id/history        → Get user activity history
```

### Camp Endpoints
```
GET    /api/camps                    → List all camps
GET    /api/camps/:id                → Get camp details
POST   /api/camps                    → Create camp (admin)
PUT    /api/camps/:id                → Update camp (admin)
DELETE /api/camps/:id                → Delete camp (admin)
GET    /api/camps/search?q=name      → Search camps
```

### Booking Endpoints
```
POST   /api/bookings                 → Create booking
GET    /api/bookings                 → List all bookings (admin)
GET    /api/bookings/:id             → Get booking details
PUT    /api/bookings/:id             → Update booking status
PUT    /api/bookings/:id/status      → Change booking status (admin)
DELETE /api/bookings/:id             → Cancel booking
GET    /api/bookings/user/:userId    → Get user's bookings
GET    /api/bookings/stats           → Booking statistics (admin)
```

### Review Endpoints
```
GET    /api/reviews                  → List visible reviews
GET    /api/reviews/all              → List all reviews (admin)
POST   /api/reviews                  → Submit review
GET    /api/reviews/:id              → Get review
PUT    /api/reviews/:id              → Update review
PUT    /api/reviews/:id/visibility   → Toggle visibility (admin)
PUT    /api/reviews/:id/pin          → Pin/unpin review (admin)
DELETE /api/reviews/:id              → Delete review
GET    /api/reviews/stats            → Review statistics
```

### Message Endpoints
```
POST   /api/messages                 → Submit contact message
GET    /api/messages                 → List messages (admin)
GET    /api/messages/:id             → Get message
PUT    /api/messages/:id/read        → Mark as read (admin)
DELETE /api/messages/:id             → Delete message (admin)
GET    /api/messages/stats           → Message statistics
```

### Gallery Endpoints
```
GET    /api/gallery                  → List gallery images
POST   /api/gallery                  → Upload image (admin)
GET    /api/gallery/:id              → Get image metadata
DELETE /api/gallery/:id              → Delete image (admin)
PUT    /api/gallery/:id              → Update image metadata (admin)
```

### Admin Analytics Endpoints
```
GET    /api/admin/dashboard/stats    → Dashboard statistics
GET    /api/admin/dashboard/charts   → Chart data (users, bookings)
GET    /api/admin/analytics/users    → User analytics
GET    /api/admin/analytics/bookings → Booking analytics
GET    /api/admin/analytics/revenue  → Revenue data
GET    /api/admin/reports/export     → Export data (CSV/JSON)
```

---

## SECTION 6: MONGODB/MONGOOSE SCHEMA STRUCTURES

### User Schema
```javascript
const userSchema = new mongoose.Schema({
  // Auth integration
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  
  // Profile information
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    default: null
  },
  photoURL: {
    type: String,
    default: null
  },
  
  // Account metadata
  role: {
    type: String,
    enum: ['user', 'admin', 'super-admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for common queries
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });
```

### Booking Schema
```javascript
const bookingSchema = new mongoose.Schema({
  // Reference to user (optional for guest bookings)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  
  // Booking information
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  phone: {
    type: String,
    required: true
  },
  
  // Camp reference
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camp',
    required: true,
    index: true
  },
  campName: {
    type: String,
    required: true
  },
  
  // Booking details
  numberOfPeople: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    default: null
  },
  specialRequests: {
    type: String,
    default: ''
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Canceled', 'Completed'],
    default: 'Pending',
    index: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ userId: 1, createdAt: -1 });
```

### Camp Schema
```javascript
const campSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  location: {
    type: String,
    required: true,
    index: true
  },
  
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  endDate: {
    type: Date,
    default: null
  },
  
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  capacity: {
    type: Number,
    default: null
  },
  
  bookingsCount: {
    type: Number,
    default: 0
  },
  
  activities: {
    type: [String],
    default: []
  },
  
  amenities: {
    type: [String],
    default: []
  },
  
  image: {
    id: String,
    imageUrl: String,
    imageHint: String
  },
  
  images: [{
    url: String,
    alt: String,
    order: Number
  }],
  
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

campSchema.index({ isActive: 1, date: 1 });
campSchema.index({ location: 1, date: 1 });
```

### Review Schema
```javascript
const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  
  campId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Camp',
    default: null,
    index: true
  },
  
  name: {
    type: String,
    required: true
  },
  
  email: {
    type: String,
    default: null,
    lowercase: true
  },
  
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  
  comment: {
    type: String,
    required: true,
    minlength: 10
  },
  
  visible: {
    type: Boolean,
    default: true,
    index: true
  },
  
  pinned: {
    type: Boolean,
    default: false,
    index: true
  },
  
  helpful: {
    type: Number,
    default: 0
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

reviewSchema.index({ visible: 1, pinned: -1, createdAt: -1 });
reviewSchema.index({ rating: 1, visible: 1 });
```

### Message Schema
```javascript
const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true
  },
  
  name: {
    type: String,
    required: true
  },
  
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  subject: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    enum: ['booking', 'inquiry', 'feedback', 'support', 'other'],
    default: 'inquiry'
  },
  
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  
  archived: {
    type: Boolean,
    default: false,
    index: true
  },
  
  response: {
    text: String,
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: { createdAt: 'timestamp' } });

messageSchema.index({ read: 1, timestamp: -1 });
```

### GalleryImage Schema
```javascript
const galleryImageSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  imageHint: {
    type: String,
    required: true,
    lowercase: true
  },
  
  title: {
    type: String,
    default: null
  },
  
  category: {
    type: String,
    enum: ['camp', 'activity', 'facility', 'nature', 'review', 'other'],
    default: 'camp',
    index: true
  },
  
  // Image metadata
  width: Number,
  height: Number,
  size: Number,
  mimeType: String,
  
  // Access control
  isPublic: {
    type: Boolean,
    default: true,
    index: true
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  order: {
    type: Number,
    default: 0
  },
  
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

galleryImageSchema.index({ isPublic: 1, order: 1 });
galleryImageSchema.index({ category: 1, featured: 1 });
```

### Admin Schema
```javascript
const adminSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  
  name: {
    type: String,
    required: true
  },
  
  role: {
    type: String,
    enum: ['admin', 'super-admin'],
    default: 'admin',
    index: true
  },
  
  permissions: {
    manageCamps: { type: Boolean, default: true },
    manageBookings: { type: Boolean, default: true },
    manageReviews: { type: Boolean, default: true },
    manageMessages: { type: Boolean, default: true },
    manageUsers: { type: Boolean, default: false },
    manageGallery: { type: Boolean, default: true },
    viewAnalytics: { type: Boolean, default: true },
    manageAdmins: { type: Boolean, default: false }
  },
  
  lastLogin: {
    type: Date,
    default: null
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });
```

### User History/Activity Schema (Subcollection Alternative)
```javascript
const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  type: {
    type: String,
    enum: ['signup', 'booking', 'review', 'login', 'profile_update'],
    required: true,
    index: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  metadata: {
    bookingId: mongoose.Schema.Types.ObjectId,
    campId: mongoose.Schema.Types.ObjectId,
    reviewId: mongoose.Schema.Types.ObjectId,
    ipAddress: String,
    userAgent: String
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

activitySchema.index({ userId: 1, timestamp: -1 });
```

---

## SECTION 7: MIGRATION STRATEGY & ARCHITECTURE

### Phase 1: Infrastructure Setup
1. **Database Setup**
   - Create MongoDB Atlas cluster
   - Configure connection string in environment variables
   - Create database for production and staging environments

2. **Backend API Setup**
   - Create Express.js/Nest.js server
   - Setup middlewares (auth, error handling, logging, cors)
   - Configure JWT authentication
   - Setup rate limiting and validation

3. **Environment Configuration**
   - Add MONGODB_URI, JWT_SECRET, API_URL env vars
   - Create separate configs for dev/staging/production
   - Setup Database connection pooling

### Phase 2: Authentication & User Management
1. **JWT Authentication**
   - Replace Firebase Auth tokens with JWT
   - Implement refresh token rotation
   - Setup secure cookie handling

2. **User Migration**
   - Scrip to migrate Firebase users to MongoDB
   - Map Firebase UIDs to MongoDB ObjectIds
   - Handle edge cases (null refs, missing data)

3. **API Implementation**
   - `/api/auth/signup` - Register user
   - `/api/auth/login` - Issue JWT
   - `/api/auth/refresh` - Refresh token
   - Login guards on protected routes

### Phase 3: Core Data Migration
1. **Collections Migration Order**
   - Camps → Bookings → Users → Reviews → Messages → GalleryImages
   - Create migration scripts for each collection
   - Maintain referential integrity (foreign keys)
   - Preserve timestamps and metadata

2. **API Endpoints Implementation**
   - Camps CRUD (GET, POST, PUT, DELETE)
   - Bookings CRUD (GET, POST, PUT, DELETE)
   - User profile endpoints
   - Bulk operations for admin

### Phase 4: Frontend Integration
1. **API Client Setup**
   - Update Firebase SDK imports to custom API calls
   - Create API client utilities (fetch/axios wrapper)
   - Setup request/response interceptors

2. **Component Updates** (maintain existing UI)
   - Replace `useCollectionData()` with `useQuery()`/fetch
   - Replace `addDoc()` with `POST /api/...`
   - Replace `updateDoc()` with `PUT /api/...`
   - Replace `deleteDoc()` with `DELETE /api/...`

3. **Testing**
   - Unit tests for old vs new data layer
   - Integration tests with API
   - End-to-end tests for critical flows

### Phase 5: Firebase Cleanup
1. **Decommission Firebase**
   - Remove Firebase dependencies
   - Delete Firestore collections
   - Archive Firebase project
   - Update security rules

2. **Code Cleanup**
   - Remove Firebase imports from unused files
   - Delete Firebase configuration
   - Remove react-firebase-hooks

---

## SECTION 8: KEY MIGRATION CONSIDERATIONS

### Data Type Conversions
| Firebase Type | MongoDB Type | Conversion |
|---------------|-------------|-----------|
| Document ID (auto) | ObjectId | Automatic by Mongoose |
| string | String | Direct |
| boolean | Boolean | Direct |
| number | Number | Direct |
| Timestamp | Date | `new Date(timestamp)` |
| Reference | ObjectId + ref | Store object ID, use populate |
| Map | Object | Direct |
| Array | Array | Direct |
| null | null | null (nullable fields) |
| GeoPoint | GeoJSON | { type: "Point", coordinates } |

### Authentication Flow Changes
**Firebase Auth:** User UID in context → JWT Token  
**Action:** Replace `useAuthState()` with custom auth context using JWT  
**Update:** Store token in secure httpOnly cookie or localStorage  

### Real-time Updates
**Current:** `onValue()`, `useCollection()` with live listeners  
**Migration Options:**
1. **REST Polling** - Simple, no library dependencies
2. **WebSocket** - Socket.io for real-time updates
3. **Server-Sent Events** - Lighter weight alternative
4. **SWR/React Query** - Built-in refetching & caching

### Security & Permissions
- **Replace Firestore Rules** with role-based middleware
- **Backend Validation** instead of client-side security rules
- **Admin Role Check** before sensitive operations
- **Audit Logging** for all data modifications

### Performance Optimization
- **Indexes:** Create compound indexes for common queries (user + date, status + createdAt)
- **Pagination:** Implement cursor-based pagination for large collections
- **Caching:** Redis for frequently accessed data (camps, gallery images)
- **CDN:** CloudFront for image delivery (S3 migration if leaving Firebase Storage)

---

## SECTION 9: ESTIMATED MIGRATION EFFORT

| Task | Complexity | Hours | Days |
|------|-----------|-------|------|
| MongoDB setup & config | Low | 2 | 0.25 |
| Backend API scaffolding | Low | 4 | 0.5 |
| Authentication system | Medium | 8 | 1 |
| User data migration script | Medium | 6 | 0.75 |
| Camps API + migration | Medium | 8 | 1 |
| Bookings API + migration | Medium | 10 | 1.25 |
| Reviews API + migration | Medium | 8 | 1 |
| Messages & Gallery APIs | Low | 6 | 0.75 |
| Frontend integration | Medium | 12 | 1.5 |
| Testing & QA | Medium | 10 | 1.25 |
| Staging deployment | Low | 4 | 0.5 |
| Production migration | High | 8 | 1 |
| **TOTAL** | - | **86 hours** | **~11 days** |

---

## SECTION 10: DEPENDENCIES & TOOLS

### Backend Libraries
```json
{
  "express": "^4.18.0",
  "mongoose": "^7.0.0",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.0.0",
  "validator": "^13.9.0",
  "helmet": "^7.0.0",
  "morgan": "^1.10.0",
  "redis": "^4.6.0"
}
```

### Frontend Libraries (Replacement)
```json
{
  "axios": "^1.3.0",
  "swr": "^2.1.0",
  "react-query": "^3.39.0",
  "@tanstack/react-query": "^4.28.0"
}
```

### Migration Tools
```json
{
  "mongodb": "^5.0.0",
  "pymongo": "^4.3.0",
  "dotenv-cli": "^6.0.0"
}
```

---

## SECTION 11: TESTING CHECKLIST

### Unit Tests
- [ ] User registration/login flows
- [ ] Camp CRUD operations
- [ ] Booking status transitions
- [ ] Review filtering (visible/pinned)
- [ ] Message creation
- [ ] Data validation (schemas)

### Integration Tests
- [ ] API endpoint responses
- [ ] Database transactions
- [ ] Authentication middleware
- [ ] Authorization checks
- [ ] Error handling

### E2E Tests
- [ ] User signup → profile creation ✓
- [ ] User login → JWT token ✓
- [ ] Browse camps → create booking ✓
- [ ] Submit review → visibility check ✓
- [ ] Contact form → message storage ✓
- [ ] Admin login → camp management ✓
- [ ] Admin operations → Firestore updates ✓

---

## SECTION 12: ROLLBACK STRATEGY

1. **Parallel Running Phase**
   - Run both Firebase and MongoDB simultaneously for 1-2 weeks
   - Verify data consistency
   - Capture any discrepancies

2. **Gradual Migration**
   - Redirect 10% traffic to new API (canary deployment)
   - Monitor error rates and latency
   - Gradually increase traffic (25%, 50%, 100%)

3. **Fallback Plan**
   - Keep Firebase active for 30 days post-migration
   - Maintain read-only mode on Firebase
   - Quick rollback to Firebase if critical issues

4. **Data Backup**
   - Full MongoDB backup before cutover
   - Firebase collections archived
   - Point-in-time recovery capability

---

## CONCLUSION

**Project Readiness:** ✅ Migration Plan Complete

This Wind & Sunset Camp project is well-structured for migration:
- ✅ Clear separation of concerns (UI/API)
- ✅ Consistent Firebase usage pattern
- ✅ No nested Firestore references
- ✅ Straightforward data model

**No Breaking Changes Needed:** All existing React components can remain unchanged when API layer is updated.

**Estimated Timeline:** 11 working days with proper planning and parallel testing.

---

**Generated:** March 10, 2026  
**Analyst:** MERN Stack Architect  
**Status:** Ready for Implementation
