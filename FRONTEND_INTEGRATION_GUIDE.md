# Frontend Integration Guide

## Overview

The frontend now uses REST APIs from the Express backend at:

`http://localhost:5000/api`

## Required Frontend Environment

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Client

Use the shared Axios client in `src/lib/api.ts`.

- Automatically uses `NEXT_PUBLIC_API_URL`
- Sends `Authorization: Bearer <token>` when a token exists
- Redirects to `/login` on `401`

## Authentication Flow

- Signup: `POST /auth/signup`
- Login: `POST /auth/login`
- Current user: `GET /auth/me`

Store token after login/signup:

- `localStorage.setItem('token', token)` (preferred)
- `authToken` is still accepted for compatibility

## Core Endpoint Map

- Camps: `GET/POST/PUT/DELETE /camps`
- Bookings: `POST /bookings`, `GET /bookings`, `PATCH /bookings/:id/status`, `DELETE /bookings/:id`
- Reviews: `GET/POST/PUT/DELETE /reviews`
- Gallery: `GET/POST/DELETE /gallery`
- Messages: `POST/GET/DELETE /messages`
- Users: `GET/DELETE /users`
- Admin dashboard: `GET /admin/dashboard/stats`

## Component Pattern

For list pages:

- Use `useEffect` + `api.get(...)`
- Store response in local component state

For form submits:

- Use `api.post(...)`, `api.put(...)`, `api.patch(...)`, or `api.delete(...)`
- Handle success/error with existing UI state and toasts

## Verification

1. Run backend (`backend/`) and frontend (`/`) locally.
2. Confirm login issues a JWT token.
3. Confirm protected admin routes work with that token.
4. Confirm pages load data from backend endpoints.

## Deployment Notes

- Set `NEXT_PUBLIC_API_URL` to production backend URL
- Keep backend CORS origin aligned with frontend URL
- Keep JWT secrets only in backend environment
