# Firestore Security Rules Verification Checklist

This checklist helps you verify that the Firestore security rules are working as expected. Use the Firestore Rules Playground in the Firebase Console to simulate requests.

---

### General

- [ ] **Unauthenticated User:** Try to read/write to a random collection (`/test/test`).
  - **Expected:** Fail. (Default deny)

---

### `admins` Collection (`/admins/{adminId}`)

- [ ] **Unauthenticated User:** Try to `read` or `write`.
  - **Expected:** Fail.
- [ ] **Authenticated, Non-Admin User:** Try to `read` or `write`.
  - **Expected:** Fail.
- [ ] **Admin User:** Try to `read`.
  - **Expected:** Succeed.
- [ ] **Admin User:** Try to `write` (create/update/delete).
  - **Expected:** Fail.
- [ ] **Super-Admin User:** Try to `read`.
  - **Expected:** Succeed.
- [ ] **Super-Admin User:** Try to `write` (create/update/delete another admin).
  - **Expected:** Succeed.

---

### `users` Collection (`/users/{userId}`)

- [ ] **Authenticated User:** Try to `create` own user document (`/users/YOUR_UID`).
  - **Expected:** Succeed.
- [ ] **Authenticated User:** Try to `read` or `update` own user document.
  - **Expected:** Succeed.
- [ ] **Authenticated User:** Try to `read` or `write` another user's document.
  - **Expected:** Fail.
- [ ] **Admin User:** Try to `read` or `update` any user document.
  - **Expected:** Succeed.

---

### `bookings` Collection (`/bookings/{bookingId}`)

- [ ] **Unauthenticated User:** Try to `create` a booking.
  - **Expected:** Succeed.
- [ ] **Unauthenticated User:** Try to `read`, `update`, or `delete` a booking.
  - **Expected:** Fail.
- [ ] **Authenticated, Non-Admin User:** Try to `read`, `update`, or `delete` a booking.
  - **Expected:** Fail.
- [ ] **Admin User:** Try to `read`, `update`, and `delete` any booking.
  - **Expected:** Succeed.

---

### `galleryImages`, `camps`, `reviews` (Public Read)

- [ ] **Unauthenticated User:** Try to `read` from `/galleryImages`, `/camps`, and `/reviews`.
  - **Expected:** Succeed.
- [ ] **Unauthenticated User:** Try to `write` to any of these collections.
  - **Expected:** Fail.
- [ ] **Authenticated, Non-Admin User:** Try to `write` to `/galleryImages` or `/camps`.
  - **Expected:** Fail.
- [ ] **Admin User:** Try to `write` (create/update/delete) to `/galleryImages` and `/camps`.
  - **Expected:** Succeed.

---

### `reviews` Collection (Specific Writes)

- [ ] **Authenticated User:** Try to `create` a review where `userId` field matches `request.auth.uid`.
  - **Expected:** Succeed.
- [ ] **Authenticated User:** Try to `create` a review where `userId` field is a different UID.
  - **Expected:** Fail.
- [ ] **Authenticated, Non-Admin User:** Try to `update` or `delete` a review.
  - **Expected:** Fail.
- [ ] **Admin User:** Try to `update` or `delete` any review.
  - **Expected:** Succeed.

---

### `messages` Collection (`/messages/{messageId}`)

- [ ] **Unauthenticated User:** Try to `create` a message.
  - **Expected:** Succeed.
- [ ] **Unauthenticated User:** Try to `read`, `update`, or `delete` a message.
  - **Expected:** Fail.
- [ ] **Authenticated, Non-Admin User:** Try to `read`, `update`, or `delete` a message.
  - **Expected:** Fail.
- [ ] **Admin User:** Try to `read`, `update`, and `delete` any message.
  - **Expected:** Succeed.
