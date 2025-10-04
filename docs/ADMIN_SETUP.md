
# Admin Setup Instructions

To gain admin access to the application, you need to set a custom claim on your user account in Firebase. This is a one-time setup.

There are two primary ways to do this:

## Method 1: Using the Firebase Admin SDK in a Script

This is the most common method. You will need Node.js installed on your machine.

1.  **Create a User Account**: First, make sure you have signed up for a regular user account in the application with the email you want to be admin.

2.  **Get Your User UID**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/).
    *   Select your project.
    *   Navigate to **Authentication** -> **Users** tab.
    *   Find your user account and copy the **User UID**.

3.  **Set up the Admin Script**:
    *   Create a new folder on your computer (e.g., `admin-scripts`).
    *   Inside that folder, create two files: `package.json` and `set-admin.js`.

4.  **`package.json` file**:
    ```json
    {
      "name": "admin-scripts",
      "version": "1.0.0",
      "main": "set-admin.js",
      "type": "module",
      "dependencies": {
        "firebase-admin": "^12.0.0"
      }
    }
    ```

5.  **`set-admin.js` file**:
    *   **IMPORTANT**: Replace `'<YOUR_USER_UID>'` with the UID you copied in step 2.
    *   **IMPORTANT**: You need to provide your service account credentials. See step 6.

    ```javascript
    import admin from 'firebase-admin';
    import { readFile } from 'fs/promises';

    // --- CONFIGURATION ---
    const serviceAccount = JSON.parse(
      await readFile(
        new URL('./serviceAccountKey.json', import.meta.url)
      )
    );
    const userUid = '<YOUR_USER_UID>'; // <-- ‼️ PASTE YOUR USER UID HERE
    // ---------------------


    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    // Set admin custom claim
    admin.auth().setCustomUserClaims(userUid, { isAdmin: true })
      .then(() => {
        console.log(`✅ Successfully set admin claim for user: ${userUid}`);
        console.log('You can now log in as an admin.');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error setting custom claim:', error);
        process.exit(1);
      });
    ```

6.  **Get Service Account Key**:
    *   In the Firebase Console, go to **Project settings** (click the gear icon ⚙️).
    *   Go to the **Service accounts** tab.
    *   Click **Generate new private key**.
    *   A JSON file will be downloaded. Rename this file to `serviceAccountKey.json` and place it in the same `admin-scripts` folder.
    *   **WARNING**: Keep this file secure. Do not commit it to version control.

7.  **Run the Script**:
    *   Open your terminal in the `admin-scripts` folder.
    *   Run `npm install` to install the `firebase-admin` package.
    *   Run `node set-admin.js`.

    If successful, you will see a success message.

## Method 2: Using a Temporary Cloud Function

If you are more comfortable with Cloud Functions, you can deploy a temporary function to set the claim.

1. **Deploy the Cloud Function**:
   Use the Firebase CLI to deploy a callable Cloud Function like this:

   ```javascript
   // In your index.js or main.js for Cloud Functions
   const { onCall } = require("firebase-functions/v2/https");
   const admin = require("firebase-admin");
   admin.initializeApp();

   exports.makeAdmin = onCall((request) => {
     // Note: This is insecure for production. It should be protected.
     // This is only for a one-time setup.
     const uid = request.data.uid;
     return admin.auth().setCustomUserClaims(uid, { isAdmin: true })
       .then(() => {
         return { message: `Success! ${uid} is now an admin.` };
       })
       .catch(err => {
         return err;
       });
   });
   ```

2. **Call the function**: Once deployed, you can call this function from your client-side code (or a simple script) to give a specific UID admin rights. **Remember to delete or secure this function after you've set your claim.**

---

## Final Step

After setting the claim, you need to **log out and log back in** to the application. Firebase ID tokens are refreshed hourly, so logging back in will force a refresh and your new `isAdmin` claim will be recognized.
