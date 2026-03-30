# Production Deployment Checklist

## 1) Pre-Deployment

- Verify frontend builds locally: `npm run build`
- Verify backend starts locally: `npm run dev` (in `backend/`)
- Confirm production environment variables are set
- Remove temporary debug logs if any remain

## 2) Backend Deployment

- Deploy backend service
- Set runtime variables (`MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN`)
- Verify health endpoint and key API routes

## 3) Frontend Deployment

- Deploy Next.js frontend
- Set `NEXT_PUBLIC_API_URL` to deployed backend base URL
- Verify routing and SSR/static pages load correctly

## 4) Security Verification

- Confirm unauthorized requests return `401/403`
- Confirm admin-only routes are blocked for non-admin users
- Confirm no secrets are exposed to client bundle

## 5) Functional Verification

- Test login/signup/logout
- Test camps listing and booking flow
- Test reviews/contact/gallery pages
- Test admin dashboard, camps, bookings, gallery, messages, users

## 6) Rollback Plan

- Keep last known good frontend and backend releases available
- Roll back frontend and backend together if contract-breaking changes occur
