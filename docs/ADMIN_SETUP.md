# Admin Setup Instructions

## Overview

Admin access is controlled by backend user role data.

## Steps

1. Create a user account (or locate an existing one) using the app signup/login flow.
2. In the backend database, set that user's role to an admin role.
3. Log out and log back in so a fresh JWT token reflects updated role permissions.
4. Open `/admin/login` and confirm access to admin routes.

## Verification

- Non-admin users should be blocked from admin endpoints.
- Admin users should be able to access dashboard and management pages.
