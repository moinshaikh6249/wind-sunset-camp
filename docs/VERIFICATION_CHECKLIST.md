# API Authorization Verification Checklist

This checklist verifies backend route protections and role-based access.

## General

- [ ] Unauthenticated request to protected route returns `401`
- [ ] Authenticated non-admin request to admin route returns `403`
- [ ] Admin request to admin route succeeds

## Auth

- [ ] Signup succeeds with valid payload
- [ ] Login succeeds and returns token
- [ ] `GET /auth/me` works with valid token

## Public Endpoints

- [ ] Camps listing is accessible
- [ ] Gallery listing is accessible
- [ ] Reviews listing is accessible
- [ ] Contact submission works

## Protected User Endpoints

- [ ] Creating bookings requires valid auth where applicable
- [ ] User can access own dashboard data

## Admin Endpoints

- [ ] Dashboard stats endpoint is admin-only
- [ ] Admin can manage camps/bookings/gallery/messages/users

## Regression

- [ ] Home, Camps, Gallery, Reviews, Contact, Booking, Dashboard pages load
- [ ] Admin dashboard pages load for admin session
