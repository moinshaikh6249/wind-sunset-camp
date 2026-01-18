# Production Deployment Checklist for Firebase App Hosting

As a senior Firebase DevOps engineer, here is your comprehensive checklist for deploying your Next.js application to Firebase App Hosting.

---

## 1. Pre-Deployment Checks

These steps ensure your codebase is clean, secure, and ready for a production build.

- [ ] **Environment Variables (`.env`)**
    -   Create a `.env.production.local` file for production-specific secrets.
    -   Ensure all `NEXT_PUBLIC_` variables for your **production** Firebase project are correctly set.
    -   Verify that any server-side secrets (if any) are NOT prefixed with `NEXT_PUBLIC_`.
    -   **Action:** Your environment variables are loaded from the environment your App Hosting backend runs in. You must set these as secrets using the `firebase apphosting:secrets:set` command or in the Google Cloud Secret Manager UI.

- [ ] **Code Cleanup**
    -   Search the codebase for and remove any temporary `console.log`, `console.error`, or other debugging statements not intended for production.

- [ ] **Production Firebase Configuration**
    -   Double-check that your environment variables point to your **production** Firebase project, not a development or test project. This is the most common deployment mistake.

- [ ] **Firestore Rules Backup**
    -   Before deploying, it's wise to have a backup of your `firestore.rules`.
    -   **Reference:** See `docs/FIRESTORE_BACKUP.md` for best practices. Your rules are version-controlled in this project, which is excellent.

- [ ] **Local Production Build**
    -   Run `npm run build` locally to ensure there are no build errors. This catches TypeScript errors, dependency issues, and other problems before they reach the deployment pipeline.

- [ ] **Commit Changes**
    -   Commit all your final code changes to your Git repository. App Hosting deploys directly from your Git commits.

---

## 2. Deployment to Firebase App Hosting

Your project is configured for Firebase App Hosting, which uses `apphosting.yaml` and deploys from a connected Git repository.

- [ ] **Connect Git Repository**
    -   In the Firebase Console, navigate to **Build > App Hosting**.
    -   Follow the prompts to connect your GitHub repository to the backend.

- [ ] **Configure `apphosting.yaml`**
    -   Your `apphosting.yaml` is already configured for a standard Next.js app. For most use cases, no changes are needed.
    -   **Cache Headers & Rewrites:** App Hosting provides optimized defaults for Next.js, including caching for static assets and rewrite rules for SPAs. You generally do not need to configure these manually.

- [ ] **Deploy**
    -   **Automatic Deploys:** Pushing a commit to your connected main branch will automatically trigger a new deployment.
    -   **Manual Deploys:** You can trigger a deploy from a specific commit hash using the Firebase CLI:
        ```bash
        firebase apphosting:backends:deploy <backend-id> --source <commit-hash>
        ```
    -   **Preview Channels:** To deploy to a preview channel without affecting production, push your changes to a non-main branch. App Hosting will generate a unique preview URL for that branch.

---

## 3. Post-Deployment Verification

After a deployment is live, immediately run through this checklist on the production URL.

- [ ] **Route Testing**
    -   Visit all public pages: Homepage, About, Camps, Gallery, Reviews, Contact.
    -   Check for 404 errors or broken links.

- [ ] **Authentication Flow**
    -   Test user signup.
    -   Test user login and logout.
    -   Test admin login.

- [ ] **Core Functionality Testing**
    -   **As User:** Create a booking, leave a review, and verify it appears correctly on the dashboard.
    -   **As Admin:** View the admin dashboard, approve/cancel a booking, and manage a camp or gallery image.
    -   **Contact Form:** Submit a message and verify it appears in the admin inbox.

- [ ] **Firestore Permissions**
    -   Use the `docs/VERIFICATION_CHECKLIST.md` as a guide to manually test that security rules are being enforced correctly. Try to perform an action you shouldn't be able to (e.g., as a user, try to access `/admin`).

---

## 4. Final Security & Health Checks

- [ ] **API Key Exposure**
    -   Your client-side API keys (`NEXT_PUBLIC_*`) are designed to be public. Security is enforced by your Firestore Rules, not by hiding these keys.
    -   Ensure no server-side credentials (e.g., service account keys) are in your frontend code. Your current setup using `firebase-admin` with Application Default Credentials is secure.

- [ ] **Firestore Rules Deployment**
    -   App Hosting's CI/CD pipeline automatically deploys your `firestore.rules` file when it detects changes. Verify in the Firebase Console under **Firestore Database > Rules** that the deployed rules match your committed file.

- [ ] **Disable Debug Mode**
    -   Next.js automatically creates a production-optimized build, so no manual action is needed here.

---

## 5. Rollback Strategy

If a deployment introduces a critical bug, you can quickly revert to a previous working version.

-   **Steps:**
    1.  Go to the Firebase Console -> App Hosting.
    2.  Select your backend.
    3.  In the "Deployments" tab, you will see a history of all your deployments, each linked to a Git commit.
    4.  Find the last known good deployment and click the "Redeploy" button (or similar option) to roll back to that version.
    5.  Alternatively, use the Firebase CLI to redeploy a specific, known-good commit hash.

By following this checklist, you can ensure smooth, secure, and reliable deployments for your application.
